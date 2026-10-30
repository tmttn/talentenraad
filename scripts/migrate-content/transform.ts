import TurndownService from 'turndown';
import {legacySlug, slugify} from '../../app/lib/content/slugify';

export type ExtractedBlock = {
  component: string;
  options: Record<string, unknown>;
  text?: string;
};

const emailPattern = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;

const turndown = new TurndownService({headingStyle: 'atx', bulletListMarker: '-'});

export function htmlToMarkdown(html: string): string {
  // Turndown escapes "1." after a heading marker; that is needless inside headings.
  return turndown.turndown(html).replaceAll(/^(#{1,6} \d+)\\\./gm, '$1.').trim();
}

function isAllowed(address: string, allowlist: string[]): boolean {
  return allowlist.some(allowed => allowed.toLowerCase() === address.toLowerCase());
}

/**
 * Removes a `Contact: <address>` fragment (the address optionally wrapped in a
 * mailto link) together with the whitespace/line break before it, unless the
 * address is on the allowlist.
 */
export function stripPersonalEmails(markdown: string, allowlist: string[]): string {
  const fragment = /(?:[ \t]*\r?\n)?[ \t]*Contact:[ \t]*(?:\[[^\]]*]\(mailto:([^)\s]+)\)|([\w.+-]+@[\w-]+(?:\.[\w-]+)+))/g;
  return markdown.replaceAll(fragment, (match: string, linked: string | undefined, plain: string | undefined) => {
    const address = linked ?? plain ?? '';
    return isAllowed(address, allowlist) ? match : '';
  });
}

export function findDisallowedEmails(text: string, allowlist: string[]): string[] {
  const found = text.match(emailPattern) ?? [];
  return [...new Set(found.filter(address => !isAllowed(address, allowlist)))];
}

export function slugsFor(titel: string): {slug: string; aliassen: string[]} {
  const slug = slugify(titel);
  const legacy = legacySlug(titel);
  return {slug, aliassen: legacy === slug ? [] : [legacy]};
}

export function assertUniqueSlugs(items: {collectie: string; slug: string; aliassen: string[]}[]): void {
  const owners = new Map<string, number>();
  for (const [index, item] of items.entries()) {
    for (const key of [item.slug, ...item.aliassen]) {
      const mapKey = `${item.collectie}/${key}`;
      const owner = owners.get(mapKey);
      if (owner !== undefined && owner !== index) {
        throw new Error(`Dubbele slug of alias "${key}" in collectie "${item.collectie}"`);
      }

      owners.set(mapKey, index);
    }
  }
}

const entities: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': '\'',
  '&nbsp;': ' ',
};

function htmlToPlain(html: string): string {
  return html
    .replaceAll(/<[^>]*>/g, ' ')
    .replaceAll(/&(?:amp|lt|gt|quot|#39|nbsp);/g, entity => entities[entity] ?? entity)
    .replaceAll(/\s+/g, ' ')
    .trim();
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? value as Record<string, unknown> : {};
}

/** Flattens a Builder block tree in document order; keeps Typography/Text text as plain text. */
export function extractTexts(blocks: unknown[]): ExtractedBlock[] {
  const result: ExtractedBlock[] = [];
  for (const raw of blocks) {
    const block = asRecord(raw);
    const component = asRecord(block.component);
    if (typeof component.name === 'string') {
      const options = asRecord(component.options);
      const entry: ExtractedBlock = {component: component.name, options};
      if ((component.name === 'Typography' || component.name === 'Text') && typeof options.text === 'string') {
        entry.text = htmlToPlain(options.text);
      }

      result.push(entry);
    }

    if (Array.isArray(block.children)) {
      result.push(...extractTexts(block.children as unknown[]));
    }
  }

  return result;
}
