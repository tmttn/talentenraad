import {fireEvent, render, screen, within} from '@testing-library/react';
import {content} from '@lib/content';
import * as paginas from '../../fixtures/paginas';
import {makeActiviteit} from '../../fixtures/content';
import KalenderPage, {generateMetadata} from '../../../app/(main)/kalender/page';
import {expectInOrder} from './helpers';

vi.mock('@lib/content', () => ({
  content: {getPagina: vi.fn(), getActiviteiten: vi.fn()},
}));

vi.mock('@lib/dates', async importOriginal => ({
  ...await importOriginal<typeof import('@lib/dates')>(),
  todayString: vi.fn(() => '2026-11-01'),
}));

vi.mock('@components/layout/page-with-announcements', () => ({
  PageWithAnnouncements: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
}));

describe('Kalender page', () => {
  beforeEach(() => {
    vi.mocked(content.getPagina).mockReturnValue(paginas.kalender as never);
    vi.mocked(content.getActiviteiten).mockReturnValue([
      makeActiviteit({titel: 'Ontbijtmanden', datum: '2027-05-10', categorie: 'activiteit', slug: 'ontbijt'}),
      makeActiviteit({titel: 'Kerstinstuif', datum: '2026-12-19', slug: 'kerst', tijd: '18:00 - 21:00', locatie: 'Beversheem'}),
      makeActiviteit({titel: 'Fuif van vroeger', datum: '2025-02-07', slug: 'fuif', afbeelding: {src: '/x.jpg', width: 1, height: 1}}),
    ]);
  });

  it('renders intro, months, past activities and the call to action in order', () => {
    const {container} = render(<KalenderPage />);
    expectInOrder(container, [
      'Hero titel agenda', 'Hero ondertitel agenda',
      'December', 'Kerstinstuif', 'Mei 2027', 'Ontbijtmanden',
      'Archief titel', 'Archief ondertitel', 'Fuif van vroeger',
      'Fictieve oproep', 'Enige knop',
    ]);
  });

  it('shows each upcoming activity with its details and actions', () => {
    render(<KalenderPage />);
    const row = screen.getByRole('heading', {name: 'Kerstinstuif'}).closest('article')!;
    expect(within(row).getByText('18:00 - 21:00 · Beversheem')).toBeInTheDocument();
    expect(within(row).getByText('ZA')).toBeInTheDocument();
    expect(within(row).getByRole('button', {name: /In mijn agenda/})).toBeInTheDocument();
    expect(within(row).getByRole('link', {name: /Meer info/})).toHaveAttribute('href', '/activiteiten/kerst');
  });

  it('filters on category', () => {
    render(<KalenderPage />);
    const filter = screen.getByRole('group', {name: 'Filter op soort'});
    expect(within(filter).getByRole('button', {name: 'Alles'})).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(within(filter).getByRole('button', {name: 'Acties'}));
    expect(screen.queryByRole('heading', {name: 'Kerstinstuif'})).not.toBeInTheDocument();
    expect(screen.getByRole('heading', {name: 'Ontbijtmanden'})).toBeInTheDocument();
    expect(within(filter).getByRole('button', {name: 'Acties'})).toHaveAttribute('aria-pressed', 'true');
  });

  it('links past activities, with a photo hint when there is one', () => {
    render(<KalenderPage />);
    expect(screen.getByRole('link', {name: /Fuif van vroeger/})).toHaveAttribute('href', '/activiteiten/fuif');
    expect(screen.getByText('Bekijk foto\'s')).toBeInTheDocument();
  });

  it('says so when nothing is planned and hides the filter', () => {
    vi.mocked(content.getActiviteiten).mockReturnValue([]);
    render(<KalenderPage />);
    expect(screen.getByText(/Er staat nog niets gepland/)).toBeInTheDocument();
    expect(screen.queryByRole('group', {name: 'Filter op soort'})).not.toBeInTheDocument();
    expect(screen.queryByText('Archief titel')).not.toBeInTheDocument();
  });

  it('generates metadata from the page', () => {
    expect(generateMetadata()).toMatchObject({description: 'Fictieve beschrijving'});
  });
});
