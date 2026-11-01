// @vitest-environment node
import {beforeEach, describe, expect, it, vi} from 'vitest';

const api = vi.fn();
const readFile = vi.fn();

vi.mock('@lib/auth/require-admin', () => ({requireEditorSession: async () => ({user: {email: 'r@example.com', name: 'Rita', role: 'redacteur'}})}));
vi.mock('@lib/audit', () => ({logAudit: vi.fn(), createAuditContext: vi.fn()}));
vi.mock('next/cache', () => ({revalidatePath: vi.fn()}));
vi.mock('next/navigation', () => ({redirect: vi.fn()}));
vi.mock('next/headers', () => ({headers: async () => new Headers()}));
// Only the HTTP layer is mocked: the real store (and its path whitelist) runs.
vi.mock('@lib/content-store/github', async () => {
  const actual = await vi.importActual<typeof import('../../../app/lib/content-store/github')>('../../../app/lib/content-store/github');
  return {
    ...actual, api, readFile, listDir: vi.fn().mockResolvedValue([]), isEditingConfigured: () => true,
  };
});

const {saveEntry, deleteEntry} = await import('../../../app/(admin)/admin/(protected)/content/actions');

beforeEach(() => {
  api.mockReset();
  readFile.mockReset().mockResolvedValue(undefined);
  vi.stubEnv('GITHUB_CONTENT_TOKEN', 'ghp_x');
});

const form = (values: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) {
    data.set(key, value);
  }

  return data;
};

describe('slug outside the allowed paths', () => {
  it('is refused before anything is sent to GitHub (save)', async () => {
    const state = await saveEntry({}, form({
      _type: 'nieuws', _mode: 'edit', _slug: '../../x', _indexSha: 's', titel: 'T', datum: '2026-01-01', samenvatting: 'S',
    }));

    expect(state.message).toContain('niet toegestaan');
    expect(api).not.toHaveBeenCalled();
  });

  it('is refused before anything is sent to GitHub (delete)', async () => {
    const state = await deleteEntry({}, form({_type: 'nieuws', _slug: '../../x', _title: 'T', _indexSha: 's'}));

    expect(state.message).toContain('niet toegestaan');
    expect(api).not.toHaveBeenCalled();
  });
});
