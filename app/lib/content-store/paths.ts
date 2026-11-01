import { slugify } from '../content/slugify';
import { ContentStoreError } from './errors';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const COLLECTIONS = ['activiteiten', 'nieuws', 'team', 'faq'] as const;

const ITEM_FILES: Record<string, readonly string[]> = {
  activiteiten: ['index.md', 'afbeelding.jpg'],
  nieuws: ['index.md', 'afbeelding.jpg'],
  team: ['index.md', 'foto.jpg'],
};

function isSlug(value: string): boolean {
  return SLUG.test(value) && slugify(value) === value;
}

function notAllowed(path: string): never {
  throw new ContentStoreError(`Dit pad is niet toegestaan: ${path.slice(0, 200)}`);
}

/** Throws unless `path` is exactly one of the file paths the editor may touch. */
export function assertAllowedPath(path: string): void {
  if (path === 'content/site.yaml') {
    return;
  }

  const parts = path.split('/');
  const [root, collection, ...rest] = parts;
  if (root !== 'content' || !collection) {
    notAllowed(path);
  }

  if (collection === 'faq') {
    const match = /^(.+)\.md$/.exec(rest[0] ?? '');
    if (rest.length === 1 && match && isSlug(match[1])) {
      return;
    }

    notAllowed(path);
  }

  const files = ITEM_FILES[collection];
  if (files && rest.length === 2 && isSlug(rest[0]) && files.includes(rest[1])) {
    return;
  }

  notAllowed(path);
}

/** Throws unless `dir` is `content`, a collection folder or an item folder. */
export function assertAllowedDir(dir: string): void {
  const [root, collection, slug, ...rest] = dir.split('/');
  const ok = root === 'content'
    && rest.length === 0
    && (collection === undefined || (COLLECTIONS as readonly string[]).includes(collection))
    && (slug === undefined || (collection !== 'faq' && isSlug(slug)))
    && (collection !== undefined || slug === undefined);
  if (!ok) {
    notAllowed(dir);
  }
}
