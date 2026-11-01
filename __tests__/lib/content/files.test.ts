// @vitest-environment node
import {mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {readMarkdownFile, readYamlFile, resolveImage} from '@lib/content/files';

const fixtures = path.join(__dirname, '../../fixtures/content');

describe('readMarkdownFile', () => {
  it('splits frontmatter and body', () => {
    const result = readMarkdownFile(path.join(fixtures, 'activiteiten/met-foto/index.md'));
    expect(result.data).toMatchObject({titel: 'Met foto', afbeelding: './afbeelding.jpg'});
    expect(result.body.trim()).toBe('Hallo **wereld**');
  });
});

describe('readMarkdownFile security', () => {
  it('refuses executable frontmatter', () => {
    const file = path.join(fixtures, 'js-frontmatter.md');
    expect(() => readMarkdownFile(file)).toThrow(/js-frontmatter\.md/);
  });
});

describe('readYamlFile', () => {
  it('parses yaml', () => {
    expect(readYamlFile(path.join(fixtures, 'site.yaml'))).toMatchObject({naam: 'Talentenraad', lijst: ['a', 'b']});
  });
});

describe('dates stay strings', () => {
  let tmp: string;
  beforeEach(() => {
    tmp = mkdtempSync(path.join(os.tmpdir(), 'content-files-'));
  });

  afterEach(() => {
    rmSync(tmp, {recursive: true, force: true});
  });

  it('keeps unquoted frontmatter dates as strings, also invalid ones', () => {
    const file = path.join(tmp, 'a.md');
    writeFileSync(file, '---\ndatum: 2025-02-30\nandere: 2025-02-07\n---\nTekst\n');
    expect(readMarkdownFile(file).data).toEqual({datum: '2025-02-30', andere: '2025-02-07'});
  });

  it('keeps unquoted yaml dates as strings', () => {
    const file = path.join(tmp, 'a.yaml');
    writeFileSync(file, 'datum: 2025-02-07\n');
    expect(readYamlFile(file)).toEqual({datum: '2025-02-07'});
  });

  it('names the file and folder when an image is corrupt', () => {
    writeFileSync(path.join(tmp, 'nep.png'), 'dit is geen afbeelding');
    expect(() => resolveImage(tmp, 'nieuws/x', '../../nep.png')).toThrow(/Afbeelding/);
    expect(() => resolveImage(tmp, '.', 'nep.png')).toThrow(/"nep\.png" in \./);
  });
});
