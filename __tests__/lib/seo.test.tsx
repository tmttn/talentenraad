import {render} from '@testing-library/react';
import {
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateEventSchema,
  generateMetadata,
  generateOrganizationSchema,
  JsonLd,
  serializeJsonLd,
  siteConfig,
} from '../../app/lib/seo';

describe('generateMetadata', () => {
  it('uses the bare site name as title and the default image', () => {
    const metadata = generateMetadata({title: siteConfig.name, description: 'd'});
    expect(metadata.title).toEqual({absolute: siteConfig.name});
    expect(metadata.alternates?.canonical).toBe(siteConfig.url);
    expect(metadata.openGraph?.images).toEqual([expect.objectContaining({url: `${siteConfig.url}${siteConfig.defaultImage}`})]);
  });

  it('suffixes titles, resolves relative and absolute images and noIndex', () => {
    const relative = generateMetadata({
      title: 'Pagina', description: 'd', url: '/pagina', image: '/content/x.png', noIndex: true,
    });
    expect(relative.title).toEqual({absolute: `Pagina | ${siteConfig.name}`});
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

describe('serializeJsonLd', () => {
  it('escapes < so data cannot close the script tag', () => {
    const data = {name: '</script><script>alert(1)</script>'};
    const json = serializeJsonLd(data);
    expect(json).not.toContain('<');
    expect(JSON.parse(json)).toEqual(data);
    const {container} = render(<JsonLd data={data} />);
    expect(container.querySelectorAll('script')).toHaveLength(1);
    expect(container.querySelector('script')?.innerHTML).not.toContain('</script');
  });
});
