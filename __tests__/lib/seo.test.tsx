import {render} from '@testing-library/react';
import {
  analyzeSeo,
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateEventSchema,
  generateMetadata,
  generateOrganizationSchema,
  getSeoScoreBgColor,
  getSeoScoreColor,
  getSeoScoreLabel,
  JsonLd,
  siteConfig,
} from '../../app/lib/seo';

describe('generateMetadata', () => {
  it('uses the bare site name as title and the default image', () => {
    const metadata = generateMetadata({title: siteConfig.name, description: 'd'});
    expect(metadata.title).toBe(siteConfig.name);
    expect(metadata.alternates?.canonical).toBe(siteConfig.url);
    expect(metadata.openGraph?.images).toEqual([expect.objectContaining({url: `${siteConfig.url}${siteConfig.defaultImage}`})]);
  });

  it('suffixes titles, resolves relative and absolute images and noIndex', () => {
    const relative = generateMetadata({
      title: 'Pagina', description: 'd', url: '/pagina', image: '/content/x.png', noIndex: true,
    });
    expect(relative.title).toBe(`Pagina | ${siteConfig.name}`);
    expect(relative.alternates?.canonical).toBe(`${siteConfig.url}/pagina`);
    expect(relative.twitter?.images).toEqual([`${siteConfig.url}/content/x.png`]);
    expect(relative.robots).toEqual({index: false, follow: false});

    const absolute = generateMetadata({
      title: 'Pagina', description: 'd', image: 'https://voorbeeld.test/a.png',
    });
    expect(absolute.twitter?.images).toEqual(['https://voorbeeld.test/a.png']);
    expect(absolute.robots).toBeUndefined();
  });

  it('adds article times only for articles', () => {
    const article = generateMetadata({
      title: 'A', description: 'd', type: 'article', publishedTime: '2025-01-01', modifiedTime: '2025-01-02',
    });
    expect(article.openGraph).toMatchObject({publishedTime: '2025-01-01', modifiedTime: '2025-01-02'});
    const website = generateMetadata({title: 'A', description: 'd', publishedTime: '2025-01-01'});
    expect(website.openGraph).not.toHaveProperty('publishedTime');
    const bare = generateMetadata({title: 'A', description: 'd', type: 'article'});
    expect(bare.openGraph).not.toHaveProperty('publishedTime');
  });
});

describe('structured data', () => {
  it('builds organization data', () => {
    expect(generateOrganizationSchema()['@type']).toBe('Organization');
  });

  it('builds article data with image variants and modified date', () => {
    const base = {
      title: 'T', description: 'D', url: '/nieuws/t', datePublished: '2025-01-01',
    };
    expect(generateArticleSchema(base)).toMatchObject({image: undefined, dateModified: '2025-01-01'});
    expect(generateArticleSchema({...base, image: '/a.png', dateModified: '2025-02-01'}))
      .toMatchObject({image: `${siteConfig.url}/a.png`, dateModified: '2025-02-01'});
    expect(generateArticleSchema({...base, image: 'https://voorbeeld.test/a.png'}).image).toBe('https://voorbeeld.test/a.png');
  });

  it('builds event data with and without location', () => {
    const base = {name: 'E', url: '/activiteiten/e', startDate: '2025-01-01'};
    expect(generateEventSchema(base).location).toBeUndefined();
    expect(generateEventSchema({...base, location: 'Zaal'}).location).toEqual({'@type': 'Place', name: 'Zaal'});
  });

  it('builds breadcrumb data with positions', () => {
    const data = generateBreadcrumbSchema([{name: 'Home', url: '/'}, {name: 'Kalender', url: '/kalender'}]);
    expect(data.itemListElement.map(item => item.position)).toEqual([1, 2]);
  });

  it('renders JSON-LD', () => {
    const {container} = render(<JsonLd data={{a: 1}} />);
    expect(container.querySelector('script')?.innerHTML).toBe('{"a":1}');
  });
});

describe('analyzeSeo', () => {
  const words = (count: number) => Array.from({length: count}, () => 'woord').join(' ');

  it('scores a complete item as good', () => {
    const result = analyzeSeo({
      title: 'a'.repeat(40), description: 'b'.repeat(140), image: '/a.png', content: words(300),
    });
    expect(result.score).toBe(100);
    expect(result.issues).toEqual([]);
  });

  it('flags missing fields', () => {
    const result = analyzeSeo({content: ''});
    expect(result.fieldScores.title.status).toBe('missing');
    expect(result.fieldScores.description.status).toBe('missing');
    expect(result.fieldScores.image.status).toBe('missing');
    expect(result.fieldScores.content?.status).toBe('missing');
    expect(result.score).toBe(0);
    expect(result.quickWins[0].impact).toBe(35);
  });

  it('flags short and long titles and descriptions', () => {
    const short = analyzeSeo({title: 'kort', description: 'kort', image: 'x'});
    expect(short.fieldScores.title.status).toBe('warning');
    expect(short.fieldScores.description.status).toBe('warning');
    const long = analyzeSeo({title: 'a'.repeat(70), description: 'b'.repeat(170), image: 'x'});
    expect(long.fieldScores.title.recommendation).toContain('10 tekens');
    expect(long.fieldScores.description.recommendation).toContain('10 tekens');
  });

  it('grades content length', () => {
    const base = {title: 'a'.repeat(40), description: 'b'.repeat(140), image: 'x'};
    expect(analyzeSeo({...base, content: `<p>${words(50)}</p>`}).fieldScores.content?.score).toBe(15);
    expect(analyzeSeo({...base, content: words(150)}).fieldScores.content?.score).toBe(30);
    expect(analyzeSeo({...base, content: words(150)}).suggestions).toHaveLength(1);
  });

  it('maps scores to colors and labels', () => {
    expect([90, 70, 10].map(score => getSeoScoreColor(score))).toEqual(['text-green-600', 'text-yellow-600', 'text-red-600']);
    expect([90, 70, 10].map(score => getSeoScoreBgColor(score))).toEqual(['bg-green-100', 'bg-yellow-100', 'bg-red-100']);
    expect([90, 70, 10].map(score => getSeoScoreLabel(score))).toEqual(['Goed', 'Kan beter', 'Aandacht nodig']);
  });
});
