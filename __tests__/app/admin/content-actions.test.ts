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
const readVideoUpload = vi.fn();
const removeVideoUpload = vi.fn();
const revalidatePath = vi.fn();
const redirect = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT ${url}`);
});

vi.mock('@lib/auth/require-admin', () => ({requireEditorSession}));
vi.mock('@lib/content-store/store', () => ({commitChanges, pathsUnder}));
vi.mock('@lib/content-store/github', () => ({listDir, readFile, isEditingConfigured: () => true}));
vi.mock('@lib/content-store/video-uploads', () => ({readVideoUpload, removeVideoUpload}));
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
  for (const mock of [requireEditorSession, commitChanges, pathsUnder, listDir, readFile, logAudit, revalidatePath, redirect, readVideoUpload, removeVideoUpload]) {
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

describe('saveEntry (gallery)', () => {
  type Call = {changes: Array<{path: string; content?: Buffer | string; delete?: true; expectedSha?: string | null}>};
  const multi = (values: Record<string, string>, files: File[]) => {
    const data = newsForm(values);
    for (const file of files) {
      data.append('fotosNieuw', file);
    }

    return data;
  };

  const lastCall = () => commitChanges.mock.calls[0][0] as Call;

  it('stores new photos as foto-1.jpg, foto-2.jpg … and lists them in the frontmatter', async () => {
    await expect(saveEntry(empty, multi({}, [await photo(), await photo()]))).rejects.toThrow('NEXT_REDIRECT');

    const {changes} = lastCall();
    expect(changes.map(change => change.path)).toEqual([
      'content/nieuws/nieuwe-brief/index.md',
      'content/nieuws/nieuwe-brief/foto-1.jpg',
      'content/nieuws/nieuwe-brief/foto-2.jpg',
    ]);
    expect(changes.slice(1).every(change => change.expectedSha === null && Buffer.isBuffer(change.content))).toBe(true);
    expect(String(changes[0].content)).toContain('fotos:\n  - ./foto-1.jpg\n  - ./foto-2.jpg');
  });

  it('keeps, removes and adds photos in one commit without deleting and creating the same path', async () => {
    readFile.mockResolvedValue({text: '---\ntitel: Oud\ndatum: 2025-01-01\nsamenvatting: x\n---\n', sha: 'sha-index'});
    const data = multi({
      _mode: 'edit',
      _slug: 'oud',
      _indexSha: 'sha-index',
      _fotos: JSON.stringify([{file: 'foto-1.jpg', sha: 's1'}, {file: 'foto-2.jpg', sha: 's2'}]),
      fotosBehouden: 'foto-2.jpg',
    }, [await photo()]);

    await expect(saveEntry(empty, data)).rejects.toThrow('NEXT_REDIRECT');

    const {changes} = lastCall();
    expect(String(changes[0].content)).toContain('fotos:\n  - ./foto-2.jpg\n  - ./foto-3.jpg');
    expect(changes.slice(1).map(({path, delete: gone, expectedSha}) => ({path, gone: gone ?? false, expectedSha}))).toEqual([
      {path: 'content/nieuws/oud/foto-3.jpg', gone: false, expectedSha: null},
      {path: 'content/nieuws/oud/foto-1.jpg', gone: true, expectedSha: 's1'},
    ]);
  });

  it('overwrites a removed photo name when all twelve names are taken', async () => {
    readFile.mockResolvedValue({text: '---\ntitel: Oud\ndatum: 2025-01-01\nsamenvatting: x\n---\n', sha: 'sha-index'});
    const bestaand = Array.from({length: 12}, (_, index) => ({file: `foto-${index + 1}.jpg`, sha: `s${index + 1}`}));
    const data = multi({
      _mode: 'edit',
      _slug: 'oud',
      _indexSha: 'sha-index',
      _fotos: JSON.stringify(bestaand),
      fotosBehouden: bestaand.filter(item => item.file !== 'foto-5.jpg').map(item => item.file).join('\n'),
    }, [await photo()]);

    await expect(saveEntry(empty, data)).rejects.toThrow('NEXT_REDIRECT');

    const {changes} = lastCall();
    expect(changes.slice(1)).toEqual([expect.objectContaining({path: 'content/nieuws/oud/foto-5.jpg', expectedSha: 's5'})]);
    expect(changes[1].delete).toBeUndefined();
  });

  it('refuses more than twelve photos', async () => {
    const files = await Promise.all(Array.from({length: 13}, photo));

    const state = await saveEntry(empty, multi({}, files));

    expect(state.errors?.fotos).toMatch(/12/);
    expect(commitChanges).not.toHaveBeenCalled();
  });

  it('ignores kept names that were not part of the item', async () => {
    readFile.mockResolvedValue({text: '---\ntitel: Oud\ndatum: 2025-01-01\nsamenvatting: x\n---\n', sha: 'sha-index'});

    await expect(saveEntry(empty, newsForm({
      _mode: 'edit', _slug: 'oud', _indexSha: 'sha-index', _fotos: 'geen json', fotosBehouden: 'foto-1.jpg\n../index.md',
    }))).rejects.toThrow('NEXT_REDIRECT');

    expect(String(lastCall().changes[0].content)).not.toContain('fotos');
  });

  it('turns a broken gallery photo into an error on the gallery field', async () => {
    const state = await saveEntry(empty, multi({}, [new File(['tekst'], 'kapot.jpg', {type: 'image/jpeg'})]));

    expect(state.errors?.fotos).toContain('kapot.jpg');
    expect(commitChanges).not.toHaveBeenCalled();
  });
});

describe('saveEntry (video)', () => {
  type Call = {changes: Array<{path: string; content?: Buffer | string; delete?: true; expectedSha?: string | null}>};
  const lastCall = () => commitChanges.mock.calls[0][0] as Call;
  const oud = {text: '---\ntitel: Oud\ndatum: 2025-01-01\nsamenvatting: x\nvideo: ./video.mp4\n---\n', sha: 'sha-index'};
  const id = 'a'.repeat(32);

  it('commits the uploaded video of this user and removes the upload afterwards', async () => {
    readVideoUpload.mockResolvedValue(Buffer.from('film'));

    await expect(saveEntry(empty, newsForm({videoUpload: id}))).rejects.toThrow('NEXT_REDIRECT');

    expect(readVideoUpload).toHaveBeenCalledWith('u1', id);
    expect(lastCall().changes[1]).toMatchObject({path: 'content/nieuws/nieuwe-brief/video.mp4', expectedSha: null, content: Buffer.from('film')});
    expect(String(lastCall().changes[0].content)).toContain('video: ./video.mp4');
    expect(removeVideoUpload).toHaveBeenCalledWith('u1', id);
  });

  it('asks to choose again when the upload is gone, and commits nothing', async () => {
    readVideoUpload.mockResolvedValue(undefined);

    const state = await saveEntry(empty, newsForm({videoUpload: id}));

    expect(state.errors?.video).toMatch(/opnieuw/);
    expect(commitChanges).not.toHaveBeenCalled();
  });

  it('keeps the current video, or deletes it when asked', async () => {
    readFile.mockResolvedValue(oud);
    const edit = (extra: Record<string, string> = {}) => newsForm({_mode: 'edit', _slug: 'oud', _indexSha: 'sha-index', _videoSha: 'sv', ...extra});

    await expect(saveEntry(empty, edit())).rejects.toThrow('NEXT_REDIRECT');
    expect(String(lastCall().changes[0].content)).toContain('video: ./video.mp4');
    expect(lastCall().changes).toHaveLength(1);

    commitChanges.mockClear();
    await expect(saveEntry(empty, edit({verwijderVideo: 'on'}))).rejects.toThrow('NEXT_REDIRECT');
    expect(String(lastCall().changes[0].content)).not.toContain('video');
    expect(lastCall().changes[1]).toEqual({path: 'content/nieuws/oud/video.mp4', delete: true, expectedSha: 'sv'});
  });

  it('replaces a video with the known sha', async () => {
    readFile.mockResolvedValue(oud);
    readVideoUpload.mockResolvedValue(Buffer.from('nieuw'));
    await expect(saveEntry(empty, newsForm({_mode: 'edit', _slug: 'oud', _indexSha: 'sha-index', _videoSha: 'sv', videoUpload: id}))).rejects.toThrow('NEXT_REDIRECT');

    expect(lastCall().changes[1]).toMatchObject({path: 'content/nieuws/oud/video.mp4', expectedSha: 'sv'});
  });

  it('ignores a video file posted straight to the action', async () => {
    await expect(saveEntry(empty, newsForm({video: new File(['film'], 'x.mp4', {type: 'video/mp4'})}))).rejects.toThrow('NEXT_REDIRECT');

    expect(lastCall().changes.map(change => change.path)).toEqual(['content/nieuws/nieuwe-brief/index.md']);
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

  it('checks the shas of gallery photos when deleting', async () => {
    pathsUnder.mockResolvedValue(['content/nieuws/oud/index.md', 'content/nieuws/oud/foto-1.jpg']);

    await expect(deleteEntry(empty, form({
      _type: 'nieuws', _slug: 'oud', _title: 'Oud', _indexSha: 'si', _fotos: JSON.stringify([{file: 'foto-1.jpg', sha: 'sf1'}]),
    }))).rejects.toThrow('NEXT_REDIRECT');

    expect((commitChanges.mock.calls[0][0] as {changes: unknown[]}).changes).toEqual([
      {path: 'content/nieuws/oud/index.md', delete: true, expectedSha: 'si'},
      {path: 'content/nieuws/oud/foto-1.jpg', delete: true, expectedSha: 'sf1'},
    ]);
  });

  it('checks the sha of the video when deleting', async () => {
    pathsUnder.mockResolvedValue(['content/nieuws/oud/index.md', 'content/nieuws/oud/video.mp4']);

    await expect(deleteEntry(empty, form({_type: 'nieuws', _slug: 'oud', _title: 'Oud', _indexSha: 'si', _videoSha: 'sv'}))).rejects.toThrow('NEXT_REDIRECT');

    expect((commitChanges.mock.calls[0][0] as {changes: unknown[]}).changes).toContainEqual({path: 'content/nieuws/oud/video.mp4', delete: true, expectedSha: 'sv'});
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
