// @vitest-environment node
import {readFileSync} from 'node:fs';
import sharp from 'sharp';
import {
  beforeEach, describe, expect, it, vi,
} from 'vitest';

const requireEditorSession = vi.fn();
const commitChanges = vi.fn();
const pathsUnder = vi.fn();
const listDir = vi.fn();
const readFile = vi.fn();
const logAudit = vi.fn();
const revalidatePath = vi.fn();
const redirect = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT ${url}`);
});

vi.mock('@lib/auth/require-admin', () => ({requireEditorSession}));
vi.mock('@lib/content-store/store', () => ({commitChanges, pathsUnder}));
vi.mock('@lib/content-store/github', () => ({listDir, readFile, isEditingConfigured: () => true}));
vi.mock('@lib/audit', () => ({logAudit, createAuditContext: (request: unknown, session: unknown) => ({request, session})}));
vi.mock('next/cache', () => ({revalidatePath}));
vi.mock('next/navigation', () => ({redirect}));
vi.mock('next/headers', () => ({headers: async () => new Headers()}));

const {saveEntry, deleteEntry, saveAnnouncement} = await import('../../../app/(admin)/admin/(protected)/content/actions');
const {ConflictError, ContentStoreError} = await import('../../../app/lib/content-store/errors');

const session = {user: {id: 'u1', email: 'redacteur@example.com', name: 'Rita', role: 'redacteur'}};
const empty = {};

const form = (values: Record<string, string | File>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) {
    data.set(key, value);
  }

  return data;
};

const photo = async () => {
  const buffer = await sharp({create: {width: 20, height: 10, channels: 3, background: '#c33'}}).png().toBuffer();
  return new File([new Uint8Array(buffer)], 'foto.png', {type: 'image/png'});
};

const newsForm = (extra: Record<string, string | File> = {}) => form({
  _type: 'nieuws',
  _mode: 'create',
  titel: 'Nieuwe Brief',
  datum: '2026-11-01',
  samenvatting: 'Kort',
  inhoud: 'Hallo **wereld**',
  ...extra,
});

beforeEach(() => {
  for (const mock of [requireEditorSession, commitChanges, pathsUnder, listDir, readFile, logAudit, revalidatePath, redirect]) {
    mock.mockClear();
  }

  requireEditorSession.mockResolvedValue(session);
  commitChanges.mockResolvedValue({commitSha: 'abc123'});
  listDir.mockResolvedValue([]);
  readFile.mockResolvedValue(undefined);
  redirect.mockImplementation((url: string) => {
    throw new Error(`NEXT_REDIRECT ${url}`);
  });
});

describe('saveEntry (create)', () => {
  it('commits index.md and the image with expectedSha null, then redirects with a success flag', async () => {
    await expect(saveEntry(empty, newsForm({afbeelding: await photo()}))).rejects.toThrow('NEXT_REDIRECT /admin/content/nieuws?opgeslagen=1&commit=abc123');

    expect(requireEditorSession).toHaveBeenCalled();
    const call = commitChanges.mock.calls[0][0] as {message: string; changes: Array<{path: string; content: Buffer | string; expectedSha?: string | null}>};
    expect(call.message).toBe('content: toevoegen nieuws "Nieuwe Brief"');
    expect(call.changes.map(change => change.path)).toEqual([
      'content/nieuws/nieuwe-brief/index.md',
      'content/nieuws/nieuwe-brief/afbeelding.jpg',
    ]);
    expect(call.changes.map(change => change.expectedSha)).toEqual([null, null]);
    expect(String(call.changes[0].content)).toContain('afbeelding: ./afbeelding.jpg');
    expect(String(call.changes[0].content)).toContain('Hallo **wereld**');
    expect(logAudit).toHaveBeenCalledWith(expect.objectContaining({
      actionType: 'create', resourceType: 'content:nieuws', resourceId: 'nieuwe-brief', metadata: expect.objectContaining({commitSha: 'abc123'}),
    }));
    expect(revalidatePath).toHaveBeenCalledWith('/admin/content/nieuws');
  });

  it('returns field errors and commits nothing for invalid input', async () => {
    const state = await saveEntry(empty, newsForm({titel: '', datum: '2025-02-30'}));

    expect(state.errors).toMatchObject({titel: expect.any(String), datum: expect.any(String)});
    expect(commitChanges).not.toHaveBeenCalled();
  });

  it('rejects a title that becomes the reserved slug nieuw with its own message', async () => {
    const state = await saveEntry(empty, newsForm({titel: 'Nieuw'}));

    expect(state.errors?.titel).toBe('Deze titel kan niet. Kies een andere.');
    expect(commitChanges).not.toHaveBeenCalled();
  });

  it('rejects a title whose slug exists already', async () => {
    listDir.mockResolvedValue([{name: 'nieuwe-brief', path: 'content/nieuws/nieuwe-brief', type: 'dir', sha: 's'}]);
    readFile.mockResolvedValue({text: '---\ntitel: Oud\ndatum: 2025-01-01\nsamenvatting: x\n---\n', sha: 's1'});

    const state = await saveEntry(empty, newsForm());

    expect(state.errors?.titel).toBe('Er bestaat al een item met deze titel');
    expect(commitChanges).not.toHaveBeenCalled();
  });

  it('rejects a title that equals an alias of another item', async () => {
    listDir.mockResolvedValue([{name: 'oud', path: 'content/nieuws/oud', type: 'dir', sha: 's'}]);
    readFile.mockResolvedValue({text: '---\ntitel: Oud\ndatum: 2025-01-01\nsamenvatting: x\naliassen:\n  - nieuwe-brief\n---\n', sha: 's1'});

    const state = await saveEntry(empty, newsForm());

    expect(state.errors?.titel).toBe('Er bestaat al een item met deze titel');
  });

  it('rejects a file larger than 10 MB before reading it', async () => {
    const big = new File(['x'], 'groot.jpg');
    Object.defineProperty(big, 'size', {value: 11 * 1024 * 1024});

    const state = await saveEntry(empty, newsForm({afbeelding: big}));

    expect(state.errors?.afbeelding).toMatch(/10 MB/);
    expect(commitChanges).not.toHaveBeenCalled();
  });

  it('turns a text file posing as a photo into a field error', async () => {
    const state = await saveEntry(empty, newsForm({afbeelding: new File(['dit is tekst'], 'foto.jpg', {type: 'image/jpeg'})}));

    expect(state.errors?.afbeelding).toBeTruthy();
    expect(commitChanges).not.toHaveBeenCalled();
  });

  it('shows a conflict message and does not redirect', async () => {
    commitChanges.mockRejectedValue(new ConflictError());

    const state = await saveEntry(empty, newsForm());

    expect(state.message).toBe('Iemand anders heeft dit net aangepast. Herlaad de pagina.');
    expect(redirect).not.toHaveBeenCalled();
    expect(logAudit).not.toHaveBeenCalled();
  });

  it('shows store errors without redirecting', async () => {
    commitChanges.mockRejectedValue(new ContentStoreError('GitHub is niet bereikbaar. Probeer het later opnieuw.'));

    const state = await saveEntry(empty, newsForm());

    expect(state.message).toBe('GitHub is niet bereikbaar. Probeer het later opnieuw.');
  });

  it('does not leak unexpected errors', async () => {
    commitChanges.mockRejectedValue(new Error('token ghp_SECRET'));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const state = await saveEntry(empty, newsForm());

    expect(state.message).not.toContain('ghp_SECRET');
    expect(state.message).toBeTruthy();
  });

  it('creates a faq item as a single file', async () => {
    await expect(saveEntry(empty, form({
      _type: 'faq', _mode: 'create', vraag: 'Waar is het?', antwoord: 'Hier.',
    }))).rejects.toThrow('NEXT_REDIRECT /admin/content/faq?opgeslagen=1&commit=abc123');

    const call = commitChanges.mock.calls[0][0] as {changes: Array<{path: string}>};
    expect(call.changes.map(change => change.path)).toEqual(['content/faq/waar-is-het.md']);
  });

  it('refuses an unknown type', async () => {
    const state = await saveEntry(empty, form({_type: '../etc', _mode: 'create'}));

    expect(state.message).toBeTruthy();
    expect(commitChanges).not.toHaveBeenCalled();
  });
});

describe('saveEntry (edit)', () => {
  const edit = (extra: Record<string, string | File> = {}) => newsForm({
    _mode: 'edit',
    _slug: 'oude-slug',
    _indexSha: 'sha-index',
    _imageSha: 'sha-image',
    _hasImage: '1',
    aliassen: 'knoeien',
    ...extra,
  });

  it('keeps the slug, passes the hidden shas and keeps the existing image', async () => {
    readFile.mockResolvedValue({text: '---\ntitel: Oud\ndatum: 2025-01-01\nsamenvatting: x\naliassen:\n  - oud-adres\n---\n', sha: 'sha-index'});
    await expect(saveEntry(empty, edit())).rejects.toThrow('NEXT_REDIRECT /admin/content/nieuws?opgeslagen=1&commit=abc123');

    const call = commitChanges.mock.calls[0][0] as {message: string; changes: Array<{path: string; content?: string; expectedSha?: string | null}>};
    expect(call.message).toContain('bijwerken nieuws "Nieuwe Brief"');
    expect(call.changes).toHaveLength(1);
    expect(call.changes[0]).toMatchObject({path: 'content/nieuws/oude-slug/index.md', expectedSha: 'sha-index'});
    expect(call.changes[0].content).toContain('afbeelding: ./afbeelding.jpg');
    expect(call.changes[0].content).toContain('- oud-adres');
    expect(call.changes[0].content).not.toContain('knoeien');
    expect(logAudit).toHaveBeenCalledWith(expect.objectContaining({actionType: 'update', resourceId: 'oude-slug'}));
  });

  it('deletes the image when asked to', async () => {
    await expect(saveEntry(empty, edit({verwijderAfbeelding: 'on'}))).rejects.toThrow('NEXT_REDIRECT');

    const call = commitChanges.mock.calls[0][0] as {changes: Array<{path: string; content?: string; delete?: true; expectedSha?: string | null}>};
    expect(call.changes[0].content).not.toContain('afbeelding');
    expect(call.changes[1]).toMatchObject({path: 'content/nieuws/oude-slug/afbeelding.jpg', delete: true, expectedSha: 'sha-image'});
  });

  it('replaces the image with the sha of the old one', async () => {
    await expect(saveEntry(empty, edit({afbeelding: await photo()}))).rejects.toThrow('NEXT_REDIRECT');

    const call = commitChanges.mock.calls[0][0] as {changes: Array<{path: string; expectedSha?: string | null}>};
    expect(call.changes[1]).toMatchObject({path: 'content/nieuws/oude-slug/afbeelding.jpg', expectedSha: 'sha-image'});
  });
});

describe('deleteEntry', () => {
  it('deletes every file under the item dir with the known shas', async () => {
    pathsUnder.mockResolvedValue(['content/nieuws/oud/index.md', 'content/nieuws/oud/afbeelding.jpg']);

    await expect(deleteEntry(empty, form({
      _type: 'nieuws', _slug: 'oud', _title: 'Oud nieuws', _indexSha: 'si', _imageSha: 'sm',
    }))).rejects.toThrow('NEXT_REDIRECT /admin/content/nieuws?verwijderd=1&commit=abc123');

    expect(pathsUnder).toHaveBeenCalledWith('content/nieuws/oud');
    const call = commitChanges.mock.calls[0][0] as {message: string; changes: unknown[]};
    expect(call.message).toBe('content: verwijderen nieuws "Oud nieuws"');
    expect(call.changes).toEqual([
      {path: 'content/nieuws/oud/index.md', delete: true, expectedSha: 'si'},
      {path: 'content/nieuws/oud/afbeelding.jpg', delete: true, expectedSha: 'sm'},
    ]);
    expect(logAudit).toHaveBeenCalledWith(expect.objectContaining({actionType: 'delete', resourceId: 'oud'}));
  });

  it('deletes only the file of a faq item', async () => {
    pathsUnder.mockResolvedValue(['content/faq/a.md', 'content/faq/b.md']);

    await expect(deleteEntry(empty, form({
      _type: 'faq', _slug: 'a', _title: 'A', _indexSha: 'si', _imageSha: '',
    }))).rejects.toThrow('NEXT_REDIRECT');

    const call = commitChanges.mock.calls[0][0] as {changes: unknown[]};
    expect(call.changes).toEqual([{path: 'content/faq/a.md', delete: true, expectedSha: 'si'}]);
  });

  it('shows a conflict without redirecting', async () => {
    pathsUnder.mockResolvedValue(['content/nieuws/oud/index.md']);
    commitChanges.mockRejectedValue(new ConflictError());

    const state = await deleteEntry(empty, form({_type: 'nieuws', _slug: 'oud', _title: 'Oud', _indexSha: 'si'}));

    expect(state.message).toContain('Herlaad');
    expect(redirect).not.toHaveBeenCalled();
  });

  it('reports an item that is gone', async () => {
    pathsUnder.mockResolvedValue([]);

    const state = await deleteEntry(empty, form({_type: 'nieuws', _slug: 'oud', _title: 'Oud', _indexSha: 'si'}));

    expect(state.message).toBeTruthy();
    expect(commitChanges).not.toHaveBeenCalled();
  });
});

describe('saveAnnouncement', () => {
  const site = readFileSync('content/site.yaml', 'utf8');
  const values = (extra: Record<string, string> = {}) => form({
    _sha: 'site-sha', actief: 'on', tekst: 'Geen training', type: 'waarschuwing', ...extra,
  });

  it('updates site.yaml with the sha check', async () => {
    readFile.mockResolvedValue({text: site, sha: 'site-sha'});

    await expect(saveAnnouncement(empty, values())).rejects.toThrow('NEXT_REDIRECT /admin/content?opgeslagen=1&commit=abc123');

    const call = commitChanges.mock.calls[0][0] as {message: string; changes: Array<{path: string; content: string; expectedSha: string}>};
    expect(call.message).toBe('content: bijwerken aankondiging "Geen training"');
    // Public repo: the editor's name and e-mail stay out of the commit (they are in the audit log).
    expect(call.message).not.toMatch(/Rita|@/);
    expect(call.changes[0]).toMatchObject({path: 'content/site.yaml', expectedSha: 'site-sha'});
    expect(call.changes[0].content).toContain('tekst: Geen training');
    expect(call.changes[0].content).toContain('navigatie:');
  });

  it('reports a conflict when the sha differs', async () => {
    readFile.mockResolvedValue({text: site, sha: 'other'});

    const state = await saveAnnouncement(empty, values());

    expect(state.message).toContain('Herlaad');
    expect(commitChanges).not.toHaveBeenCalled();
  });

  it('returns field errors for an active announcement without text', async () => {
    const state = await saveAnnouncement(empty, values({tekst: ''}));

    expect(state.errors?.tekst).toBeTruthy();
    expect(commitChanges).not.toHaveBeenCalled();
  });
});
