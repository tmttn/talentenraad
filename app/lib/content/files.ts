import {readFileSync} from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import {imageSize} from 'image-size';
import {load} from 'js-yaml';

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

	const {width, height} = imageSize(buffer);
	const posix = relative.split(path.sep).join('/');
	return {src: `/content/${entryDir}/${posix}`, width, height};
}

export function readMarkdownFile(file: string): {data: Record<string, unknown>; body: string} {
	const parsed = matter(readFileSync(file, 'utf8'));
	return {data: parsed.data, body: parsed.content};
}

export function readYamlFile(file: string): unknown {
	return load(readFileSync(file, 'utf8'));
}
