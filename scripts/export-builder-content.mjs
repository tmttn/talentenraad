#!/usr/bin/env node
/**
 * Eenmalige export van alle Builder.io-content naar content-export/.
 *
 * Doel: alles uit Builder.io veiligstellen vóór we de afhankelijkheid
 * verwijderen. Schrijft per model een JSON-bestand (alle entries, ook
 * concepten) en downloadt alle afbeeldingen van de Builder-CDN, zodat
 * de migratie naar Markdown-content in de repo offline kan gebeuren.
 *
 * Gebruik:
 *   BUILDER_PUBLIC_KEY=... BUILDER_PRIVATE_KEY=bpk-... node scripts/export-builder-content.mjs
 *
 * De publieke key staat in Builder.io onder Account settings → Space
 * (of als NEXT_PUBLIC_BUILDER_API_KEY in de Vercel-omgeving).
 * Zet de keys in .env.local; dat bestand wordt niet gecommit.
 */
import {mkdir, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {config} from 'dotenv';

config({path: '.env.local'});
config();

const publicKey = process.env.BUILDER_PUBLIC_KEY ?? process.env.NEXT_PUBLIC_BUILDER_API_KEY;
const privateKey = process.env.BUILDER_PRIVATE_KEY;
const outDir = path.resolve('content-export');
const pageSize = 100;

if (!publicKey || !privateKey) {
  console.error('Zet BUILDER_PUBLIC_KEY en BUILDER_PRIVATE_KEY (bv. in .env.local).');
  process.exit(1);
}

async function listModels() {
  const response = await fetch('https://builder.io/api/v2/admin', {
    method: 'POST',
    headers: {'Content-Type': 'application/json', Authorization: `Bearer ${privateKey}`},
    body: JSON.stringify({query: '{ models { id name kind fields } }'}),
  });
  const body = await response.json();
  if (body.errors) {
    throw new Error(`Admin API: ${body.errors[0].message}`);
  }

  return body.data.models;
}

async function fetchAllEntries(model) {
  const entries = [];
  for (let offset = 0; ; offset += pageSize) {
    const url = new URL(`https://cdn.builder.io/api/v3/content/${model}`);
    url.searchParams.set('apiKey', publicKey);
    url.searchParams.set('limit', String(pageSize));
    url.searchParams.set('offset', String(offset));
    url.searchParams.set('includeUnpublished', 'true');
    url.searchParams.set('cachebust', 'true');
    url.searchParams.set('noCache', 'true');
    // eslint-disable-next-line no-await-in-loop
    const response = await fetch(url, {headers: {Authorization: `Bearer ${privateKey}`}});
    if (!response.ok) {
      throw new Error(`${model}: HTTP ${response.status}`);
    }

    // eslint-disable-next-line no-await-in-loop
    const {results} = await response.json();
    entries.push(...results);
    if (results.length < pageSize) {
      return entries;
    }
  }
}

function collectAssetUrls(value, found = new Set()) {
  if (typeof value === 'string') {
    for (const match of value.matchAll(/https:\/\/cdn\.builder\.io\/[^\s"')\]>]+/g)) {
      found.add(match[0]);
    }
  } else if (Array.isArray(value)) {
    for (const item of value) {
      collectAssetUrls(item, found);
    }
  } else if (value && typeof value === 'object') {
    for (const item of Object.values(value)) {
      collectAssetUrls(item, found);
    }
  }

  return found;
}

const extensionByType = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'application/pdf': '.pdf',
};

async function downloadAsset(url) {
  // Vraag het origineel op, zonder Builder-resize-parameters.
  const original = url.split('?')[0];
  const response = await fetch(original);
  if (!response.ok) {
    return {url, error: `HTTP ${response.status}`};
  }

  const type = (response.headers.get('content-type') ?? '').split(';')[0];
  const bytes = Buffer.from(await response.arrayBuffer());
  const hash = createHash('sha1').update(original).digest('hex').slice(0, 12);
  const file = `${hash}${extensionByType[type] ?? ''}`;
  await writeFile(path.join(outDir, 'assets', file), bytes);
  return {url, file, type, size: bytes.length};
}

await mkdir(path.join(outDir, 'assets'), {recursive: true});
const models = await listModels();
await writeFile(path.join(outDir, '_models.json'), JSON.stringify(models, null, 2));
console.log(`${models.length} modellen gevonden`);

const allUrls = new Set();
for (const model of models) {
  // eslint-disable-next-line no-await-in-loop
  const entries = await fetchAllEntries(model.name);
  // eslint-disable-next-line no-await-in-loop
  await writeFile(path.join(outDir, `${model.name}.json`), JSON.stringify(entries, null, 2));
  collectAssetUrls(entries, allUrls);
  console.log(`  ${model.name}: ${entries.length} entries`);
}

console.log(`${allUrls.size} assets downloaden...`);
const manifest = [];
for (const url of allUrls) {
  // eslint-disable-next-line no-await-in-loop
  manifest.push(await downloadAsset(url));
}

await writeFile(path.join(outDir, '_assets.json'), JSON.stringify(manifest, null, 2));
const failed = manifest.filter(item => item.error);
console.log(`Klaar. ${manifest.length - failed.length} assets opgeslagen, ${failed.length} mislukt (zie _assets.json).`);
