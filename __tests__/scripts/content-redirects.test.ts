// @vitest-environment node
import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {contentRedirects} from '../../scripts/content-redirects.js';

let root: string;

const item = (collection: string, slug: string, frontmatter: string) => {
  mkdirSync(path.join(root, collection, slug), {recursive: true});
  writeFileSync(path.join(root, collection, slug, 'index.md'), `---\n${frontmatter}\n---\nTekst\n`);
};

beforeEach(() => {
  root = mkdtempSync(path.join(tmpdir(), 'content-redirects-'));
});

afterEach(() => {
  rmSync(root, {recursive: true, force: true});
});

describe('contentRedirects', () => {
  it('redirects each alias of activities and news permanently to the current slug', () => {
    item('activiteiten', 'fuif-2025', 'titel: Fuif\naliassen:\n  - -de-fuif-komt-eraan\n  - fuif\ndatum: \'2025-03-29\'');
    item('nieuws', 'nieuwsbrief', 'titel: Brief\naliassen: [oude-brief]');
    item('nieuws', 'zonder', 'titel: Zonder');

    expect(contentRedirects(root)).toEqual([
      {source: '/activiteiten/-de-fuif-komt-eraan', destination: '/activiteiten/fuif-2025', permanent: true},
      {source: '/activiteiten/fuif', destination: '/activiteiten/fuif-2025', permanent: true},
      {source: '/nieuws/oude-brief', destination: '/nieuws/nieuwsbrief', permanent: true},
    ]);
  });

  it('skips aliases that would shadow a real page, repeat, or break the path pattern, and concepts', () => {
    const warn = vi.fn();
    item('activiteiten', 'echt', 'titel: Echt');
    item('activiteiten', 'ander', 'titel: Ander\naliassen: [echt, dubbel, "rare(:alias)", "Hoofdletter"]');
    item('activiteiten', 'derde', 'titel: Derde\naliassen: [dubbel]');
    item('activiteiten', 'concept', 'titel: Concept\nconcept: true\naliassen: [verborgen]');

    expect(contentRedirects(root, warn)).toEqual([
      {source: '/activiteiten/dubbel', destination: '/activiteiten/ander', permanent: true},
    ]);
    expect(warn.mock.calls.map(([message]) => message as string)).toEqual([
      expect.stringContaining('"echt" overgeslagen (is ook de slug'),
      expect.stringContaining('"rare(:alias)" overgeslagen'),
      expect.stringContaining('"Hoofdletter" overgeslagen'),
      expect.stringContaining('"dubbel" overgeslagen (staat al bij een ander item)'),
    ]);
  });

  it('refuses executable frontmatter and copes with missing folders', () => {
    expect(contentRedirects(root)).toEqual([]);
    mkdirSync(path.join(root, 'nieuws', 'kwaad'), {recursive: true});
    writeFileSync(path.join(root, 'nieuws', 'kwaad', 'index.md'), '---js\n{aliassen: ["x"]}\n---\n');
    expect(() => contentRedirects(root)).toThrow(/Uitvoerbare frontmatter/);
  });

  it('finds the alias in the real content', () => {
    expect(contentRedirects(path.join(process.cwd(), 'content'), () => undefined)).toContainEqual({
      source: '/activiteiten/-de-talentenfuif-2025-komt-eraan',
      destination: '/activiteiten/de-talentenfuif-2025-komt-eraan',
      permanent: true,
    });
  });
});
