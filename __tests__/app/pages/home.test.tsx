import {render, screen} from '@testing-library/react';
import {content} from '@lib/content';
import * as paginas from '../../fixtures/paginas';
import {makeActiviteit, makeFaq, makeNieuws} from '../../fixtures/content';
import HomePage, {generateMetadata} from '../../../app/(main)/page';
import {expectInOrder} from './helpers';

vi.mock('@lib/content', () => ({
  content: {getPagina: vi.fn(), getActiviteiten: vi.fn(), getNieuws: vi.fn(), getFaq: vi.fn()},
}));

vi.mock('@components/layout/page-with-announcements', () => ({
  PageWithAnnouncements: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
}));

vi.mock('@features/dashboard/homepage-dashboard', () => ({
  HomepageDashboard: (p: {today: string; activiteiten: unknown[]; nieuws: unknown[]}) => <div data-testid='dashboard' data-today={p.today}>DASHBOARD {p.activiteiten.length}/{p.nieuws.length}</div>,
}));

vi.mock('@features/faq/faq', () => ({
  Faq: (p: {items: Array<{vraag: string}>}) => <div data-testid='faq'>FAQ {p.items.map(i => i.vraag).join(',')}</div>,
}));

describe('Home page', () => {
  beforeEach(() => {
    vi.mocked(content.getPagina).mockReturnValue(paginas.home as never);
    vi.mocked(content.getActiviteiten).mockReturnValue([makeActiviteit()]);
    vi.mocked(content.getNieuws).mockReturnValue([makeNieuws()]);
    vi.mocked(content.getFaq).mockReturnValue([makeFaq({vraag: 'Waarom?'})]);
  });

  it('passes the server date to the dashboard', () => {
    render(<HomePage />);
    expect(screen.getByTestId('dashboard').dataset.today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('renders all texts in table order', () => {
    const {container} = render(<HomePage />);
    expectInOrder(container, [
      'Hero titel start', 'Hero ondertitel start', 'Dashboard titel', 'DASHBOARD 1/1',
      'Infokaart titel start', 'Infokaart body start', 'Veelgestelde fictie', 'FAQ Waarom?',
      'Fictieve oproep', 'Fictieve oproeptekst', 'Eerste knop', 'Tweede knop',
    ]);
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
