import { vi } from 'vitest';

export const TOKEN = 'ghp_SECRET_TOKEN_123';
export const REPO = 'tmttn/talentenraad';

export type Call = { method: string; path: string; body?: Record<string, unknown> };

type Snapshot = Map<string, { sha: string; data: Buffer }>;

export function blobSha(data: Buffer | string): string {
  const text = Buffer.from(data).toString('utf8');
  return `blob-${text.length}-${text.slice(0, 12).replaceAll(/\W/g, '_')}`;
}

export function createFakeGitHub(initial: Record<string, string>) {
  const calls: Call[] = [];
  const blobs = new Map<string, Buffer>();
  const snapshots = new Map<string, Snapshot>();
  const commits = new Map<string, string>(); // commit sha -> tree sha
  const large = new Set<string>();
  let counter = 0;
  let head = 'c0';

  const first: Snapshot = new Map();
  for (const [path, text] of Object.entries(initial)) {
    const data = Buffer.from(text);
    first.set(path, { sha: blobSha(data), data });
    blobs.set(blobSha(data), data);
  }
  snapshots.set('tree-c0', first);
  commits.set('c0', 'tree-c0');

  const state = {
    calls,
    large,
    patchFailures: 0,
    onPatchFail: undefined as (() => void) | undefined,
    errorStatus: undefined as number | undefined,
    get head() {
      return head;
    },
    /** Simulate someone else committing a file change on main. */
    externalCommit(path: string, text: string | null) {
      const base = new Map(snapshots.get(commits.get(head)!)!);
      if (text === null) {
        base.delete(path);
      } else {
        const data = Buffer.from(text);
        base.set(path, { sha: blobSha(data), data });
        blobs.set(blobSha(data), data);
      }
      counter += 1;
      const tree = `tree-ext${counter}`;
      const commit = `cext${counter}`;
      snapshots.set(tree, base);
      commits.set(commit, tree);
      head = commit;
    },
    currentFiles() {
      return snapshots.get(commits.get(head)!)!;
    },
  };

  const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

  const fetchMock = vi.fn(async (input: string | URL, init?: RequestInit) => {
    const url = new URL(String(input));
    const method = init?.method ?? 'GET';
    const body = init?.body ? JSON.parse(String(init.body)) as Record<string, unknown> : undefined;
    const prefix = `/repos/${REPO}`;
    const path = url.pathname.slice(prefix.length);
    calls.push({ method, path: path + url.search, body });

    if (state.errorStatus) {
      return json(state.errorStatus, { message: `bad credentials ${TOKEN}` });
    }

    if (method === 'GET' && path.startsWith('/contents/')) {
      const filePath = decodeURIComponent(path.slice('/contents/'.length));
      const file = snapshots.get(commits.get(head)!)!.get(filePath);
      if (file) {
        const isLarge = large.has(filePath);
        return json(200, {
          type: 'file',
          sha: file.sha,
          encoding: isLarge ? 'none' : 'base64',
          content: isLarge ? '' : file.data.toString('base64'),
        });
      }
      const children = [...snapshots.get(commits.get(head)!)!.entries()].filter(([p]) => p.startsWith(`${filePath}/`));
      if (children.length === 0) {
        return json(404, { message: 'Not Found' });
      }
      const seen = new Map<string, unknown>();
      for (const [p, f] of children) {
        const rest = p.slice(filePath.length + 1);
        const [name] = rest.split('/');
        seen.set(name, rest.includes('/')
          ? { name, path: `${filePath}/${name}`, type: 'dir', sha: 'dir-sha' }
          : { name, path: p, type: 'file', sha: f.sha });
      }
      return json(200, [...seen.values()]);
    }
    if (method === 'GET' && path.startsWith('/git/blobs/')) {
      const data = blobs.get(path.slice('/git/blobs/'.length));
      return data ? json(200, { content: data.toString('base64'), encoding: 'base64' }) : json(404, {});
    }
    if (method === 'GET' && path === '/git/ref/heads/main') {
      return json(200, { object: { sha: head } });
    }
    if (method === 'GET' && path.startsWith('/git/commits/')) {
      return json(200, { tree: { sha: commits.get(path.slice('/git/commits/'.length)) } });
    }
    if (method === 'GET' && path.startsWith('/git/trees/')) {
      const snap = snapshots.get(path.slice('/git/trees/'.length))!;
      return json(200, {
        truncated: false,
        tree: [...snap.entries()].map(([p, f]) => ({ path: p, mode: '100644', type: 'blob', sha: f.sha })),
      });
    }
    if (method === 'POST' && path === '/git/blobs') {
      const data = Buffer.from(String(body!.content), 'base64');
      const sha = blobSha(data);
      blobs.set(sha, data);
      return json(201, { sha });
    }
    if (method === 'POST' && path === '/git/trees') {
      const next = new Map(snapshots.get(String(body!.base_tree))!);
      for (const entry of body!.tree as { path: string; sha: string | null }[]) {
        if (entry.sha === null) {
          next.delete(entry.path);
        } else {
          next.set(entry.path, { sha: entry.sha, data: blobs.get(entry.sha)! });
        }
      }
      counter += 1;
      const sha = `tree-new${counter}`;
      snapshots.set(sha, next);
      return json(201, { sha });
    }
    if (method === 'POST' && path === '/git/commits') {
      counter += 1;
      const sha = `cnew${counter}`;
      commits.set(sha, String(body!.tree));
      return json(201, { sha });
    }
    if (method === 'PATCH' && path === '/git/refs/heads/main') {
      if (state.patchFailures > 0) {
        state.patchFailures -= 1;
        state.onPatchFail?.();
        return json(422, { message: 'Update is not a fast forward' });
      }
      head = String(body!.sha);
      return json(200, {});
    }
    if (method === 'GET' && path.startsWith('/actions/workflows/deploy.yml/runs')) {
      const sha = /head_sha=([^&]+)/.exec(url.search)?.[1];
      const all = (state.runs ?? []) as { head_sha?: string }[];
      return json(200, { workflow_runs: sha ? all.filter(run => run.head_sha === sha) : all });
    }
    return json(404, { message: 'Not Found' });
  });

  return Object.assign(state, { fetchMock }) as typeof state & { fetchMock: typeof fetchMock; runs?: unknown[] };
}
