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

vi.mock('@components/layout/page-with-announcements', () => ({
  PageWithAnnouncements: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
}));

const getNieuwsItem = vi.mocked(content.getNieuwsItem);
const renderPage = async (slug: string) => render(await NewsDetailPage({params: Promise.resolve({slug})}));

describe('NewsDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders date, title, summary and body in a reading column', async () => {
    getNieuwsItem.mockReturnValue(makeNieuws({titel: 'Lentebericht', datum: '2025-03-15'}));
    vi.mocked(content.getNieuws).mockReturnValue([]);
    await renderPage('voorbeeldbericht');
    expect(screen.getByRole('heading', {level: 1, name: 'Lentebericht'})).toBeInTheDocument();
    expect(screen.getByText('Zaterdag 15 maart 2025')).toHaveAttribute('datetime', '2025-03-15');
    expect(screen.getByText('Een fictieve samenvatting van het bericht.')).toBeInTheDocument();
    expect(screen.getByText('Fictieve inhoud van het bericht')).toBeInTheDocument();
    expect(screen.getByRole('link', {name: /Terug naar nieuws/})).toHaveAttribute('href', '/nieuws');
    expect(screen.queryByText('Meer nieuws')).not.toBeInTheDocument();
  });

  it('turns a blockquote into a green speech bubble', async () => {
    getNieuwsItem.mockReturnValue(makeNieuws({html: '<p>Voor</p>\n<blockquote>\n<p>Een fietsparcours!</p>\n</blockquote>\n<p>Na</p>'}));
    vi.mocked(content.getNieuws).mockReturnValue([]);
    const {container} = await renderPage('voorbeeldbericht');
    const quote = screen.getByText('Een fietsparcours!').closest('blockquote')!;
    expect(quote.closest('.bg-logo-green')).not.toBeNull();
    expect(container.textContent).toMatch(/Voor.*Een fietsparcours!.*Na/s);
  });

  it('renders the image only when present', async () => {
    vi.mocked(content.getNieuws).mockReturnValue([]);
    getNieuwsItem.mockReturnValue(makeNieuws({afbeelding: {src: '/content/nieuws/x/afbeelding.jpg', width: 800, height: 600}}));
    const {container, unmount} = await renderPage('voorbeeldbericht');
    expect(container.querySelector('img')).not.toBeNull();
    unmount();

    getNieuwsItem.mockReturnValue(makeNieuws());
    const second = await renderPage('voorbeeldbericht');
    expect(second.container.querySelector('img')).toBeNull();
  });

  it('lists other news under "Meer nieuws"', async () => {
    getNieuwsItem.mockReturnValue(makeNieuws({slug: 'voorbeeldbericht'}));
    vi.mocked(content.getNieuws).mockReturnValue([
      makeNieuws({slug: 'voorbeeldbericht'}),
      makeNieuws({slug: 'ander', titel: 'Ander bericht', datum: '2024-10-15'}),
    ]);
    await renderPage('voorbeeldbericht');
    expect(screen.getByRole('heading', {name: 'Meer nieuws'})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: /Ander bericht/})).toHaveAttribute('href', '/nieuws/ander');
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
