// @vitest-environment node
import {cpSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {afterEach, describe, expect, it} from 'vitest';
import {createContentReader} from '@lib/content/reader';

const fixtures = path.join(__dirname, '../../fixtures/content');

describe('createContentReader', () => {
  const reader = createContentReader(fixtures);

  it('geeft actieve activiteiten oplopend op datum', () => {
    expect(reader.getActiviteiten().map(a => a.slug)).toEqual(['nieuwe-slug', 'met-foto']);
  });

  it('neemt concepten mee wanneer gevraagd', () => {
    expect(createContentReader(fixtures, {includeConcepts: true}).getActiviteiten()).toHaveLength(3);
  });

  it('vindt een activiteit via alias en lost afbeeldingen op', () => {
    expect(reader.getActiviteit('oude-slug')?.slug).toBe('nieuwe-slug');
    expect(reader.getActiviteit('met-foto')?.afbeelding?.src).toBe('/content/activiteiten/met-foto/foto.png');
    expect(reader.getActiviteit('met-foto')?.html).toContain('<strong>wereld</strong>');
    expect(reader.getActiviteit('verborgen')).toBeUndefined();
  });

  it('geeft nieuws aflopend en vindt via alias', () => {
    expect(reader.getNieuws().map(n => n.slug)).toEqual(['tweede', 'eerste']);
    expect(reader.getNieuwsItem('oud-bericht')?.slug).toBe('eerste');
  });

  it('rendert paginas en lost sponsorlogos op', () => {
    expect(reader.getPagina('over-ons').html).toContain('<p>');
    expect(reader.getPagina('sponsors').sponsors[0].logo).toMatchObject({src: '/content/paginas/sponsors/logo.png'});
    expect(reader.getPagina('home').titel).toBe('home');
  });

  it('sorteert team en faq', () => {
    expect(reader.getTeam().map(t => t.naam)).toEqual(['Anna', 'Bea', 'Carl']);
    expect(reader.getTeam()[0].categorie).toBe('bestuur');
    expect(reader.getTeam()[0].foto?.src).toBe('/content/team/lid-a.png');
    expect(reader.getFaq().map(f => f.vraag)).toEqual(['Eerste vraag?', 'Tweede vraag?']);
  });

  it('leest teksten en site', () => {
    expect(reader.listTeksten().map(t => t.slug)).toEqual(['privacy']);
    expect(reader.getTekst('privacy')?.html).toContain('<strong>tekst</strong>');
    expect(reader.getTekst('bestaat-niet')).toBeUndefined();
    expect(reader.getSite().footer.email).toBe('a@b.be');
  });
});

describe('foutafhandeling', () => {
  let tmp: string | undefined;
  afterEach(() => {
    if (tmp) {
      rmSync(tmp, {recursive: true, force: true});
      tmp = undefined;
    }
  });

  it('noemt pad en veld bij ongeldige frontmatter', () => {
    tmp = mkdtempSync(path.join(os.tmpdir(), 'content-'));
    cpSync(fixtures, tmp, {recursive: true});
    writeFileSync(path.join(tmp, 'activiteiten/kapot.md'), '---\ndatum: 2026-01-01\ncategorie: feest\nsamenvatting: x\n---\n');
    expect(() => createContentReader(tmp!).getActiviteiten()).toThrow(/activiteiten\/kapot.*titel/s);
  });
});
