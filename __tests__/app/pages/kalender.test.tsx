import {render, screen} from '@testing-library/react';
import {content} from '@lib/content';
import * as paginas from '../../fixtures/paginas';
import {makeActiviteit} from '../../fixtures/content';
import KalenderPage, {generateMetadata} from '../../../app/(main)/kalender/page';
import {expectInOrder} from './helpers';

vi.mock('@lib/content', () => ({
  content: {getPagina: vi.fn(), getActiviteiten: vi.fn()},
}));

vi.mock('@components/layout/page-with-announcements', () => ({
  PageWithAnnouncements: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
}));

vi.mock('@features/activities/activities-list', () => ({
  ActivitiesList: (p: Record<string, unknown>) => (
    <div data-testid='lijst' data-today={String(p.today)} data-limit={String(p.limit)} data-viewall={String(p.showViewAll)} data-location={String(p.showLocation)} data-description={String(p.showDescription)}>LIJST</div>
  ),
}));

vi.mock('@features/activities/activities-archive', () => ({
  ActivitiesArchive: (p: Record<string, unknown>) => (
    <div data-testid='archief' data-today={String(p.today)} data-limit={String(p.limit)} data-year={String(p.showYear)}>{String(p.title)}|{String(p.subtitle)}</div>
  ),
}));

describe('Kalender page', () => {
  beforeEach(() => {
    vi.mocked(content.getPagina).mockReturnValue(paginas.kalender as never);
    vi.mocked(content.getActiviteiten).mockReturnValue([makeActiviteit()]);
  });

  it('renders all texts in table order', () => {
    const {container} = render(<KalenderPage />);
    expectInOrder(container, [
      'Hero titel agenda', 'Hero ondertitel agenda', 'Lijst titel', 'Lijst ondertitel', 'LIJST',
      'Archief titel|Archief ondertitel', 'Fictieve oproep', 'Fictieve oproeptekst', 'Enige knop',
    ]);
  });

  it('uses fixed list and archive props', () => {
    render(<KalenderPage />);
    expect(screen.getByTestId('lijst')).toHaveAttribute('data-limit', '20');
    expect(screen.getByTestId('lijst')).toHaveAttribute('data-viewall', 'false');
    expect(screen.getByTestId('lijst')).toHaveAttribute('data-location', 'true');
    expect(screen.getByTestId('lijst')).toHaveAttribute('data-description', 'true');
    expect(screen.getByTestId('archief')).toHaveAttribute('data-limit', '20');
    expect(screen.getByTestId('archief')).toHaveAttribute('data-year', 'true');
  });

  it('passes the server date to the list and archive', () => {
    render(<KalenderPage />);
    const today = /^\d{4}-\d{2}-\d{2}$/;
    expect(screen.getByTestId('lijst').dataset.today).toMatch(today);
    expect(screen.getByTestId('archief').dataset.today).toBe(screen.getByTestId('lijst').dataset.today);
  });

  it('links the CTA button', () => {
    render(<KalenderPage />);
    expect(screen.getByRole('link', {name: /Enige knop/})).toHaveAttribute('href', '/enige');
  });

  it('generates metadata with canonical url and openGraph from the page', () => {
    const metadata = generateMetadata();
    expect(metadata).toMatchObject({description: 'Fictieve beschrijving', alternates: {canonical: 'https://talentenraad.be/kalender'}});
    expect(metadata.title).toEqual({absolute: 'Fictieve agenda | Talentenraad'});
    expect(metadata.openGraph).toMatchObject({description: 'Fictieve beschrijving'});
    expect(metadata.openGraph?.title).toBe('Fictieve agenda | Talentenraad');
  });
});
