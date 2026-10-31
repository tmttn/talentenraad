import {render, screen} from '@testing-library/react';
import {content} from '@lib/content';
import TekstPage, {generateMetadata, generateStaticParams} from '../../../app/(main)/[tekst]/page';

const {notFound} = vi.hoisted(() => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

vi.mock('next/navigation', () => ({notFound}));

vi.mock('@lib/content', () => ({content: {listTeksten: vi.fn(), getTekst: vi.fn()}}));

vi.mock('@components/layout/page-with-announcements', () => ({
  PageWithAnnouncements: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
}));

const tekst = {
  titel: 'Fictief beleid',
  beschrijving: 'Fictieve beleidsbeschrijving',
  concept: false,
  slug: 'fictief-beleid',
  html: '<h2>Eerste kop</h2><p>Fictieve alinea</p>',
};

describe('Tekst page', () => {
  beforeEach(() => {
    vi.mocked(content.listTeksten).mockReturnValue([tekst]);
    vi.mocked(content.getTekst).mockImplementation(slug => slug === tekst.slug ? tekst : undefined);
  });

  it('generates static params from listTeksten', () => {
    expect(generateStaticParams()).toEqual([{tekst: 'fictief-beleid'}]);
  });

  it('renders title as h1 and the html body', async () => {
    render(await TekstPage({params: Promise.resolve({tekst: 'fictief-beleid'})}));
    expect(screen.getByRole('heading', {level: 1, name: 'Fictief beleid'})).toBeInTheDocument();
    expect(screen.getByRole('heading', {level: 2, name: 'Eerste kop'})).toBeInTheDocument();
    expect(screen.getByText('Fictieve alinea')).toBeInTheDocument();
  });

  it('calls notFound for an unknown slug', async () => {
    await expect(TekstPage({params: Promise.resolve({tekst: 'onbekend'})})).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });

  it('generates metadata from titel and beschrijving', async () => {
    const metadata = await generateMetadata({params: Promise.resolve({tekst: 'fictief-beleid'})});
    expect(metadata).toMatchObject({
      description: 'Fictieve beleidsbeschrijving',
      alternates: {canonical: 'https://talentenraad.be/fictief-beleid'},
    });
    expect(String(metadata.title)).toContain('Fictief beleid');
    expect(metadata.openGraph).toMatchObject({description: 'Fictieve beleidsbeschrijving'});
    expect(String(metadata.openGraph?.title)).toContain('Fictief beleid');
  });

  it('renders breadcrumb JSON-LD', async () => {
    const {container} = render(await TekstPage({params: Promise.resolve({tekst: 'fictief-beleid'})}));
    const script = container.querySelector('script[type="application/ld+json"]');
    const data = JSON.parse(script?.textContent ?? '{}') as {itemListElement: Array<{name: string; item: string}>};
    expect(data.itemListElement.map(i => i.name)).toEqual(['Home', 'Fictief Beleid']);
  });
});
