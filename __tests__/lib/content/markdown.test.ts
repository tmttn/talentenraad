// @vitest-environment node
import path from 'node:path';
import {resolveImage} from '@lib/content/files';
import {renderMarkdown} from '@lib/content/markdown';

const fixtures = path.join(__dirname, '../../fixtures/content');

describe('renderMarkdown', () => {
  it('renders markdown', () => {
    expect(renderMarkdown('**vet**')).toContain('<strong>vet</strong>');
  });

  it('strips scripts and event handlers', () => {
    expect(renderMarkdown('<script>alert(1)</script>tekst')).not.toContain('<script');
    expect(renderMarkdown('<img src=x onerror="alert(1)">')).not.toContain('onerror');
  });

  it('removes javascript: urls', () => {
    expect(renderMarkdown('[klik](javascript:alert(1))')).not.toContain('javascript:');
  });

  it('keeps links', () => {
    expect(renderMarkdown('[link](https://talentenhuis.be)')).toContain('href="https://talentenhuis.be"');
  });
});

describe('resolveImage', () => {
  it('returns src and dimensions', () => {
    expect(resolveImage(fixtures, 'activiteiten/met-foto', './afbeelding.jpg'))
      .toEqual({src: '/content/activiteiten/met-foto/afbeelding.jpg', width: 2, height: 2});
  });

  it('throws for missing files with the ref', () => {
    expect(() => resolveImage(fixtures, 'activiteiten/met-foto', './bestaat-niet.jpg')).toThrow(/bestaat-niet\.jpg/);
  });

  it('rejects refs escaping entryDir', () => {
    expect(() => resolveImage(fixtures, 'activiteiten/met-foto', '../../site.yaml')).toThrow(/\.\.\/\.\.\/site\.yaml/);
    expect(() => resolveImage(fixtures, 'activiteiten/met-foto', '/etc/passwd')).toThrow(/etc\/passwd/);
  });
});
