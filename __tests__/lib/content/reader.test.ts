// @vitest-environment node
import {cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
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
    expect(reader.getActiviteit('met-foto')?.afbeelding?.src).toBe('/content/activiteiten/met-foto/afbeelding.jpg');
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
    expect(reader.getTeam()[0].foto?.src).toBe('/content/team/foto.jpg');
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

  const copy = () => {
    tmp = mkdtempSync(path.join(os.tmpdir(), 'content-'));
    cpSync(fixtures, tmp, {recursive: true});
    return tmp;
  };

  it('faalt wanneer een map geen index.md heeft', () => {
    const dir = copy();
    mkdirSync(path.join(dir, 'nieuws/zonder-index'));
    writeFileSync(path.join(dir, 'nieuws/zonder-index/Index.md'), '---\ntitel: x\n---\n');
    expect(() => createContentReader(dir).getNieuws()).toThrow('nieuws/zonder-index: index.md ontbreekt');
  });

  it('faalt bij een slug met hoofdletters of spaties', () => {
    const dir = copy();
    mkdirSync(path.join(dir, 'nieuws/Mijn Bericht'));
    writeFileSync(path.join(dir, 'nieuws/Mijn Bericht/index.md'), '---\ntitel: x\n---\n');
    expect(() => createContentReader(dir).getNieuws()).toThrow(/nieuws\/Mijn Bericht.*slug/);
    rmSync(path.join(dir, 'nieuws/Mijn Bericht'), {recursive: true});
    writeFileSync(path.join(dir, 'faq/Vraag 3.md'), '---\nvraag: x\n---\n');
    expect(() => createContentReader(dir).getFaq()).toThrow(/faq\/Vraag 3\.md.*slug/);
  });

  it('noemt het pad bij een yaml-syntaxfout', () => {
    const dir = copy();
    writeFileSync(path.join(dir, 'faq/kapot.md'), '---\nvraag: "niet gesloten\n---\n');
    expect(() => createContentReader(dir).getFaq()).toThrow(/^faq\/kapot\.md: /);
    writeFileSync(path.join(dir, 'site.yaml'), 'a: "kapot\n');
    expect(() => createContentReader(dir).getSite()).toThrow(/^site\.yaml: /);
  });

  it('noemt het pad bij een niet-geregistreerde frontmatter-engine', () => {
    const dir = copy();
    writeFileSync(path.join(dir, 'faq/engine.md'), '---toml\nvraag = "x"\n---\n');
    expect(() => createContentReader(dir).getFaq()).toThrow(/^faq\/engine\.md: /);
  });

  it('cachet tenzij cache: false', () => {
    const dir = copy();
    const cachedReader = createContentReader(dir);
    const freshReader = createContentReader(dir, {cache: false});
    expect(cachedReader.getFaq()).toHaveLength(2);
    expect(freshReader.getFaq()).toHaveLength(2);
    writeFileSync(path.join(dir, 'faq/vraag-3.md'), '---\nvraag: Derde?\nvolgorde: 3\n---\nx\n');
    expect(cachedReader.getFaq()).toHaveLength(2);
    expect(freshReader.getFaq()).toHaveLength(3);
  });
});
