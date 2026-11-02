import {existsSync, readdirSync, statSync} from 'node:fs';
import path from 'node:path';
import type {z} from 'zod';
import {type ContentImage, readMarkdownFile, readYamlFile, resolveImage} from './files';
import {type MarkdownSegment, renderMarkdown, renderMarkdownSegments} from './markdown';
import {slugify} from './slugify';
import {
  activiteitSchema,
  faqSchema,
  nieuwsSchema,
  type PaginaFrontmatter,
  type PaginaNaam,
  paginaSchemas,
  type Site,
  siteSchema,
  teamlidSchema,
  tekstSchema,
} from './schemas';

type WithImage<T, K extends string> = Omit<T, K> & {[P in K]: ContentImage | undefined};
type Entry<T> = T & {slug: string; html: string};

export type Activiteit = Entry<WithImage<z.infer<typeof activiteitSchema>, 'afbeelding'>>;
/** News also carries its body as segments, so the article page can turn quotes into speech bubbles. */
export type NieuwsItem = Entry<WithImage<z.infer<typeof nieuwsSchema>, 'afbeelding'>> & {segmenten: MarkdownSegment[]};
export type Teamlid = Entry<WithImage<z.infer<typeof teamlidSchema>, 'foto'>>;
export type FaqItem = Entry<z.infer<typeof faqSchema>>;
export type Tekst = Entry<z.infer<typeof tekstSchema>>;

type PaginaResolved<K extends PaginaNaam> = K extends 'sponsors'
  ? Omit<PaginaFrontmatter<'sponsors'>, 'sponsors'> & {
    sponsors: Array<Omit<PaginaFrontmatter<'sponsors'>['sponsors'][number], 'logo'> & {logo: ContentImage | undefined}>;
  }
  : PaginaFrontmatter<K>;
export type Pagina<K extends PaginaNaam = PaginaNaam> = PaginaResolved<K> & {html: string};

export type ContentReaderOptions = {includeConcepts?: boolean; cache?: boolean};

type RawEntry = {file: string; slug: string; entryDir: string};

const byText = (a: string, b: string) => a.localeCompare(b, 'nl');

export function createContentReader(rootDir: string, options: ContentReaderOptions = {}) {
  const includeConcepts = options.includeConcepts ?? false;
  const cache = new Map<string, unknown>();

  const useCache = options.cache ?? true;

  const cached = <T>(key: string, load: () => T): T => {
    if (!useCache) {
      return load();
    }

    if (!cache.has(key)) {
      cache.set(key, load());
    }

    return cache.get(key) as T;
  };

  const relative = (file: string) => path.relative(rootDir, file).split(path.sep).join('/');

  const parse = <S extends z.ZodType>(schema: S, input: unknown, file: string): z.infer<S> => {
    const result = schema.safeParse(input);
    if (!result.success) {
      throw new Error(`${relative(file)}: ${result.error.message}`);
    }

    return result.data as z.infer<S>;
  };

  const withPath = <T>(file: string, read: () => T): T => {
    try {
      return read();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`${relative(file)}: ${message}`, {cause: error});
    }
  };

  const readMarkdown = (file: string) => withPath(file, () => readMarkdownFile(file));

  const assertSlug = (slug: string, fullPath: string) => {
    if (slug !== slugify(slug)) {
      throw new Error(`${relative(fullPath)}: slug "${slug}" is ongeldig (alleen kleine letters, cijfers en streepjes)`);
    }
  };

  const findEntries = (dir: string): RawEntry[] => {
    const absolute = path.join(rootDir, dir);
    if (!existsSync(absolute)) {
      return [];
    }

    const entries: RawEntry[] = [];
    for (const name of readdirSync(absolute).sort()) {
      const full = path.join(absolute, name);
      if (statSync(full).isDirectory()) {
        if (!readdirSync(full).includes('index.md')) {
          throw new Error(`${dir}/${name}: index.md ontbreekt`);
        }

        assertSlug(name, full);
        entries.push({file: path.join(full, 'index.md'), slug: name, entryDir: `${dir}/${name}`});
      } else if (name.endsWith('.md')) {
        assertSlug(name.slice(0, -3), full);
        entries.push({file: full, slug: name.slice(0, -3), entryDir: dir});
      }
    }

    return entries;
  };

  const image = (entryDir: string, ref: string | undefined) =>
    ref === undefined ? undefined : resolveImage(rootDir, entryDir, ref);

  const withImage = <T extends Record<string, unknown>, K extends string>(
    data: T,
    key: K,
    entryDir: string,
  ): WithImage<T, K> => {
    const {[key]: ref, ...rest} = data;
    return {...rest, [key]: image(entryDir, ref as string | undefined)} as unknown as WithImage<T, K>;
  };

  const loadCollection = <S extends z.ZodType<{concept: boolean}>, R>(
    dir: string,
    schema: S,
    build: (data: z.infer<S>, entry: RawEntry, body: string) => R,
  ): Array<R & {slug: string; html: string}> => cached(dir, () => {
    const items: Array<R & {slug: string; html: string}> = [];
    for (const entry of findEntries(dir)) {
      const {data, body} = readMarkdown(entry.file);
      const parsed = parse(schema, data, entry.file);
      if (parsed.concept && !includeConcepts) {
        continue;
      }

      items.push({...build(parsed, entry, body), slug: entry.slug, html: renderMarkdown(body)});
    }

    return items;
  });

  const activiteiten = () => loadCollection('activiteiten', activiteitSchema,
    (data, entry) => withImage(data, 'afbeelding', entry.entryDir));
  const nieuws = () => loadCollection('nieuws', nieuwsSchema,
    (data, entry, body) => ({...withImage(data, 'afbeelding', entry.entryDir), segmenten: renderMarkdownSegments(body)}));
  const team = () => loadCollection('team', teamlidSchema,
    (data, entry) => withImage(data, 'foto', entry.entryDir));
  const faq = () => loadCollection('faq', faqSchema, data => data);
  const teksten = () => loadCollection('teksten', tekstSchema, data => data);

  const findBySlug = <T extends {slug: string; aliassen: string[]}>(items: T[], slug: string) =>
    items.find(item => item.slug === slug) ?? items.find(item => item.aliassen.includes(slug));

  return {
    getSite(): Site {
      return cached('site', () => {
        const file = path.join(rootDir, 'site.yaml');
        return parse(siteSchema, withPath(file, () => readYamlFile(file)), file);
      });
    },

    getPagina<K extends PaginaNaam>(naam: K): Pagina<K> {
      return cached(`pagina:${naam}`, () => {
        const flat = path.join(rootDir, 'paginas', `${naam}.md`);
        const nested = path.join(rootDir, 'paginas', naam, 'index.md');
        const file = existsSync(flat) ? flat : nested;
        if (!existsSync(file)) {
          throw new Error(`paginas/${naam}: pagina niet gevonden`);
        }

        const {data, body} = readMarkdown(file);
        const parsed = parse(paginaSchemas[naam] as z.ZodType<Record<string, unknown>>, data, file);
        const entryDir = relative(path.dirname(file));
        if (naam === 'sponsors') {
          const sponsors = (parsed.sponsors as Array<{logo?: string}>).map(sponsor => withImage(sponsor, 'logo', entryDir));
          return {...parsed, sponsors, html: renderMarkdown(body)} as unknown as Pagina<K>;
        }

        return {...parsed, html: renderMarkdown(body)} as unknown as Pagina<K>;
      });
    },

    listTeksten(): Tekst[] {
      return teksten();
    },

    getTekst(slug: string): Tekst | undefined {
      return teksten().find(tekst => tekst.slug === slug);
    },

    getActiviteiten(): Activiteit[] {
      return cached('activiteiten:sorted', () => [...activiteiten()].sort((a, b) => byText(a.datum, b.datum)));
    },

    getActiviteit(slug: string): Activiteit | undefined {
      return findBySlug(activiteiten(), slug);
    },

    getNieuws(): NieuwsItem[] {
      return cached('nieuws:sorted', () => [...nieuws()].sort((a, b) => byText(b.datum, a.datum)));
    },

    getNieuwsItem(slug: string): NieuwsItem | undefined {
      return findBySlug(nieuws(), slug);
    },

    getTeam(): Teamlid[] {
      return cached('team:sorted', () => [...team()].sort((a, b) => a.volgorde - b.volgorde || byText(a.naam, b.naam)));
    },

    getFaq(): FaqItem[] {
      return cached('faq:sorted', () => [...faq()].sort((a, b) => a.volgorde - b.volgorde || byText(a.vraag, b.vraag)));
    },
  };
}

export type ContentReader = ReturnType<typeof createContentReader>;
