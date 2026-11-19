import {loadEntry} from '@lib/content-store/entries';
import {listDir, readFile} from '@lib/content-store/github';

vi.mock('@lib/content-store/github', () => ({readFile: vi.fn(), listDir: vi.fn()}));

const file = (text: string) => ({text, sha: 'sha-index'});

describe('loadEntry', () => {
  beforeEach(() => {
    vi.mocked(listDir).mockResolvedValue([]);
  });

  it('hands the programme to the form as JSON', async () => {
    vi.mocked(readFile).mockResolvedValue(file(`---
titel: Kerst
datum: '2026-12-19'
categorie: feest
samenvatting: Kort
programma:
  - uur: '14:00'
    titel: Kerstspel
    info: Deuren 13:30
---
Tekst
`) as never);
    const entry = await loadEntry('activiteiten', 'kerst');
    expect(JSON.parse(entry!.values.programma)).toEqual([{uur: '14:00', titel: 'Kerstspel', info: 'Deuren 13:30'}]);
    expect(entry!.values.titel).toBe('Kerst');
  });

  it('lists the gallery photos of a news item in order with their shas, skipping missing files', async () => {
    vi.mocked(readFile).mockResolvedValue(file('---\ntitel: X\ndatum: \'2026-01-01\'\nsamenvatting: Y\nfotos:\n  - ./foto-3.jpg\n  - ./foto-1.jpg\n  - ./foto-2.jpg\n---\n') as never);
    vi.mocked(listDir).mockResolvedValue([
      {name: 'foto-1.jpg', path: 'content/nieuws/x/foto-1.jpg', type: 'file', sha: 's1'},
      {name: 'foto-3.jpg', path: 'content/nieuws/x/foto-3.jpg', type: 'file', sha: 's3'},
    ] as never);

    expect((await loadEntry('nieuws', 'x'))!.fotos).toEqual([{file: 'foto-3.jpg', sha: 's3'}, {file: 'foto-1.jpg', sha: 's1'}]);
    expect((await loadEntry('activiteiten', 'x'))!.fotos).toEqual([]);
  });

  it('gives an empty list when an activity has no programme, and none for other types', async () => {
    vi.mocked(readFile).mockResolvedValue(file('---\ntitel: Kerst\n---\n') as never);
    expect((await loadEntry('activiteiten', 'kerst'))!.values.programma).toBe('[]');
    expect((await loadEntry('nieuws', 'kerst'))!.values).not.toHaveProperty('programma');
  });
});
