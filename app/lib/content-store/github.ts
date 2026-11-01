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

  const file = data as { type?: string; sha: string; content?: string; encoding?: string };
  if (Array.isArray(data) || file.type !== 'file') {
    throw new ContentStoreError('Dit is geen bestand.');
  }

  if (file.encoding === 'base64' && file.content) {
    return { text: Buffer.from(file.content, 'base64').toString('utf8'), sha: file.sha };
  }

  // Files over 1 MB come back without content: fetch the blob instead.
  const blob = await api('GET', `/git/blobs/${encodeURIComponent(file.sha)}`);
  const { content } = blob.data as { content: string };
  return { text: Buffer.from(content, 'base64').toString('utf8'), sha: file.sha };
}

export async function listDir(path: string): Promise<DirEntry[]> {
  assertAllowedDir(path);
  const { branch } = getConfig();
  const { status, data } = await api('GET', `/contents/${encodePath(path)}?ref=${encodeURIComponent(branch)}`, { allow: [404] });
  if (status === 404 || !Array.isArray(data)) {
    return [];
  }

  return (data as DirEntry[]).map(item => ({ name: item.name, path: item.path, type: item.type, sha: item.sha }));
}

export async function latestDeployStatus(): Promise<{ state: DeployState; startedAt?: string }> {
  try {
    const { branch } = getConfig();
    const { data } = await api('GET', `/actions/workflows/deploy.yml/runs?branch=${encodeURIComponent(branch)}&per_page=1`);
    const run = (data as { workflow_runs?: { status: string; conclusion: string | null; run_started_at?: string; created_at?: string }[] }).workflow_runs?.[0];
    if (!run) {
      return { state: 'onbekend' };
    }

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
  } catch {
    return { state: 'onbekend' };
  }
}
