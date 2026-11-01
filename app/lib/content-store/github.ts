import { ContentStoreError } from './errors';
import { assertAllowedDir, assertAllowedPath } from './paths';

const API = 'https://api.github.com';

export type DirEntry = { name: string; path: string; type: string; sha: string };
export type DeployState = 'bezig' | 'klaar' | 'mislukt' | 'onbekend';

type Config = { token: string; repo: string; branch: string };

export function isEditingConfigured(): boolean {
  return Boolean(process.env.GITHUB_CONTENT_TOKEN);
}

export function getConfig(): Config {
  const token = process.env.GITHUB_CONTENT_TOKEN;
  if (!token) {
    throw new ContentStoreError('Bewerken is nog niet ingesteld.');
  }

  return {
    token,
    repo: process.env.GITHUB_REPO || 'tmttn/talentenraad',
    branch: process.env.GITHUB_BRANCH || 'main',
  };
}

function messageFor(status: number): string {
  if (status === 401 || status === 403) {
    return 'De toegang tot GitHub is geweigerd. Controleer het token.';
  }

  if (status === 404) {
    return 'Niet gevonden op GitHub.';
  }

  if (status === 429) {
    return 'GitHub vraagt om even te wachten. Probeer het zo meteen opnieuw.';
  }

  return 'GitHub gaf een fout. Probeer het later opnieuw.';
}

const MALFORMED = 'GitHub gaf een onverwacht antwoord. Probeer het later opnieuw.';

/** Reads a required string field from an API response or throws a safe error. */
export function field(value: unknown, ...keys: string[]): string {
  let current: unknown = value;
  for (const key of keys) {
    current = typeof current === 'object' && current !== null ? (current as Record<string, unknown>)[key] : undefined;
  }

  if (typeof current !== 'string' || current === '') {
    throw new ContentStoreError(MALFORMED);
  }

  return current;
}

export type ApiResult = { status: number; data: unknown };

/**
 * Calls the GitHub API for the configured repo. Statuses listed in `allow` are
 * returned instead of thrown. Errors never include the token or response bodies.
 */
export async function api(
  method: string,
  path: string,
  options: { body?: unknown; allow?: number[] } = {},
): Promise<ApiResult> {
  const { token, repo } = getConfig();
  let response: Response;
  try {
    response = await fetch(`${API}/repos/${repo}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'talentenraad-editor',
        ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    console.error('GitHub request failed (network)', method, path.split('?')[0]);
    throw new ContentStoreError('GitHub is niet bereikbaar. Probeer het later opnieuw.');
  }

  if (!response.ok && !options.allow?.includes(response.status)) {
    console.error('GitHub request failed', response.status, method, path.split('?')[0]);
    throw new ContentStoreError(messageFor(response.status), response.status);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    data = undefined;
  }

  return { status: response.status, data };
}

function encodePath(path: string): string {
  return path.split('/').map(part => encodeURIComponent(part)).join('/');
}

export async function readFile(path: string): Promise<{ text: string; sha: string } | undefined> {
  assertAllowedPath(path);
  const { branch } = getConfig();
  const { status, data } = await api('GET', `/contents/${encodePath(path)}?ref=${encodeURIComponent(branch)}`, { allow: [404] });
  if (status === 404) {
    return undefined;
  }

  if (Array.isArray(data) || field(data, 'type') !== 'file') {
    throw new ContentStoreError('Dit is geen bestand.');
  }

  const sha = field(data, 'sha');
  const inline = (data as { content?: unknown; encoding?: unknown });
  if (inline.encoding === 'base64' && typeof inline.content === 'string' && inline.content !== '') {
    return { text: Buffer.from(inline.content, 'base64').toString('utf8'), sha };
  }

  // Files over 1 MB come back without content: fetch the blob instead.
  const blob = await api('GET', `/git/blobs/${encodeURIComponent(sha)}`);
  return { text: Buffer.from(field(blob.data, 'content'), 'base64').toString('utf8'), sha };
}

export async function listDir(path: string): Promise<DirEntry[]> {
  assertAllowedDir(path);
  const { branch } = getConfig();
  const { status, data } = await api('GET', `/contents/${encodePath(path)}?ref=${encodeURIComponent(branch)}`, { allow: [404] });
  if (status === 404 || !Array.isArray(data)) {
    return [];
  }

  return data.map(item => ({
    name: field(item, 'name'),
    path: field(item, 'path'),
    type: field(item, 'type'),
    sha: field(item, 'sha'),
  }));
}

type Run = { status: string; conclusion: string | null; run_started_at?: string; created_at?: string };

const runsPath = (branch: string, headSha?: string) =>
  `/actions/workflows/deploy.yml/runs?branch=${encodeURIComponent(branch)}&per_page=1${headSha ? `&head_sha=${headSha}` : ''}`;

async function newestRun(branch: string, headSha?: string): Promise<Run | undefined> {
  const { data } = await api('GET', runsPath(branch, headSha));
  const runs = (data as { workflow_runs?: unknown } | undefined)?.workflow_runs;
  return Array.isArray(runs) ? runs[0] as Run | undefined : undefined;
}

function stateOf(run: Run): { state: DeployState; startedAt?: string } {
  const startedAt = run.run_started_at ?? run.created_at;
  if (run.status !== 'completed') {
    return { state: 'bezig', startedAt };
  }

  if (run.conclusion === 'success') {
    return { state: 'klaar', startedAt };
  }

  if (['failure', 'cancelled', 'timed_out', 'startup_failure'].includes(run.conclusion ?? '')) {
    return { state: 'mislukt', startedAt };
  }

  return { state: 'onbekend', startedAt };
}

/**
 * Deploy state of the newest run on the branch. With `commit`, the run for that commit:
 * no run yet means 'bezig'; a cancelled run was replaced by a newer run (concurrency
 * group) that includes the commit, so the newest run on the branch decides.
 */
export async function latestDeployStatus(commit?: string): Promise<{ state: DeployState; startedAt?: string }> {
  try {
    const { branch } = getConfig();
    if (commit === undefined) {
      const run = await newestRun(branch);
      return run ? stateOf(run) : { state: 'onbekend' };
    }

    const own = await newestRun(branch, commit);
    if (!own) {
      return { state: 'bezig' };
    }

    if (own.status === 'completed' && own.conclusion === 'cancelled') {
      const newest = await newestRun(branch);
      return newest ? stateOf(newest) : { state: 'onbekend' };
    }

    return stateOf(own);
  } catch {
    return { state: 'onbekend' };
  }
}
