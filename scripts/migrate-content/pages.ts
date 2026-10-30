import type {PaginaNaam} from '../../app/lib/content/schemas';
import {extractTexts, htmlToMarkdown, type ExtractedBlock} from './transform';

export type BuilderPage = {
  name: string;
  data: {url: string; title?: string; description?: string; blocks: unknown[]};
};

type Result = {naam: PaginaNaam; frontmatter: unknown; body: string} | {tekst: string; frontmatter: unknown; body: string};

const paginaUrls: Record<string, PaginaNaam> = {
  '/': 'home',
  '/kalender': 'kalender',
  '/nieuws': 'nieuws',
  '/contact': 'contact',
  '/over-ons': 'over-ons',
  '/sponsors': 'sponsors',
};

const tekstUrls: Record<string, string> = {
  '/privacybeleid': 'privacybeleid',
  '/cookiebeleid': 'cookiebeleid',
  '/algemene-voorwaarden': 'algemene-voorwaarden',
};

const ctaComponents = new Set(['CTABanner', 'UnifiedCta', 'UnifiedCTA']);
const sponsorNiveaus = ['goud', 'zilver', 'brons', 'partner'] as const;

function str(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

/** Texts (Typography/Text) of the n entries before index `at`, in document order. */
function textsBefore(blocks: ExtractedBlock[], at: number, count: number): string[] {
  const texts = blocks.slice(0, at).filter(block => block.text !== undefined).map(block => block.text ?? '');
  return texts.slice(-count);
}

function indexOf(blocks: ExtractedBlock[], match: (block: ExtractedBlock) => boolean, label: string): number {
  const index = blocks.findIndex(match);
  if (index === -1) {
    throw new TypeError(`Blok ${label} niet gevonden`);
  }

  return index;
}

function component(name: string) {
  return (block: ExtractedBlock) => block.component === name;
}

function titelTekst(blocks: ExtractedBlock[], at: number): {titel: string; tekst: string} {
  const [titel = '', tekst = ''] = textsBefore(blocks, at, 2);
  return {titel, tekst};
}

function hero(blocks: ExtractedBlock[]): {titel: string; ondertitel: string} {
  const at = indexOf(blocks, component('Hero'), 'Hero');
  const [titel = '', ondertitel = ''] = blocks.slice(at + 1).filter(block => block.text !== undefined).map(block => block.text ?? '');
  return {titel, ondertitel};
}

function cta(blocks: ExtractedBlock[]) {
  const at = blocks.findIndex(block => ctaComponents.has(block.component));
  if (at === -1) {
    return undefined;
  }

  const {options} = blocks[at]!;
  if (typeof options.title === 'string') {
    return {
      titel: options.title,
      tekst: str(options.description),
      knoppen: [{tekst: str(options.buttonText), link: str(options.buttonLink)}],
    };
  }

  const after = blocks.slice(at + 1);
  const [titel = '', tekst = ''] = after.filter(block => block.text !== undefined).map(block => block.text ?? '');
  const knoppen = after
    .filter(block => block.component === 'CTAButton')
    .map(block => ({tekst: str(block.options.text), link: str(block.options.href)}));
  return {titel, tekst, knoppen};
}

/** Plain-text descriptions (no HTML tags) keep their paragraph breaks; HTML goes through Turndown. */
function descriptionToMarkdown(description: string): string {
  if (/<[a-z][^>]*>/i.test(description)) {
    return htmlToMarkdown(description);
  }

  return description
    .split(/\n\s*\n/)
    .map(paragraph => paragraph.trim().split(/\s*\n\s*/).join('  \n'))
    .filter(paragraph => paragraph !== '')
    .join('\n\n');
}

function infokaart(blocks: ExtractedBlock[]): {titel: string; body: string} {
  const card = blocks[indexOf(blocks, component('InfoCard'), 'InfoCard')]!;
  return {titel: str(card.options.title), body: descriptionToMarkdown(str(card.options.description))};
}

function metaDescription(text: string): string {
  if (text.length <= 160) {
    return text;
  }

  const sentence = /^[\s\S]{1,159}?[.!?](?=\s|$)/.exec(text);
  if (sentence) {
    return sentence[0];
  }

  return `${text.slice(0, 160).replace(/\s+\S*$/, '')}…`;
}

function mapTekst(slug: string, entry: BuilderPage): Result {
  const [heading, ...rest] = extractTexts(entry.data.blocks).filter(block => block.component === 'Text');
  const body = rest
    .map(block => htmlToMarkdown(str(block.options.text)))
    .filter(part => part !== '')
    .join('\n\n');
  const intro = rest.find(block => {
    const html = str(block.options.text).trim();
    return /^<p[\s>]/.test(html) && html.split('<p').length === 2 && !(block.text ?? '').startsWith('Laatst bijgewerkt');
  });
  return {
    tekst: slug,
    frontmatter: {
      titel: entry.data.title ?? `${entry.name} - Talentenraad`,
      beschrijving: entry.data.description ?? metaDescription(intro?.text ?? heading?.text ?? entry.name),
    },
    body,
  };
}

export function mapPagina(url: string, entry: BuilderPage): Result {
  const tekstSlug = tekstUrls[url];
  if (tekstSlug !== undefined) {
    return mapTekst(tekstSlug, entry);
  }

  const naam = paginaUrls[url];
  if (naam === undefined) {
    throw new Error(`Onbekende pagina-URL: ${url}`);
  }

  const blocks = extractTexts(entry.data.blocks);
  const heroTekst = hero(blocks);
  const ctaTekst = cta(blocks);
  const basis = {
    titel: entry.data.title ?? `${entry.name} - Talentenraad`,
    beschrijving: entry.data.description ?? heroTekst.ondertitel,
    hero: heroTekst,
    ...(ctaTekst ? {cta: ctaTekst} : {}),
  };

  switch (naam) {
    case 'home': {
      const card = infokaart(blocks);
      return {
        naam,
        frontmatter: {
          ...basis,
          dashboardTitel: textsBefore(blocks, indexOf(blocks, component('HomepageDashboard'), 'HomepageDashboard'), 1)[0] ?? '',
          infokaart: {titel: card.titel},
          faqTitel: textsBefore(blocks, indexOf(blocks, component('FAQ'), 'FAQ'), 1)[0] ?? '',
        },
        body: card.body,
      };
    }

    case 'kalender': {
      const list = titelTekst(blocks, indexOf(blocks, component('ActivitiesList'), 'ActivitiesList'));
      const archive = blocks[indexOf(blocks, component('ActivitiesArchive'), 'ActivitiesArchive')]!.options;
      return {
        naam,
        frontmatter: {
          ...basis,
          lijst: {titel: list.titel, ondertitel: list.tekst},
          archief: {titel: str(archive.title), ondertitel: str(archive.subtitle)},
        },
        body: '',
      };
    }

    case 'nieuws': {
      return {naam, frontmatter: basis, body: ''};
    }

    case 'contact': {
      const card = infokaart(blocks);
      return {
        naam,
        frontmatter: {
          ...basis,
          formulier: titelTekst(blocks, indexOf(blocks, component('ContactForm'), 'ContactForm')),
          infokaart: {titel: card.titel},
        },
        body: card.body,
      };
    }

    case 'over-ons': {
      const card = infokaart(blocks);
      const grid = (category: string) => titelTekst(
        blocks,
        indexOf(blocks, block => block.component === 'TeamGrid' && block.options.category === category, `TeamGrid ${category}`),
      );
      return {
        naam,
        frontmatter: {...basis, infokaart: {titel: card.titel}, bestuur: grid('bestuur'), leden: grid('lid')},
        body: card.body,
      };
    }

    case 'sponsors': {
      const sections = blocks.reduce<string[][]>((groups, block) => {
        if (block.component === 'Section') {
          groups.push([]);
        } else if (block.text !== undefined && groups.length > 0) {
          groups.at(-1)!.push(block.text);
        }

        return groups;
      }, []);
      if (sections.length !== sponsorNiveaus.length) {
        throw new Error(`Verwacht ${sponsorNiveaus.length} Section-blokken op /sponsors, gevonden ${sections.length}`);
      }

      const legeTekst = Object.fromEntries(sponsorNiveaus.map((niveau, index) => [niveau, sections[index]![1] ?? '']));
      return {naam, frontmatter: {...basis, sponsors: [], legeTekst}, body: ''};
    }
  }
}
