// @vitest-environment node
import {mkdtempSync, readdirSync, readFileSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {load, CORE_SCHEMA} from 'js-yaml';
import {readMarkdownFile} from '@lib/content/files';
import {activiteitSchema, faqSchema, nieuwsSchema, siteSchema, teamlidSchema} from '@lib/content/schemas';
import {normalizeLink, parseAnnouncementForm, parseEntryForm, serializeEntry, updateAnnouncement, type EntryType} from '@lib/content-store/serialize';

const root = path.resolve('content');
const schemas = {activiteiten: activiteitSchema, nieuws: nieuwsSchema, team: teamlidSchema, faq: faqSchema};

const files = (type: EntryType): string[] => readdirSync(path.join(root, type), {withFileTypes: true})
  .map(entry => entry.isDirectory() ? path.join(root, type, entry.name, 'index.md') : path.join(root, type, entry.name));

const normalise = (text: string) => text.replaceAll('\r\n', '\n').trim();

describe('serializeEntry round-trip over real content', () => {
  for (const type of Object.keys(schemas) as EntryType[]) {
    it(`${type}: has files`, () => {
      expect(files(type).length).toBeGreaterThan(0);
    });

    for (const file of files(type)) {
      it(`${type}: ${path.relative(root, file)}`, () => {
        const {data, body} = readMarkdownFile(file);
        const frontmatter = schemas[type].parse(data);
        const text = serializeEntry(type, frontmatter, body);
        expect(text.endsWith('\n')).toBe(true);
        expect(text.endsWith('\n\n')).toBe(false);
        const again = readMarkdownFileFromText(text);
        expect(schemas[type].parse(again.data)).toEqual(frontmatter);
        expect(normalise(again.body)).toBe(normalise(body));
      });
    }
  }
});

function readMarkdownFileFromText(text: string) {
  const dir = mkdtempSync(path.join(tmpdir(), 'rt-'));
  const file = path.join(dir, 'x.md');
  writeFileSync(file, text);
  return readMarkdownFile(file);
}

describe('serializeEntry format', () => {
  it('keeps dates quoted, orders fields, omits empty optionals', () => {
    const text = serializeEntry('activiteiten', {
      concept: false, aliassen: [], categorie: 'feest', samenvatting: 'Kort', datum: '2025-02-07', titel: 'Fuif', tijd: '', locatie: undefined,
    } as never, '  Hallo  \n\n');
    expect(text).toBe('---\ntitel: Fuif\ndatum: \'2025-02-07\'\ncategorie: feest\nsamenvatting: Kort\n---\n\nHallo\n');
  });

  it('keeps aliassen and concept when set', () => {
    const text = serializeEntry('nieuws', {titel: 'A', datum: '2025-01-01', samenvatting: 'B', aliassen: ['-a'], concept: true}, '');
    expect(text).toContain('aliassen:\n  - -a');
    expect(text).toContain('concept: true');
    expect(text.endsWith('---\n')).toBe(true);
  });
});

describe('updateAnnouncement', () => {
  const siteText = readFileSync(path.join(root, 'site.yaml'), 'utf8');

  it('changes only the aankondiging block', () => {
    const next = updateAnnouncement(siteText, {actief: true, tekst: 'Geen school op vrijdag', type: 'belangrijk', link: '/kalender', linkTekst: 'Bekijk de kalender'});
    const before = load(siteText, {schema: CORE_SCHEMA}) as Record<string, unknown>;
    const after = load(next, {schema: CORE_SCHEMA}) as Record<string, unknown>;
    const {aankondiging: oldBlock, ...restBefore} = before;
    const {aankondiging: newBlock, ...restAfter} = after;
    expect(restAfter).toEqual(restBefore);
    expect(oldBlock).not.toEqual(newBlock);
    expect(newBlock).toEqual({actief: true, tekst: 'Geen school op vrijdag', type: 'belangrijk', link: '/kalender', linkTekst: 'Bekijk de kalender'});
    expect(Object.keys(after)).toEqual(Object.keys(before));
    expect(next.slice(0, next.indexOf('aankondiging:'))).toBe(siteText.slice(0, siteText.indexOf('aankondiging:')));
    expect(siteSchema.safeParse(after).success).toBe(true);
  });

  it('preserves comments and following keys', () => {
    const text = '# kop\nnavigatie: []\naankondiging:\n  actief: false\n  tekst: x\n  type: info\n# na\nextra: 1\n';
    const next = updateAnnouncement(text, {actief: false, tekst: 'nieuw', type: 'info'}, false);
    expect(next).toBe('# kop\nnavigatie: []\naankondiging:\n  actief: false\n  tekst: nieuw\n  type: info\n# na\nextra: 1\n');
  });

  it('rejects an invalid announcement', () => {
    expect(() => updateAnnouncement(siteText, {actief: true, tekst: '', type: 'info'})).toThrow();
    expect(() => updateAnnouncement(siteText, {actief: true, tekst: 'x', type: 'info', link: 'javascript:alert(1)'})).toThrow();
  });
});

describe('parseEntryForm', () => {
  const valid = {titel: ' Fuif ', datum: '2025-02-07', categorie: 'feest', samenvatting: 'Kort', inhoud: ' Tekst ', concept: 'on', tijd: '', afbeelding: '', locatie: 'Zaal'};

  it('accepts a valid form', () => {
    const result = parseEntryForm('activiteiten', valid);
    expect(result).toEqual({
      ok: true,
      frontmatter: {titel: 'Fuif', datum: '2025-02-07', categorie: 'feest', samenvatting: 'Kort', locatie: 'Zaal', aliassen: [], concept: true},
      body: 'Tekst',
      slugSource: 'Fuif',
    });
  });

  it('accepts FormData', () => {
    const form = new FormData();
    form.set('vraag', 'Waarom?');
    form.set('volgorde', '3');
    form.set('antwoord', 'Daarom.');
    const result = parseEntryForm('faq', form);
    expect(result).toMatchObject({ok: true, body: 'Daarom.', frontmatter: {vraag: 'Waarom?', volgorde: 3, concept: false}});
  });

  it('reports field errors in Dutch', () => {
    const result = parseEntryForm('activiteiten', {...valid, titel: '  ', datum: '2025-02-30'});
    expect(result).toEqual({ok: false, errors: {titel: 'Vul een titel in.', datum: 'Kies een geldige datum.'}});
  });

  it('accepts the fixed image path', () => {
    const result = parseEntryForm('nieuws', {titel: 'A', datum: '2025-01-01', samenvatting: 'B', afbeelding: './afbeelding.jpg'});
    expect(result.ok).toBe(true);
  });

  it('rejects a non-numeric volgorde and a missing answer', () => {
    const result = parseEntryForm('faq', {vraag: 'Q', volgorde: 'abc', antwoord: ''});
    expect(result).toEqual({ok: false, errors: {volgorde: 'Vul een getal in.', antwoord: 'Vul een antwoord in.'}});
  });

  it('defaults volgorde when empty and rejects bad categories', () => {
    expect(parseEntryForm('team', {naam: 'Jan', rol: 'Lid', categorie: 'lid', volgorde: ''})).toMatchObject({ok: true, frontmatter: {volgorde: 99}});
    expect(parseEntryForm('team', {naam: 'Jan', rol: 'Lid', categorie: 'baas'})).toMatchObject({ok: false, errors: {categorie: 'Kies een geldige categorie.'}});
  });
});

describe('parseEntryForm extras', () => {
  it('gives a Dutch message for a missing date', () => {
    const result = parseEntryForm('nieuws', {titel: 'A', datum: '', samenvatting: 'B'});
    expect(result).toEqual({ok: false, errors: {datum: 'Kies een geldige datum.'}});
  });

  it('treats empty optional strings as absent', () => {
    const result = parseEntryForm('activiteiten', {titel: 'A', datum: '2025-01-01', categorie: 'feest', samenvatting: 'B', tijd: ' ', locatie: '', afbeelding: ''});
    expect(result).toMatchObject({ok: true});
    expect(result.ok && Object.keys(result.frontmatter)).toEqual(['titel', 'datum', 'categorie', 'samenvatting', 'aliassen', 'concept']);
  });

  it('only allows the fixed image paths', () => {
    expect(parseEntryForm('nieuws', {titel: 'A', datum: '2025-01-01', samenvatting: 'B', afbeelding: '../x.jpg'})).toMatchObject({ok: false, errors: {afbeelding: expect.any(String)}});
    expect(parseEntryForm('team', {naam: 'A', rol: 'B', categorie: 'lid', foto: './afbeelding.jpg'})).toMatchObject({ok: false});
    expect(parseEntryForm('team', {naam: 'A', rol: 'B', categorie: 'lid', foto: './foto.jpg'})).toMatchObject({ok: true});
  });
});

describe('normalizeLink', () => {
  it.each([
    [' http://example.be/x ', 'https://example.be/x'],
    ['www.example.be', 'https://www.example.be'],
    ['/kalender', '/kalender'],
    ['  mailto:a@b.be ', 'mailto:a@b.be'],
  ])('%s -> %s', (input, expected) => {
    expect(normalizeLink(input)).toBe(expected);
  });
});

describe('announcement form and empty optionals', () => {
  const base = {actief: 'on', tekst: ' Let op ', type: 'info'};

  it('drops empty link and linkTekst', () => {
    const result = parseAnnouncementForm({...base, link: '', linkTekst: ' '});
    expect(result).toEqual({ok: true, aankondiging: {actief: true, tekst: 'Let op', type: 'info'}});
  });

  it('upgrades www. links and rejects bad ones with a friendly message', () => {
    expect(parseAnnouncementForm({...base, link: 'www.example.be'})).toMatchObject({ok: true, aankondiging: {link: 'https://www.example.be'}});
    expect(parseAnnouncementForm({...base, link: 'javascript:alert(1)'})).toEqual({
      ok: false,
      errors: {link: 'Begin de link met https:// (of met / voor een pagina op deze site).'},
    });
  });

  it('updateAnnouncement accepts empty optional strings', () => {
    const text = readFileSync(path.join(root, 'site.yaml'), 'utf8');
    const next = updateAnnouncement(text, {actief: true, tekst: 'Hoi', type: 'info', link: '', linkTekst: ''});
    expect(next).not.toContain('link:\'\'');
    expect(next).toContain('tekst: Hoi');
  });
});
