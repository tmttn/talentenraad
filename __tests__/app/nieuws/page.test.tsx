import {render, screen} from '@testing-library/react';
import {content} from '@lib/content';
import NewsDetailPage, {generateMetadata, generateStaticParams} from '../../../app/(main)/nieuws/[slug]/page';
import {makeNieuws} from '../../fixtures/content';

const {notFound, permanentRedirect} = vi.hoisted(() => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
  permanentRedirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

vi.mock('next/navigation', () => ({notFound, permanentRedirect}));

vi.mock('@lib/content', () => ({
  content: {getNieuwsItem: vi.fn(), getNieuws: vi.fn()},
}));

vi.mock('@components/ui', () => ({
  AnimatedLink: ({children, href}: {children: React.ReactNode; href: string}) => <a href={href}>{children}</a>,
}));

vi.mock('@components/layout/page-with-announcements', () => ({
  PageWithAnnouncements: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
}));

const getNieuwsItem = vi.mocked(content.getNieuwsItem);
const renderPage = async (slug: string) => render(await NewsDetailPage({params: Promise.resolve({slug})}));

describe('NewsDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title, summary, date and html body', async () => {
    getNieuwsItem.mockReturnValue(makeNieuws({titel: 'Lentebericht', datum: '2025-03-15'}));
    await renderPage('voorbeeldbericht');
    expect(screen.getByRole('heading', {level: 1, name: 'Lentebericht'})).toBeInTheDocument();
    expect(screen.getByText('Een fictieve samenvatting van het bericht.')).toBeInTheDocument();
    expect(screen.getByText('Fictieve inhoud van het bericht')).toBeInTheDocument();
    expect(screen.getByText(/15 maart 2025/)).toBeInTheDocument();
  });

  it('renders breadcrumb and back link', async () => {
    getNieuwsItem.mockReturnValue(makeNieuws());
    await renderPage('voorbeeldbericht');
    expect(screen.getByRole('navigation', {name: 'Breadcrumb'})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Terug naar nieuws'})).toHaveAttribute('href', '/nieuws');
  });

  it('renders the image only when present', async () => {
    getNieuwsItem.mockReturnValue(makeNieuws({afbeelding: {src: '/content/nieuws/x/foto.png', width: 400, height: 300}}));
    const {container, unmount} = await renderPage('voorbeeldbericht');
    expect(container.querySelector('img')).toHaveAttribute('alt', 'Voorbeeldbericht');
    unmount();

    getNieuwsItem.mockReturnValue(makeNieuws({html: ''}));
    const second = await renderPage('voorbeeldbericht');
    expect(second.container.querySelector('img')).not.toBeInTheDocument();
    expect(screen.queryByText('Fictieve inhoud van het bericht')).not.toBeInTheDocument();
  });

  it('redirects an alias to the canonical url', async () => {
    getNieuwsItem.mockReturnValue(makeNieuws({slug: 'echte-slug'}));
    await expect(renderPage('-oude-slug')).rejects.toThrow('NEXT_REDIRECT:/nieuws/echte-slug');
    expect(permanentRedirect).toHaveBeenCalledWith('/nieuws/echte-slug');
  });

  it('calls notFound for an unknown slug', async () => {
    getNieuwsItem.mockReturnValue(undefined);
    await expect(renderPage('bestaat-niet')).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });
});

describe('NewsDetailPage metadata and params', () => {
  it('builds metadata from title and summary', async () => {
    getNieuwsItem.mockReturnValue(makeNieuws({titel: 'Lentebericht'}));
    const metadata = await generateMetadata({params: Promise.resolve({slug: 'voorbeeldbericht'})});
    expect(metadata.title).toEqual({absolute: 'Lentebericht | Talentenraad'});
    expect(metadata.description).toBe('Een fictieve samenvatting van het bericht.');
  });

  it('falls back when the item is unknown', async () => {
    getNieuwsItem.mockReturnValue(undefined);
    expect(await generateMetadata({params: Promise.resolve({slug: 'x'})})).toEqual({title: 'Nieuws niet gevonden'});
  });

  it('generates static params from real slugs', () => {
    vi.mocked(content.getNieuws).mockReturnValue([makeNieuws({slug: 'a'}), makeNieuws({slug: 'b'})]);
    expect(generateStaticParams()).toEqual([{slug: 'a'}, {slug: 'b'}]);
  });
});
