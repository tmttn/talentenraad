import {parseMarkdownSource} from '../content/files';
import {entryTypes, type EntryType} from './entry-types';
import {listDir, readFile} from './github';

export type EntryPaths = {dir: string; index: string; image?: string};

export function entryPaths(type: EntryType, slug: string): EntryPaths {
  const config = entryTypes[type];
  if (config.singleFile) {
    return {dir: `content/${type}`, index: `content/${type}/${slug}.md`};
  }

  const dir = `content/${type}/${slug}`;
  return {dir, index: `${dir}/index.md`, image: config.imageFile ? `${dir}/${config.imageFile}` : undefined};
}

export type EntrySummary = {
  slug: string;
  title: string;
  subtitle: string;
  concept: boolean;
  datum?: string;
  volgorde: number;
  aliases: string[];
};

const titleField: Record<EntryType, string> = {activiteiten: 'titel', nieuws: 'titel', team: 'naam', faq: 'vraag'};
const subtitleField: Record<EntryType, string> = {activiteiten: 'datum', nieuws: 'datum', team: 'rol', faq: ''};

const asText = (value: unknown) => (typeof value === 'string' ? value : '');

export function summarize(type: EntryType, slug: string, text: string): EntrySummary {
  const {data} = parseMarkdownSource(text, slug);
  const datum = typeof data.datum === 'string' ? data.datum : undefined;
  return {
    slug,
    title: asText(data[titleField[type]]) || slug,
    subtitle: asText(data[subtitleField[type]]),
    concept: data.concept === true,
    datum,
    volgorde: typeof data.volgorde === 'number' ? data.volgorde : 99,
    aliases: Array.isArray(data.aliassen) ? data.aliassen.filter((item): item is string => typeof item === 'string') : [],
  };
}

/** Slugs of the items in a collection, from the directory listing on the content branch. */
export async function listSlugs(type: EntryType): Promise<string[]> {
  const entries = await listDir(`content/${type}`);
  if (entries.length === 0) {
    return [];
  }

  if (entryTypes[type].singleFile) {
    return entries.filter(entry => entry.type === 'file' && entry.name.endsWith('.md')).map(entry => entry.name.slice(0, -3));
  }

  return entries.filter(entry => entry.type === 'dir').map(entry => entry.name);
}

/** All items of a type, read from the content branch and sorted the way the site shows them. */
export async function listEntries(type: EntryType): Promise<EntrySummary[]> {
  const slugs = await listSlugs(type);
  const summaries = await Promise.all(slugs.map(async slug => {
    const file = await readFile(entryPaths(type, slug).index);
    return file ? summarize(type, slug, file.text) : undefined;
  }));
  const items = summaries.filter((item): item is EntrySummary => item !== undefined);
  if (type === 'nieuws' || type === 'activiteiten') {
    return items.sort((a, b) => (b.datum ?? '').localeCompare(a.datum ?? ''));
  }

  return items.sort((a, b) => a.volgorde - b.volgorde || a.title.localeCompare(b.title, 'nl'));
}

export type LoadedEntry = {
  values: Record<string, string>;
  body: string;
  concept: boolean;
  aliases: string[];
  indexSha: string;
  imageSha: string;
};

/** Reads one item for the edit form, with the blob SHAs used for conflict detection. */
export async function loadEntry(type: EntryType, slug: string): Promise<LoadedEntry | undefined> {
  const config = entryTypes[type];
  const paths = entryPaths(type, slug);
  const file = await readFile(paths.index);
  if (!file) {
    return undefined;
  }

  const {data, body} = parseMarkdownSource(file.text, paths.index);
  const values: Record<string, string> = {};
  for (const field of config.fields) {
    const value = data[field.name];
    values[field.name] = typeof value === 'string' || typeof value === 'number' ? String(value) : '';
  }

  if (config.listField) {
    const list = data[config.listField];
    values[config.listField] = JSON.stringify(Array.isArray(list) ? list : []);
  }

  let imageSha = '';
  if (paths.image) {
    const entries = await listDir(paths.dir);
    imageSha = entries.find(entry => entry.path === paths.image)?.sha ?? '';
  }

  return {
    values,
    body: body.trim(),
    concept: data.concept === true,
    aliases: Array.isArray(data.aliassen) ? data.aliassen.filter((item): item is string => typeof item === 'string') : [],
    indexSha: file.sha,
    imageSha,
  };
}
