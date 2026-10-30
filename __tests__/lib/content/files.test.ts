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

describe('readYamlFile', () => {
	it('parses yaml', () => {
		expect(readYamlFile(path.join(fixtures, 'site.yaml'))).toEqual({naam: 'Talentenraad', lijst: ['a', 'b']});
	});
});
