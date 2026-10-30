/** Exact copy of the old `generateSlug` in activities-list.tsx; keeps existing URLs reproducible. */
export function legacySlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replaceAll(/[̀-ͯ]/g, '')
    .replaceAll(/[^a-z\d\s-]/g, '')
    .replaceAll(/\s+/g, '-')
    .replaceAll(/-+/g, '-')
    .trim();
}

/** Clean slug: like `legacySlug`, without leading or trailing dashes. */
export function slugify(text: string): string {
  return legacySlug(text).replaceAll(/^-+|-+$/g, '');
}
