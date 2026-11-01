// @vitest-environment node
import {readdirSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {load, CORE_SCHEMA} from 'js-yaml';
import {readMarkdownFile} from '@lib/content/files';
import {activiteitSchema, faqSchema, nieuwsSchema, siteSchema, teamlidSchema} from '@lib/content/schemas';
import {parseEntryForm, serializeEntry, updateAnnouncement, type EntryType} from '@lib/content-store/serialize';

const root = path.resolve('content');
const schemas = {activiteiten: activiteitSchema, nieuws: nieuwsSchema, team: teamlidSchema, faq: faqSchema};

const files = (type: EntryType): string[] => readdirSync(path.join(root, type), {withFileTypes: true})
  .map(entry => entry.isDirectory() ? path.join(root, type, entry.name, 'index.md') : path.join(root, type, entry.name));

const normalise = (text: string) => text.replaceAll('\r\n', '\n').trim();

describe('serializeEntry round-trip over real content', () => {
  for (const type of Object.keys(schemas) as EntryType[]) {
    for (const file of files(type)) {
      it(`${type}: ${path.relative(root, file)}`, () => {
        const {data, body} = readMarkdownFile(file);
        const frontmatter = schemas[type].parse(data);
        const text = serializeEntry(type, frontmatter, body);
        const dir = path.join(path.dirname(file), '__roundtrip__.md');
        expect(text.endsWith('\n')).toBe(true);
        expect(text.endsWith('\n\n')).toBe(false);
        const again = readMarkdownFileFromText(text, dir);
        expect(schemas[type].parse(again.data)).toEqual(frontmatter);
        expect(normalise(again.body)).toBe(normalise(body));
      });
    }
  }
});

import {mkdtempSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';

function readMarkdownFileFromText(text: string, _name: string) {
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

  it('rejects javascript: links in the announcement-like link fields of the schema', () => {
    const result = parseEntryForm('nieuws', {titel: 'A', datum: '2025-01-01', samenvatting: 'B', afbeelding: 'x'});
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
