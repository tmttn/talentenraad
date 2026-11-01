// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { assertAllowedDir, assertAllowedPath } from '@lib/content-store/paths';

describe('assertAllowedPath', () => {
  it.each([
    'content/site.yaml',
    'content/activiteiten/spaghetti-avond/index.md',
    'content/activiteiten/spaghetti-avond/afbeelding.jpg',
    'content/nieuws/nieuw-2026/index.md',
    'content/nieuws/nieuw-2026/afbeelding.jpg',
    'content/team/jan/index.md',
    'content/team/jan/foto.jpg',
    'content/faq/hoe-laat.md',
  ])('allows %s', path => {
    expect(() => assertAllowedPath(path)).not.toThrow();
  });

  it.each([
    'content/../package.json',
    'content/activiteiten/../../.env/index.md',
    'content/activiteiten/../index.md',
    '/etc/passwd',
    '/content/site.yaml',
    'content/activiteiten/Spaghetti/index.md',
    'content/activiteiten/-x/index.md',
    'content/activiteiten/x--y/index.md',
    'content/activiteiten/x/foto.jpg',
    'content/team/jan/afbeelding.jpg',
    'content/activiteiten/x/index.md/extra',
    'content/activiteiten/x/index.md ',
    'content/activiteiten/x/.gitmodules',
    'content/activiteiten/x/link',
    'content/faq/a/b.md',
    'content/faq/UP.md',
    'content/other/x/index.md',
    'content/site.yml',
    '.github/workflows/deploy.yml',
    'app/page.tsx',
    'content/activiteiten//index.md',
    'content\\site.yaml',
    '',
  ])('rejects %j', path => {
    expect(() => assertAllowedPath(path)).toThrow();
  });
});

describe('assertAllowedDir', () => {
  it.each(['content/activiteiten', 'content/faq', 'content/activiteiten/x'])('allows %s', dir => {
    expect(() => assertAllowedDir(dir)).not.toThrow();
  });

  it.each(['content/../app', '/content', 'app', 'content/other', 'content/activiteiten/X'])('rejects %s', dir => {
    expect(() => assertAllowedDir(dir)).toThrow();
  });
});
