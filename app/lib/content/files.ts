import {readFileSync} from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import {imageSize} from 'image-size';
import {CORE_SCHEMA, load} from 'js-yaml';

export type ContentImage = {src: string; width: number; height: number};

export function resolveImage(rootDir: string, entryDir: string, ref: string): ContentImage {
  const base = path.resolve(rootDir, entryDir);
  const file = path.resolve(base, ref);
  const relative = path.relative(base, file);
  if (relative === '' || relative.startsWith('..') || path.isAbsolute(relative) || path.isAbsolute(ref)) {
    throw new Error(`Afbeelding "${ref}" ligt buiten ${entryDir}`);
  }

  let buffer: Uint8Array;
  try {
    buffer = readFileSync(file);
  } catch {
    throw new Error(`Afbeelding "${ref}" niet gevonden in ${entryDir}`);
  }

  let width: number;
  let height: number;
  try {
    ({width, height} = imageSize(buffer));
  } catch (error) {
    throw new Error(`Afbeelding "${ref}" in ${entryDir} is geen geldige afbeelding: ${(error as Error).message}`, {cause: error});
  }

  const posix = relative.split(path.sep).join('/');
  return {src: `/content/${entryDir}/${posix}`, width, height};
}

// CORE_SCHEMA keeps unquoted dates as strings, so no Date objects, rollover or timezone shifts.
const parseYaml = (source: string): unknown => load(source, {schema: CORE_SCHEMA});

export function parseMarkdownSource(source: string, file: string): {data: Record<string, unknown>; body: string} {
  const disabled = () => {
    throw new Error(`Uitvoerbare frontmatter is niet toegestaan: ${file}`);
  };
  const parsed = matter(source, {
    engines: {
      yaml: {parse: source => parseYaml(source) as object, stringify: () => ''},
      js: disabled,
      javascript: disabled,
    },
  });
  return {data: parsed.data, body: parsed.content};
}

export function readMarkdownFile(file: string): {data: Record<string, unknown>; body: string} {
  return parseMarkdownSource(readFileSync(file, 'utf8'), file);
}

export function readYamlFile(file: string): unknown {
  return parseYaml(readFileSync(file, 'utf8'));
}
