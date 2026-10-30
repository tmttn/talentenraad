import {
  copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync,
} from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import matter from 'gray-matter';
import {dump} from 'js-yaml';
import {createContentReader} from '../../app/lib/content/reader';
import {paginaSchemas, type PaginaNaam} from '../../app/lib/content/schemas';
import {slugify} from '../../app/lib/content/slugify';
import {mapPagina, type BuilderPage} from './pages';
import {
  assertUniqueSlugs, findDisallowedEmails, fixMededelingLineBreak, htmlToMarkdown, slugsFor, stripPersonalEmails,
} from './transform';

const allowlist = ['voorzitterouderraad@talentenhuis.be', 'contact@apd-gba.be'];
const exportDir = path.resolve('content-export');
const outDir = path.resolve('content');

type Data = Record<string, unknown>;
type Entry = {name: string; published: string; data: Data};

function readExport<T = Entry>(name: string): T[] {
  return JSON.parse(readFileSync(path.join(exportDir, `${name}.json`), 'utf8')) as T[];
}

const published = <T extends {published: string}>(entries: T[]) => entries.filter(entry => entry.published === 'published');
const text = (value: unknown) => typeof value === 'string' ? value : '';

const written: string[] = [];

function write(relativePath: string, content: string): void {
  const file = path.join(outDir, relativePath);
  mkdirSync(path.dirname(file), {recursive: true});
  writeFileSync(file, content);
  written.push(file);
}

function checkNoEmptyStrings(value: unknown, file: string, field: string): void {
  if (value === '') {
    throw new Error(`Lege waarde in ${file}, veld "${field}"`);
  }

  if (Array.isArray(value)) {
    for (const [index, item] of value.entries()) {
      checkNoEmptyStrings(item, file, `${field}[${index}]`);
    }
  } else if (typeof value === 'object' && value !== null) {
    for (const [key, item] of Object.entries(value)) {
      checkNoEmptyStrings(item, file, field === '' ? key : `${field}.${key}`);
    }
  }
}

function writeMarkdown(relativePath: string, frontmatter: Data, body: string, allowEmpty: string[] = []): void {
  const cleaned = Object.fromEntries(Object.entries(frontmatter).filter(([, value]) => value !== undefined));
  const toCheck = Object.fromEntries(Object.entries(cleaned).filter(([key]) => !allowEmpty.includes(key)));
  checkNoEmptyStrings(toCheck, relativePath, '');
  write(relativePath, matter.stringify(stripPersonalEmails(body, allowlist), cleaned));
}

function ensureExport(): void {
  if (!existsSync(exportDir)) {
    throw new Error('content-export/ ontbreekt. Draai eerst: node scripts/export-builder-content.mjs');
  }
}

type Asset = {url: string; file?: string};

function copyImage(url: string, assets: Asset[], targetDir: string): string {
  const asset = assets.find(item => item.url === url);
  if (!asset?.file) {
    throw new Error(`Afbeelding niet gevonden in _assets.json: ${url}`);
  }

  const extension = path.extname(asset.file);
  mkdirSync(path.join(outDir, targetDir), {recursive: true});
  copyFileSync(path.join(exportDir, 'assets', asset.file), path.join(outDir, targetDir, `afbeelding${extension}`));
  return `./afbeelding${extension}`;
}

function migrateDated(collectie: 'activiteiten' | 'nieuws', entries: Entry[], assets: Asset[]) {
  const slugItems: Array<{collectie: string; slug: string; aliassen: string[]}> = [];
  for (const entry of published(entries)) {
    const {data} = entry;
    const titel = text(data.titel);
    const {slug, aliassen} = slugsFor(titel);
    slugItems.push({collectie, slug, aliassen});
    const afbeelding = typeof data.afbeelding === 'string' && data.afbeelding !== ''
      ? copyImage(data.afbeelding, assets, `${collectie}/${slug}`)
      : undefined;
    const frontmatter: Data = collectie === 'activiteiten'
      ? {
        titel,
        datum: data.datum,
        tijd: data.tijd,
        locatie: data.locatie,
        categorie: data.categorie,
        samenvatting: data.samenvatting,
        afbeelding,
        aliassen,
      }
      : {titel, datum: data.datum, samenvatting: data.samenvatting, afbeelding, aliassen};
    writeMarkdown(`${collectie}/${slug}/index.md`, frontmatter, fixMededelingLineBreak(htmlToMarkdown(text(data.inhoud))));
  }

  assertUniqueSlugs(slugItems);
  return slugItems.length;
}

function migrateTeam(): number {
  const members = published(readExport('teamlid')).filter(entry => entry.data.actief === true);
  assertUniqueSlugs(members.map(entry => ({collectie: 'team', slug: slugify(text(entry.data.naam)), aliassen: []})));
  for (const {data} of members) {
    const naam = text(data.naam);
    writeMarkdown(`team/${slugify(naam)}/index.md`, {
      naam,
      rol: data.rol,
      categorie: data.categorie,
      volgorde: data.volgorde,
    }, '');
  }

  return members.length;
}

function migrateFaq(): number {
  const items = published(readExport<Entry>('faq'));
  assertUniqueSlugs(items.map(entry => ({collectie: 'faq', slug: slugify(text(entry.data.vraag)), aliassen: []})));
  for (const {data} of items) {
    const vraag = text(data.vraag);
    writeMarkdown(`faq/${slugify(vraag)}.md`, {vraag, volgorde: data.volgorde}, htmlToMarkdown(text(data.antwoord)));
  }

  return items.length;
}

function migratePaginas(): {paginas: number; teksten: number} {
  const counts = {paginas: 0, teksten: 0};
  for (const entry of published(readExport<BuilderPage & {published: string}>('page'))) {
    const result = mapPagina(entry.data.url, entry);
    if ('tekst' in result) {
      writeMarkdown(`teksten/${result.tekst}.md`, result.frontmatter as Data, result.body);
      counts.teksten++;
    } else {
      // Pages without a body (kalender, nieuws, sponsors) have no empty-string frontmatter by design,
      // except sponsors' per-level empty-state texts, which are checked like any other field.
      writeMarkdown(`paginas/${result.naam}.md`, result.frontmatter as Data, result.body);
      counts.paginas++;
    }
  }

  return counts;
}

function migrateSite(): void {
  const header = published(readExport('site-header'))[0]?.data;
  const footer = published(readExport('site-footer'))[0]?.data;
  const ctaEntry = published(readExport('footer-cta')).find(entry => entry.name === 'Footer CTA - Sitewide');
  const announcement = published(readExport('aankondiging'))[0]?.data;
  if (!header || !footer || !ctaEntry || !announcement) {
    throw new Error('Site-header, site-footer, footer-cta of aankondiging ontbreekt in de export');
  }

  type Link = {text: string; url: string};
  const link = (item: Link) => ({tekst: item.text, link: item.url});
  const banner = (ctaEntry.data.blocks as Array<{component?: {name?: string; options?: Data}}>)
    .find(block => block.component?.name === 'CTABanner')?.component?.options;
  if (!banner) {
    throw new Error('CTABanner niet gevonden in footer-cta');
  }

  const address = footer.address as {street: string; city: string};
  const site = {
    navigatie: (header.navigationLinks as Link[]).map(item => link(item)),
    footer: {
      tagline: footer.tagline,
      adres: {straat: address.street, gemeente: address.city},
      email: footer.email,
      groepen: (footer.navigationGroups as Array<{title: string; links: Link[]}>)
        .map(group => ({titel: group.title, links: group.links.map(item => link(item))})),
      sociaal: (footer.socialLinks as Array<{platform: string; url: string}>)
        .map(item => ({platform: item.platform, link: item.url})),
      copyright: footer.copyrightText,
    },
    cta: {
      titel: banner.title,
      tekst: banner.description,
      knop: {tekst: banner.buttonText, link: banner.buttonLink},
    },
    // The live value sits in Postgres, not in the export; safe default.
    decoraties: {
      enabled: false,
      season: 'none',
      decorations: {
        christmasLights: false, snowfall: false, icicles: false, gingerbreadMan: false, christmasBalls: false,
      },
    },
    aankondiging: {
      actief: announcement.actief,
      tekst: announcement.tekst,
      type: announcement.type,
      ...(typeof announcement.link === 'string' && announcement.link !== '' ? {link: announcement.link} : {}),
    },
  };
  checkNoEmptyStrings(site, 'site.yaml', '');
  write('site.yaml', dump(site, {lineWidth: -1}));
}

function listFiles(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? listFiles(full) : [full];
  });
}

function validate(): void {
  const reader = createContentReader(outDir, {includeConcepts: true});
  reader.getSite();
  reader.getActiviteiten();
  reader.getNieuws();
  reader.getTeam();
  reader.getFaq();
  reader.listTeksten();
  for (const naam of Object.keys(paginaSchemas) as PaginaNaam[]) {
    reader.getPagina(naam);
  }
}

function main(): void {
  ensureExport();
  const assets = JSON.parse(readFileSync(path.join(exportDir, '_assets.json'), 'utf8')) as Asset[];
  rmSync(outDir, {recursive: true, force: true});
  mkdirSync(outDir, {recursive: true});

  const counts = {
    activiteiten: migrateDated('activiteiten', readExport('activiteit'), assets),
    nieuws: migrateDated('nieuws', readExport('nieuws'), assets),
    team: migrateTeam(),
    faq: migrateFaq(),
    ...migratePaginas(),
  };
  migrateSite();

  const offenders = listFiles(outDir)
    .filter(file => /\.(md|ya?ml)$/.test(file))
    .flatMap(file => findDisallowedEmails(readFileSync(file, 'utf8'), allowlist).map(() => path.relative(outDir, file)));
  if (offenders.length > 0) {
    throw new Error(`E-mailadressen buiten de allowlist in: ${[...new Set(offenders)].join(', ')}`);
  }

  validate();
  console.log(Object.entries(counts).map(([key, value]) => `${key} ${value}`).join(', '));
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
