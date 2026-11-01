import {render, screen, within} from '@testing-library/react';
import {content} from '@lib/content';
import ActivityDetailPage, {generateMetadata, generateStaticParams} from '../../../app/(main)/activiteiten/[slug]/page';
import {makeActiviteit} from '../../fixtures/content';

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
  content: {getActiviteit: vi.fn(), getActiviteiten: vi.fn()},
}));

vi.mock('@components/layout/page-with-announcements', () => ({
  PageWithAnnouncements: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
}));

const getActiviteit = vi.mocked(content.getActiviteit);
const render_ = async (slug: string) => render(await ActivityDetailPage({params: Promise.resolve({slug})}));

describe('ActivityDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({toFake: ['Date']});
    vi.setSystemTime(new Date(2025, 0, 1, 12));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the item, its details and its html body', async () => {
    getActiviteit.mockReturnValue(makeActiviteit({titel: 'Zomerfeest', datum: '2025-06-15'}));
    vi.mocked(content.getActiviteiten).mockReturnValue([]);
    await render_('voorbeeldfeest');
    expect(screen.getByRole('heading', {level: 1, name: 'Zomerfeest'})).toBeInTheDocument();
    expect(screen.getByText('Fictieve inhoud van het feest')).toBeInTheDocument();
    expect(screen.getByText('Zondag 15 juni')).toBeInTheDocument();
    expect(screen.getByText('14:00 · Voorbeeldzaal')).toBeInTheDocument();
    expect(screen.getByText('Feest')).toHaveClass('bg-category-event-bg', 'contour-xs');
    expect(screen.getByRole('link', {name: /Terug naar de kalender/})).toHaveAttribute('href', '/kalender');
    expect(screen.getByRole('link', {name: /Route naar Voorbeeldzaal/})).toHaveAttribute('href', expect.stringContaining('google.com/maps'));
  });

  it('shows the programme instead of the time when there is one', async () => {
    getActiviteit.mockReturnValue(makeActiviteit({
      datum: '2025-06-15',
      programma: [{uur: '14:00', titel: 'Kerstspel kleuters', info: 'Deuren vanaf 13:30'}, {uur: '15:00', titel: 'Instuif'}],
    }));
    vi.mocked(content.getActiviteiten).mockReturnValue([]);
    await render_('voorbeeldfeest');
    const programma = screen.getByRole('list', {name: 'Programma'});
    expect(within(programma).getAllByRole('listitem')).toHaveLength(2);
    expect(within(programma).getByText('Deuren vanaf 13:30')).toBeInTheDocument();
    expect(screen.getByText('Voorbeeldzaal')).toBeInTheDocument();
  });

  it('offers the calendar for upcoming items only and marks past ones', async () => {
    vi.mocked(content.getActiviteiten).mockReturnValue([]);
    getActiviteit.mockReturnValue(makeActiviteit({datum: '2025-01-01'}));
    const {unmount} = await render_('voorbeeldfeest');
    expect(screen.getByRole('button', {name: /Toevoegen aan agenda/})).toBeInTheDocument();
    expect(screen.queryByText('Afgelopen')).not.toBeInTheDocument();
    unmount();

    getActiviteit.mockReturnValue(makeActiviteit({datum: '2024-12-31'}));
    await render_('voorbeeldfeest');
    expect(screen.queryByRole('button', {name: /Toevoegen aan agenda/})).not.toBeInTheDocument();
    expect(screen.getByText('Afgelopen')).toBeInTheDocument();
  });

  it('shows the poster whole and skips an empty body', async () => {
    vi.mocked(content.getActiviteiten).mockReturnValue([]);
    getActiviteit.mockReturnValue(makeActiviteit({
      html: '',
      afbeelding: {src: '/content/activiteiten/x/foto.png', width: 400, height: 300},
    }));
    const {container} = await render_('voorbeeldfeest');
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('alt', 'Affiche of foto van Voorbeeldfeest');
    expect(img).toHaveClass('object-contain');
    expect(container.querySelector('.prose')).toBeNull();
  });

  it('lists other upcoming activities, not itself or past ones', async () => {
    getActiviteit.mockReturnValue(makeActiviteit({slug: 'voorbeeldfeest', datum: '2025-06-15'}));
    vi.mocked(content.getActiviteiten).mockReturnValue([
      makeActiviteit({slug: 'voorbeeldfeest', datum: '2025-06-15'}),
      makeActiviteit({slug: 'later', titel: 'Later feest', datum: '2025-07-01'}),
      makeActiviteit({slug: 'oud', titel: 'Oud feest', datum: '2024-07-01'}),
    ]);
    await render_('voorbeeldfeest');
    expect(screen.getByRole('heading', {name: 'Ook op de kalender'})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: /Later feest/})).toHaveAttribute('href', '/activiteiten/later');
    expect(screen.queryByText('Oud feest')).not.toBeInTheDocument();
  });

  it('puts title and intro first, then the side panel before the text, so phones see it right away', async () => {
    getActiviteit.mockReturnValue(makeActiviteit({datum: '2025-06-15'}));
    vi.mocked(content.getActiviteiten).mockReturnValue([]);
    const {container} = await render_('voorbeeldfeest');
    const order = [...container.querySelectorAll('h1, aside, .prose')].map(element => element.tagName === 'ASIDE' ? 'aside' : (element.tagName === 'H1' ? 'h1' : 'tekst'));
    expect(order).toEqual(['h1', 'aside', 'tekst']);
    expect(container.querySelector('aside')!.parentElement).toHaveClass('flex-row-reverse');
  });

  it('redirects an alias to the canonical url', async () => {
    getActiviteit.mockReturnValue(makeActiviteit({slug: 'echte-slug'}));
    await expect(render_('-oude-slug')).rejects.toThrow('NEXT_REDIRECT:/activiteiten/echte-slug');
    expect(permanentRedirect).toHaveBeenCalledWith('/activiteiten/echte-slug');
  });

  it('calls notFound for an unknown slug', async () => {
    getActiviteit.mockReturnValue(undefined);
    await expect(render_('bestaat-niet')).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });
});

describe('ActivityDetailPage metadata and params', () => {
  it('builds metadata from title and summary', async () => {
    getActiviteit.mockReturnValue(makeActiviteit({titel: 'Zomerfeest'}));
    const metadata = await generateMetadata({params: Promise.resolve({slug: 'voorbeeldfeest'})});
    expect(metadata.title).toEqual({absolute: 'Zomerfeest | Talentenraad'});
    expect(metadata.description).toBe('Een fictieve samenvatting van het feest.');
  });

  it('falls back when the item is unknown', async () => {
    getActiviteit.mockReturnValue(undefined);
    expect(await generateMetadata({params: Promise.resolve({slug: 'x'})})).toEqual({title: 'Activiteit niet gevonden'});
  });

  it('generates static params from real slugs', () => {
    vi.mocked(content.getActiviteiten).mockReturnValue([makeActiviteit({slug: 'a'}), makeActiviteit({slug: 'b'})]);
    expect(generateStaticParams()).toEqual([{slug: 'a'}, {slug: 'b'}]);
  });
});
