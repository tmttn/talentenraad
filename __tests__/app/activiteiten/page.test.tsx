import {render, screen} from '@testing-library/react';
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

vi.mock('@components/ui', () => ({
  AnimatedButton: ({children, href}: {children: React.ReactNode; href: string}) => <a href={href}>{children}</a>,
  AnimatedLink: ({children, href}: {children: React.ReactNode; href: string}) => <a href={href}>{children}</a>,
  AddToCalendarButton: ({title}: {title: string}) => <button type='button'>Agenda: {title}</button>,
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

  it('renders the item and its html body', async () => {
    getActiviteit.mockReturnValue(makeActiviteit({titel: 'Zomerfeest'}));
    await render_('voorbeeldfeest');
    expect(screen.getByRole('heading', {level: 1, name: 'Zomerfeest'})).toBeInTheDocument();
    expect(screen.getByText('Fictieve inhoud van het feest')).toBeInTheDocument();
    expect(screen.getByText('Over deze activiteit')).toBeInTheDocument();
    expect(screen.getByText('Voorbeeldzaal')).toBeInTheDocument();
    expect(screen.getByText('14:00')).toBeInTheDocument();
    expect(screen.getByText('feest')).toHaveClass('bg-category-event-bg');
    expect(screen.getByRole('link', {name: 'Terug naar kalender'})).toHaveAttribute('href', '/kalender');
  });

  it('shows calendar button and CTA for upcoming items only', async () => {
    getActiviteit.mockReturnValue(makeActiviteit({datum: '2025-01-01'}));
    const {unmount} = await render_('voorbeeldfeest');
    expect(screen.getByText(/Agenda:/)).toBeInTheDocument();
    expect(screen.getByText('Vragen over deze activiteit?')).toBeInTheDocument();
    expect(screen.queryByText('Afgelopen')).not.toBeInTheDocument();
    unmount();

    getActiviteit.mockReturnValue(makeActiviteit({datum: '2024-12-31'}));
    await render_('voorbeeldfeest');
    expect(screen.queryByText(/Agenda:/)).not.toBeInTheDocument();
    expect(screen.queryByText('Vragen over deze activiteit?')).not.toBeInTheDocument();
    expect(screen.getByText('Afgelopen')).toBeInTheDocument();
  });

  it('renders the image when present and skips an empty body', async () => {
    getActiviteit.mockReturnValue(makeActiviteit({
      html: '',
      afbeelding: {src: '/content/activiteiten/x/foto.png', width: 400, height: 300},
    }));
    const {container} = await render_('voorbeeldfeest');
    expect(container.querySelector('img')).toHaveAttribute('alt', 'Voorbeeldfeest');
    expect(screen.queryByText('Over deze activiteit')).not.toBeInTheDocument();
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
