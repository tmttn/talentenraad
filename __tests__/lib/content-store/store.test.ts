// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConflictError, ContentStoreError } from '@lib/content-store/errors';
import { isEditingConfigured, latestDeployStatus, listDir, readFile } from '@lib/content-store/github';
import { commitChanges, pathsUnder } from '@lib/content-store/store';
import { blobSha, createFakeGitHub, REPO, TOKEN } from './github-mock';

const author = { name: 'Talentenraad-editor', email: 'noreply@talentenraad.be' };
const A = 'content/activiteiten/a/index.md';
const AIMG = 'content/activiteiten/a/afbeelding.jpg';
const FAQ = 'content/faq/vraag.md';

let gh: ReturnType<typeof createFakeGitHub>;

beforeEach(() => {
  gh = createFakeGitHub({ [A]: 'oud', [AIMG]: 'img', [FAQ]: 'faq', 'README.md': 'x' });
  vi.stubEnv('GITHUB_CONTENT_TOKEN', TOKEN);
  vi.stubEnv('GITHUB_REPO', REPO);
  vi.stubEnv('GITHUB_BRANCH', 'main');
  vi.stubGlobal('fetch', gh.fetchMock);
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const caught = async (promise: Promise<unknown>) => {
  try {
    await promise;
  } catch (error) {
    return error as Error;
  }
  throw new Error('expected rejection');
};

describe('isEditingConfigured', () => {
  it('is true with a token and false without', () => {
    expect(isEditingConfigured()).toBe(true);
    vi.stubEnv('GITHUB_CONTENT_TOKEN', '');
    expect(isEditingConfigured()).toBe(false);
  });

  it('reads env at call time and refuses network calls without a token', async () => {
    vi.stubEnv('GITHUB_CONTENT_TOKEN', '');
    const error = await caught(readFile(A));
    expect(error).toBeInstanceOf(ContentStoreError);
    expect(gh.calls).toHaveLength(0);
  });
});

describe('readFile / listDir', () => {
  it('reads text and sha, sending the right headers and ref', async () => {
    const file = await readFile(A);
    expect(file).toEqual({ text: 'oud', sha: blobSha('oud') });
    expect(gh.calls[0].path).toBe(`/contents/${A}?ref=main`);
    const init = gh.fetchMock.mock.calls[0][1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe(`Bearer ${TOKEN}`);
    expect(headers['X-GitHub-Api-Version']).toBe('2022-11-28');
    expect(headers['User-Agent']).toBeTruthy();
  });

  it('returns undefined on 404', async () => {
    expect(await readFile('content/faq/nope.md')).toBeUndefined();
  });

  it('falls back to the blob API for large files', async () => {
    gh.large.add(A);
    const file = await readFile(A);
    expect(file?.text).toBe('oud');
    expect(gh.calls.map(call => call.path)).toContain(`/git/blobs/${blobSha('oud')}`);
  });

  it('lists a directory', async () => {
    const items = await listDir('content/activiteiten/a');
    expect(items.map(item => item.name).toSorted()).toEqual(['afbeelding.jpg', 'index.md']);
    expect(items[0]).toMatchObject({ type: 'file', path: expect.stringContaining('content/') });
  });

  it('returns an empty list for a missing directory', async () => {
    expect(await listDir('content/team')).toEqual([]);
  });

  it('rejects paths outside the whitelist before any network call', async () => {
    await expect(readFile('../package.json')).rejects.toThrow();
    await expect(listDir('app')).rejects.toThrow();
    expect(gh.calls).toHaveLength(0);
  });
});

describe('pathsUnder', () => {
  it('lists all files under a directory at head', async () => {
    expect((await pathsUnder('content/activiteiten/a')).toSorted()).toEqual([AIMG, A].toSorted());
  });
});

describe('commitChanges', () => {
  it('makes one commit with blob, tree (mode 100644), commit and fast-forward ref update', async () => {
    const { commitSha } = await commitChanges({
      message: 'content: wijzig activiteit "A"',
      author,
      changes: [
        { path: A, content: 'nieuw', expectedSha: blobSha('oud') },
        { path: 'content/nieuws/n/index.md', content: Buffer.from('n'), expectedSha: null },
        { path: AIMG, delete: true, expectedSha: blobSha('img') },
      ],
    });
    expect(commitSha).toBe(gh.head);
    const sequence = gh.calls.map(call => `${call.method} ${call.path.split('?')[0]}`);
    expect(sequence[0]).toBe('GET /git/ref/heads/main');
    expect(sequence.at(-3)).toBe('POST /git/trees');
    expect(sequence.at(-2)).toBe('POST /git/commits');
    expect(sequence.at(-1)).toBe('PATCH /git/refs/heads/main');
    expect(sequence.filter(s => s === 'POST /git/blobs')).toHaveLength(2);

    const tree = gh.calls.find(call => call.path === '/git/trees')!.body as {
      base_tree: string;
      tree: { path: string; mode: string; type: string; sha: string | null }[];
    };
    expect(tree.base_tree).toBe('tree-c0');
    expect(tree.tree).toHaveLength(3);
    expect(tree.tree.every(entry => entry.mode === '100644' && entry.type === 'blob')).toBe(true);
    expect(tree.tree.find(entry => entry.path === AIMG)?.sha).toBeNull();

    const commit = gh.calls.find(call => call.path === '/git/commits')!.body as Record<string, unknown>;
    expect(commit).toMatchObject({ message: 'content: wijzig activiteit "A"', parents: ['c0'], author: expect.objectContaining(author), committer: expect.objectContaining(author) });
    const patch = gh.calls.at(-1)!.body;
    expect(patch).toEqual({ sha: commitSha, force: false });

    const files = gh.currentFiles();
    expect(files.get(A)?.data.toString()).toBe('nieuw');
    expect(files.has(AIMG)).toBe(false);
    expect(files.get('content/nieuws/n/index.md')?.data.toString()).toBe('n');
  });

  it('allows changes without expectedSha', async () => {
    await commitChanges({ message: 'm', author, changes: [{ path: A, content: 'zonder' }] });
    expect(gh.currentFiles().get(A)?.data.toString()).toBe('zonder');
  });

  it('throws ConflictError when the sha changed, committing nothing', async () => {
    gh.externalCommit(A, 'iemand anders');
    const error = await caught(commitChanges({ message: 'm', author, changes: [{ path: A, content: 'mijn', expectedSha: blobSha('oud') }] }));
    expect(error).toBeInstanceOf(ConflictError);
    expect(error.message).toBe('Iemand anders heeft dit net aangepast. Herlaad de pagina.');
    expect(gh.calls.some(call => call.method !== 'GET')).toBe(false);
    expect(gh.currentFiles().get(A)?.data.toString()).toBe('iemand anders');
  });

  it('throws ConflictError when expectedSha is null but the file exists', async () => {
    const error = await caught(commitChanges({ message: 'm', author, changes: [{ path: A, content: 'x', expectedSha: null }] }));
    expect(error).toBeInstanceOf(ConflictError);
    expect(gh.calls.some(call => call.method !== 'GET')).toBe(false);
  });

  it('throws ConflictError when a file to update was deleted meanwhile', async () => {
    gh.externalCommit(A, null);
    const error = await caught(commitChanges({ message: 'm', author, changes: [{ path: A, content: 'x', expectedSha: blobSha('oud') }] }));
    expect(error).toBeInstanceOf(ConflictError);
  });

  it('retries once on 422 and succeeds on the new head', async () => {
    gh.patchFailures = 1;
    gh.onPatchFail = () => gh.externalCommit(FAQ, 'andere wijziging');
    const { commitSha } = await commitChanges({ message: 'm', author, changes: [{ path: A, content: 'nieuw', expectedSha: blobSha('oud') }] });
    expect(gh.head).toBe(commitSha);
    const files = gh.currentFiles();
    expect(files.get(A)?.data.toString()).toBe('nieuw');
    expect(files.get(FAQ)?.data.toString()).toBe('andere wijziging');
    expect(gh.calls.filter(call => call.method === 'PATCH')).toHaveLength(2);
  });

  it('re-checks expected shas on retry and conflicts when the same file changed', async () => {
    gh.patchFailures = 1;
    gh.onPatchFail = () => gh.externalCommit(A, 'iemand anders');
    const error = await caught(commitChanges({ message: 'm', author, changes: [{ path: A, content: 'nieuw', expectedSha: blobSha('oud') }] }));
    expect(error).toBeInstanceOf(ConflictError);
    expect(gh.currentFiles().get(A)?.data.toString()).toBe('iemand anders');
  });

  it('throws ConflictError after a second 422', async () => {
    gh.patchFailures = 2;
    const error = await caught(commitChanges({ message: 'm', author, changes: [{ path: A, content: 'nieuw' }] }));
    expect(error).toBeInstanceOf(ConflictError);
    expect(gh.calls.filter(call => call.method === 'PATCH')).toHaveLength(2);
  });

  it('rejects disallowed paths before any network call', async () => {
    const bad = ['../x', '/etc/passwd', 'content/activiteiten/X/index.md', 'content/other/a.md', '.github/workflows/deploy.yml'];
    for (const path of bad) {
      await expect(commitChanges({ message: 'm', author, changes: [{ path, content: 'x' }] })).rejects.toThrow();
    }
    await expect(commitChanges({ message: 'm', author, changes: [{ path: A, content: 'x' }, { path: '../x', content: 'x' }] })).rejects.toThrow();
    expect(gh.calls).toHaveLength(0);
  });

  it('rejects empty changes and duplicate paths without network calls', async () => {
    await expect(commitChanges({ message: 'm', author, changes: [] })).rejects.toThrow();
    await expect(commitChanges({ message: 'm', author, changes: [{ path: A, content: 'a' }, { path: A, delete: true }] })).rejects.toThrow();
    expect(gh.calls).toHaveLength(0);
  });
});

describe('error handling', () => {
  it('never leaks the token in error messages or logs', async () => {
    gh.errorStatus = 401;
    const errors = [
      await caught(readFile(A)),
      await caught(listDir('content/faq')),
      await caught(commitChanges({ message: 'm', author, changes: [{ path: A, content: 'x' }] })),
      await caught(pathsUnder('content/faq')),
    ];
    for (const error of errors) {
      expect(error).toBeInstanceOf(ContentStoreError);
      expect(error.message).not.toContain(TOKEN);
      expect(String(error.stack)).not.toContain(TOKEN);
      expect((error as ContentStoreError).status).toBe(401);
    }
    const logged = JSON.stringify(vi.mocked(console.error).mock.calls);
    expect(logged).not.toContain(TOKEN);
    expect(logged).toContain('401');
  });

  it('wraps network failures safely', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error(`connect failed with ${TOKEN}`);
    }));
    const error = await caught(readFile(A));
    expect(error).toBeInstanceOf(ContentStoreError);
    expect(error.message).not.toContain(TOKEN);
  });
});

describe('latestDeployStatus', () => {
  const run = (status: string, conclusion: string | null) => {
    gh.runs = [{ status, conclusion, created_at: '2026-11-01T10:00:00Z', run_started_at: '2026-11-01T10:00:05Z' }];
    return latestDeployStatus();
  };

  it.each([
    ['queued', null, 'bezig'],
    ['in_progress', null, 'bezig'],
    ['completed', 'success', 'klaar'],
    ['completed', 'failure', 'mislukt'],
    ['completed', 'cancelled', 'mislukt'],
    ['completed', 'skipped', 'onbekend'],
  ])('maps %s/%s to %s', async (status, conclusion, state) => {
    const result = await run(status, conclusion);
    expect(result.state).toBe(state);
    expect(result.startedAt).toBe('2026-11-01T10:00:05Z');
  });

  it('is onbekend without runs, and requests the latest run on the branch', async () => {
    gh.runs = [];
    expect(await latestDeployStatus()).toEqual({ state: 'onbekend' });
    expect(gh.calls[0].path).toBe('/actions/workflows/deploy.yml/runs?branch=main&per_page=1');
  });

  it('is onbekend (no throw) when GitHub fails', async () => {
    gh.errorStatus = 500;
    expect(await latestDeployStatus()).toEqual({ state: 'onbekend' });
  });
});
