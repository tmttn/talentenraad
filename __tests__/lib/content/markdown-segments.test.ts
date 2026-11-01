import {renderMarkdown, renderMarkdownSegments} from '@lib/content/markdown';

describe('renderMarkdownSegments', () => {
  it('puts top-level quotes apart from the rest, in order', () => {
    expect(renderMarkdownSegments('Voor\n\n> Een **fietsparcours**!\n\nNa')).toEqual([
      {kind: 'html', html: '<p>Voor</p>\n'},
      {kind: 'quote', html: '<p>Een <strong>fietsparcours</strong>!</p>'},
      {kind: 'html', html: '\n<p>Na</p>'},
    ]);
  });

  it('gives one html segment without quotes and none for an empty body', () => {
    expect(renderMarkdownSegments('Gewoon tekst')).toEqual([{kind: 'html', html: '<p>Gewoon tekst</p>'}]);
    expect(renderMarkdownSegments('')).toEqual([]);
  });

  it('keeps a nested quote inside its outer quote', () => {
    const [segment] = renderMarkdownSegments('> buiten\n>\n> > binnen');
    expect(segment.kind).toBe('quote');
    expect(segment.html).toContain('<blockquote>');
    expect(segment.html).toContain('binnen');
  });

  it('cannot be cut open by quote-like text in an attribute', () => {
    const markdown = '[x](https://a.be "<blockquote><img src=x onerror=alert(1)>")\n\n> echt citaat';
    const segments = renderMarkdownSegments(markdown);
    expect(segments.map(segment => segment.kind)).toEqual(['html', 'quote']);
    expect(segments[1].html).toBe('<p>echt citaat</p>');
    // The attribute text stays inside the attribute: no element is created from it
    const probe = document.createElement('div');
    probe.innerHTML = segments.map(segment => segment.html).join('');
    expect(probe.querySelector('img')).toBeNull();
    expect(probe.querySelectorAll('blockquote')).toHaveLength(0);
  });

  it('sanitizes like the normal renderer', () => {
    expect(renderMarkdownSegments('<script>alert(1)</script>\n\n> <img src=x onerror=alert(1)>')
      .map(segment => segment.html).join('')).not.toMatch(/script|onerror/);
    expect(renderMarkdown('> q')).toContain('<blockquote>');
  });
});
