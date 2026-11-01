import {render, screen, within} from '@testing-library/react';
import {content} from '@lib/content';
import {todayString} from '@lib/dates';
import * as paginas from '../../fixtures/paginas';
import {makeActiviteit, makeNieuws, makeTeamlid} from '../../fixtures/content';
import HomePage, {generateMetadata} from '../../../app/(main)/page';
import {expectInOrder} from './helpers';

vi.mock('@lib/content', () => ({
  content: {getPagina: vi.fn(), getActiviteiten: vi.fn(), getNieuws: vi.fn(), getTeam: vi.fn()},
}));

vi.mock('@lib/dates', async importOriginal => ({
  ...await importOriginal<typeof import('@lib/dates')>(),
  todayString: vi.fn(() => '2026-11-01'),
}));

vi.mock('@components/layout/page-with-announcements', () => ({
  PageWithAnnouncements: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
}));

const afbeelding = {src: '/content/activiteiten/x/afbeelding.jpg', width: 800, height: 600};

describe('Home page', () => {
  beforeEach(() => {
    vi.mocked(content.getPagina).mockReturnValue(paginas.home as never);
    vi.mocked(content.getActiviteiten).mockReturnValue([
      makeActiviteit({titel: 'Later feest', datum: '2026-12-19', slug: 'later-feest'}),
      makeActiviteit({titel: 'Eerste feest', datum: '2026-11-14', slug: 'eerste-feest', tijd: '19:00 - 23:00', locatie: 'Zaal'}),
      makeActiviteit({titel: 'Oud feest', datum: '2025-03-01', slug: 'oud-feest', afbeelding}),
      makeActiviteit({titel: 'Oud zonder foto', datum: '2025-02-01', slug: 'oud-zonder-foto'}),
    ]);
    vi.mocked(content.getNieuws).mockReturnValue([
      makeNieuws({titel: 'Oud bericht', datum: '2025-01-01', slug: 'oud'}),
      makeNieuws({titel: 'Nieuw bericht', datum: '2025-09-01', slug: 'nieuw'}),
    ]);
    vi.mocked(content.getTeam).mockReturnValue([
      makeTeamlid({naam: 'Derde Bestuur', volgorde: 3, slug: 'derde'}),
      makeTeamlid({naam: 'Eerste Bestuur', volgorde: 1, slug: 'eerste'}),
      makeTeamlid({naam: 'Gewoon Lid', categorie: 'lid', slug: 'lid'}),
    ]);
  });

  it('renders the sections in design order', () => {
    const {container} = render(<HomePage />);
    expectInOrder(container, [
      'Hero titel start', 'Hero ondertitel start', 'Hero knop', 'Tweede hero knop',
      'Eerstvolgende activiteit', 'Eerste feest', 'Later dit schooljaar', 'Later feest',
      'Fictief citaat', 'Bijschrift start',
      'Nieuw bericht', 'Wie we zijn', 'Eerste Bestuur', 'Derde Bestuur',
      'Zo was het', 'Oud feest',
      'Fictieve oproep', 'Fictieve oproeptekst', 'Eerste knop', 'Tweede knop',
    ]);
  });

  it('features the soonest upcoming activity with its details and calendar button', () => {
    render(<HomePage />);
    const featured = screen.getByRole('heading', {name: 'Eerste feest'}).closest('article')!;
    expect(within(featured).getByText(/19:00 - 23:00 · Zaal/)).toBeInTheDocument();
    expect(within(featured).getByRole('link', {name: 'Meer info'})).toHaveAttribute('href', '/activiteiten/eerste-feest');
    expect(within(featured).getByRole('button', {name: /Toevoegen aan agenda/})).toBeInTheDocument();
  });

  it('shows only the latest news item and board members, not regular members', () => {
    render(<HomePage />);
    expect(screen.queryByText('Oud bericht')).not.toBeInTheDocument();
    expect(screen.getByRole('link', {name: /Nieuw bericht/})).toHaveAttribute('href', '/nieuws/nieuw');
    expect(screen.queryByText('Gewoon Lid')).not.toBeInTheDocument();
  });

  it('only puts past activities with a photo on the photo wall', () => {
    render(<HomePage />);
    expect(screen.getByRole('link', {name: /Oud feest/})).toHaveAttribute('href', '/activiteiten/oud-feest');
    expect(screen.queryByText('Oud zonder foto')).not.toBeInTheDocument();
  });

  it('shows an empty state when nothing is planned', () => {
    vi.mocked(content.getActiviteiten).mockReturnValue([]);
    render(<HomePage />);
    expect(screen.getByRole('heading', {name: 'Binnenkort meer'})).toBeInTheDocument();
    expect(screen.queryByText('Eerstvolgende activiteit')).not.toBeInTheDocument();
    expect(screen.queryByText('Zo was het')).not.toBeInTheDocument();
  });

  it('uses the server date to split upcoming and past', () => {
    render(<HomePage />);
    expect(todayString).toHaveBeenCalled();
  });

  it('links both CTA buttons', () => {
    render(<HomePage />);
    expect(screen.getByRole('link', {name: /Eerste knop/})).toHaveAttribute('href', '/eerste');
    expect(screen.getByRole('link', {name: /Tweede knop/})).toHaveAttribute('href', '/tweede');
  });

  it('generates metadata with canonical url and openGraph from the page', () => {
    const metadata = generateMetadata();
    expect(metadata).toMatchObject({description: 'Fictieve beschrijving', alternates: {canonical: 'https://talentenraad.be/'}});
    expect(metadata.title).toEqual({absolute: 'Fictieve start | Talentenraad'});
    expect(metadata.openGraph).toMatchObject({description: 'Fictieve beschrijving'});
    expect(metadata.openGraph?.title).toBe('Fictieve start | Talentenraad');
  });
});
