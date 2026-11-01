import { ConflictError, ContentStoreError } from './errors';
import { api, getConfig } from './github';
import { assertAllowedDir, assertAllowedPath } from './paths';

export { readFile as readItemFile, listDir as listItems } from './github';

export type Change = {
  path: string;
  content?: Buffer | string;
  delete?: true;
  expectedSha?: string | null;
};

type TreeListing = { tree: { path: string; type: string; sha: string }[]; truncated?: boolean };

async function headTree(): Promise<{ head: string; treeSha: string; files: Map<string, string> }> {
  const { branch } = getConfig();
  const ref = await api('GET', `/git/ref/heads/${encodeURIComponent(branch)}`);
  const head = (ref.data as { object: { sha: string } }).object.sha;
  const commit = await api('GET', `/git/commits/${head}`);
  const treeSha = (commit.data as { tree: { sha: string } }).tree.sha;
  const listing = (await api('GET', `/git/trees/${treeSha}?recursive=1`)).data as TreeListing;
  if (listing.truncated) {
    throw new ContentStoreError('De repository is te groot om te lezen.');
  }

  const files = new Map<string, string>();
  for (const entry of listing.tree) {
    if (entry.type === 'blob') {
      files.set(entry.path, entry.sha);
    }
  }

  return { head, treeSha, files };
}

/** All file paths under `dir` at the head of the configured branch. */
export async function pathsUnder(dir: string): Promise<string[]> {
  assertAllowedDir(dir);
  const { files } = await headTree();
  return [...files.keys()].filter(path => path.startsWith(`${dir}/`));
}

class NotFastForward extends Error {}

async function attempt(options: {
  message: string;
  author: { name: string; email: string };
  changes: Change[];
}): Promise<string> {
  const { branch } = getConfig();
  const { head, treeSha, files } = await headTree();

  for (const change of options.changes) {
    if (change.expectedSha === undefined) {
      continue;
    }

    if ((files.get(change.path) ?? null) !== change.expectedSha) {
      throw new ConflictError();
    }
  }

  const entries: { path: string; mode: '100644'; type: 'blob'; sha: string | null }[] = [];
  for (const change of options.changes) {
    if (change.delete) {
      entries.push({ path: change.path, mode: '100644', type: 'blob', sha: null });
      continue;
    }

    const data = Buffer.from(change.content ?? '');
    const blob = await api('POST', '/git/blobs', { body: { content: data.toString('base64'), encoding: 'base64' } });
    entries.push({ path: change.path, mode: '100644', type: 'blob', sha: (blob.data as { sha: string }).sha });
  }

  const tree = await api('POST', '/git/trees', { body: { base_tree: treeSha, tree: entries } });
  const identity = { ...options.author, date: new Date().toISOString() };
  const commit = await api('POST', '/git/commits', {
    body: {
      message: options.message,
      tree: (tree.data as { sha: string }).sha,
      parents: [head],
      author: identity,
      committer: identity,
    },
  });
  const commitSha = (commit.data as { sha: string }).sha;

  const update = await api('PATCH', `/git/refs/heads/${encodeURIComponent(branch)}`, {
    body: { sha: commitSha, force: false },
    allow: [422],
  });
  if (update.status === 422) {
    throw new NotFastForward();
  }

  return commitSha;
}

/**
 * Writes all changes in one commit on the configured branch. Expected blob SHAs
 * are checked against the head; the ref update is fast-forward only, with one
 * retry on a fresh head before giving up with a ConflictError.
 */
export async function commitChanges(options: {
  message: string;
  author: { name: string; email: string };
  changes: Change[];
}): Promise<{ commitSha: string }> {
  if (options.changes.length === 0) {
    throw new ContentStoreError('Er zijn geen wijzigingen om op te slaan.');
  }

  const seen = new Set<string>();
  for (const change of options.changes) {
    assertAllowedPath(change.path);
    if (seen.has(change.path)) {
      throw new ContentStoreError('Hetzelfde bestand staat twee keer in de wijziging.');
    }

    seen.add(change.path);
  }

  for (let round = 0; round < 2; round += 1) {
    try {
      return { commitSha: await attempt(options) };
    } catch (error) {
      if (!(error instanceof NotFastForward)) {
        throw error;
      }
    }
  }

  throw new ConflictError();
}
