import {render, screen} from '@testing-library/react';
import {content} from '@lib/content';
import * as paginas from '../../fixtures/paginas';
import {makeNieuws} from '../../fixtures/content';
import NieuwsPage, {generateMetadata} from '../../../app/(main)/nieuws/page';
import {expectInOrder} from './helpers';

vi.mock('@lib/content', () => ({content: {getPagina: vi.fn(), getNieuws: vi.fn()}}));

vi.mock('@components/layout/page-with-announcements', () => ({
  PageWithAnnouncements: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
}));

describe('Nieuws page', () => {
  beforeEach(() => {
    vi.mocked(content.getPagina).mockReturnValue(paginas.nieuws as never);
    vi.mocked(content.getNieuws).mockReturnValue([
      makeNieuws({titel: 'Oud bericht', datum: '2024-10-15', slug: 'oud'}),
      makeNieuws({titel: 'Nieuw bericht', datum: '2025-09-01', slug: 'nieuw', afbeelding: {src: '/x.jpg', width: 800, height: 600}}),
    ]);
  });

  it('features the latest item and lists the rest under "Eerder"', () => {
    const {container} = render(<NieuwsPage />);
    expectInOrder(container, [
      'Hero titel nieuws', 'Hero ondertitel nieuws',
      'Nieuwste', '1 september 2025', 'Nieuw bericht', 'Lees verder',
      'Eerder', '15 oktober 2024', 'Oud bericht',
      'Fictieve oproep', 'Enige knop',
    ]);
    expect(screen.getByRole('link', {name: /Nieuw bericht/})).toHaveAttribute('href', '/nieuws/nieuw');
    expect(screen.getByRole('link', {name: /Oud bericht/})).toHaveAttribute('href', '/nieuws/oud');
  });

  it('shows an empty state without news', () => {
    vi.mocked(content.getNieuws).mockReturnValue([]);
    render(<NieuwsPage />);
    expect(screen.getByText('Er is nog geen nieuws.')).toBeInTheDocument();
    expect(screen.queryByText('Eerder')).not.toBeInTheDocument();
  });

  it('generates metadata from the page', () => {
    expect(generateMetadata()).toMatchObject({description: 'Fictieve beschrijving'});
  });
});
