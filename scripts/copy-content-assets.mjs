import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const textExtensions = new Set(['.md', '.yaml', '.yml']);
// Allowlist: anything else (.html, .svg, ...) would be served from the site's origin.
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);

/**
 * Copies every image file from `contentDir` to `publicDir/content/`,
 * keeping relative paths. Clears `publicDir/content/` first.
 * Returns the copied relative paths (posix separators).
 */
export async function copyContentAssets(contentDir, publicDir) {
  const exists = await fs.stat(contentDir).then(stat => stat.isDirectory(), () => false);
  if (!exists) {
    return [];
  }

  const target = path.join(publicDir, 'content');
  await fs.rm(target, {recursive: true, force: true});

  const copied = [];
  const entries = await fs.readdir(contentDir, {recursive: true, withFileTypes: true});
  for (const entry of entries) {
    if (!entry.isFile() || textExtensions.has(path.extname(entry.name).toLowerCase())) {
      continue;
    }

    const source = path.join(entry.parentPath, entry.name);
    const relative = path.relative(contentDir, source);
    if (!imageExtensions.has(path.extname(entry.name).toLowerCase())) {
      throw new Error(`${relative.split(path.sep).join('/')}: bestandstype niet toegestaan in content/ (toegestaan: ${[...imageExtensions].join(' ')})`);
    }

    // eslint-disable-next-line no-await-in-loop
    await fs.mkdir(path.dirname(path.join(target, relative)), {recursive: true});
    // eslint-disable-next-line no-await-in-loop
    await fs.copyFile(source, path.join(target, relative));
    copied.push(relative.split(path.sep).join('/'));
  }

  return copied;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const copied = await copyContentAssets('content', 'public');
  console.log(`copy-content-assets: ${copied.length} bestand(en) gekopieerd`);
}
