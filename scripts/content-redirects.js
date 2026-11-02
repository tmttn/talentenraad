// Permanent redirects for the old addresses (`aliassen`) of activities and news, read from content/ when
// next.config.js loads, so they are part of the build. CommonJS because next.config.js requires it.
const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');
const {CORE_SCHEMA, load} = require('js-yaml');

const collections = [
  {dir: 'activiteiten', route: '/activiteiten'},
  {dir: 'nieuws', route: '/nieuws'},
];

// Anything else would mean something in a Next.js path pattern (`:`, `(`, `*`, …)
const safeSegment = /^[a-z0-9-]+$/;

const disabled = () => {
  throw new Error('Uitvoerbare frontmatter is niet toegestaan');
};

// Same YAML settings as the app (CORE_SCHEMA: dates stay strings); no executable frontmatter
function readFrontmatter(file) {
  return matter(fs.readFileSync(file, 'utf8'), {
    engines: {yaml: {parse: source => load(source, {schema: CORE_SCHEMA})}, js: disabled, javascript: disabled},
  }).data;
}

/**
 * Redirects from `/<route>/<alias>` to `/<route>/<slug>` for every published item.
 * Skipped, with a warning: an alias that is also an existing slug (it would send a real page away),
 * the same alias on two items, and aliases with characters a path pattern would misread.
 */
function contentRedirects(rootDir, warn = console.warn) {
  const redirects = [];

  for (const {dir, route} of collections) {
    const base = path.join(rootDir, dir);
    if (!fs.existsSync(base)) {
      continue;
    }

    const items = fs.readdirSync(base)
      .filter(name => fs.existsSync(path.join(base, name, 'index.md')))
      .sort()
      .map(slug => ({slug, data: readFrontmatter(path.join(base, slug, 'index.md'))}))
      .filter(item => item.data.concept !== true);
    const slugs = new Set(items.map(item => item.slug));
    const seen = new Set();

    for (const {slug, data} of items) {
      const aliases = Array.isArray(data.aliassen) ? data.aliassen.filter(alias => typeof alias === 'string') : [];
      for (const alias of aliases) {
        if (!safeSegment.test(alias)) {
          warn(`${dir}/${slug}: alias "${alias}" overgeslagen (alleen kleine letters, cijfers en streepjes)`);
        } else if (slugs.has(alias)) {
          warn(`${dir}/${slug}: alias "${alias}" overgeslagen (is ook de slug van een item)`);
        } else if (seen.has(alias)) {
          warn(`${dir}/${slug}: alias "${alias}" overgeslagen (staat al bij een ander item)`);
        } else {
          seen.add(alias);
          redirects.push({source: `${route}/${alias}`, destination: `${route}/${slug}`, permanent: true});
        }
      }
    }
  }

  return redirects;
}

module.exports = {contentRedirects};
