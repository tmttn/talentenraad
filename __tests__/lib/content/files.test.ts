// @vitest-environment node
import path from 'node:path';
import {readMarkdownFile, readYamlFile} from '@lib/content/files';

const fixtures = path.join(__dirname, '../../fixtures/content');

describe('readMarkdownFile', () => {
  it('splits frontmatter and body', () => {
    const result = readMarkdownFile(path.join(fixtures, 'activiteiten/met-foto/index.md'));
    expect(result.data).toEqual({titel: 'Met foto', afbeelding: './foto.png'});
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
    expect(readYamlFile(path.join(fixtures, 'site.yaml'))).toEqual({naam: 'Talentenraad', lijst: ['a', 'b']});
  });
});
