import {render, screen} from '@testing-library/react';
import {content} from '@lib/content';
import * as paginas from '../../fixtures/paginas';
import {makeNieuws} from '../../fixtures/content';
import NieuwsPage, {generateMetadata} from '../../../app/(main)/nieuws/page';
import {expectInOrder} from './helpers';

vi.mock('@lib/content', () => ({
  content: {getPagina: vi.fn(), getNieuws: vi.fn()},
}));

vi.mock('@components/layout/page-with-announcements', () => ({
  PageWithAnnouncements: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
}));

vi.mock('@features/news/news-list', () => ({
  NewsList: (p: {limit?: number; nieuws: unknown[]}) => <div data-testid='nieuwslijst' data-limit={String(p.limit)} data-count={p.nieuws.length}>LIJST</div>,
}));

describe('Nieuws page', () => {
  beforeEach(() => {
    vi.mocked(content.getPagina).mockReturnValue(paginas.nieuws as never);
    vi.mocked(content.getNieuws).mockReturnValue([makeNieuws()]);
  });

  it('renders all texts in table order', () => {
    const {container} = render(<NieuwsPage />);
    expectInOrder(container, ['Hero titel nieuws', 'Hero ondertitel nieuws', 'LIJST', 'Fictieve oproep', 'Fictieve oproeptekst', 'Enige knop']);
  });

  it('passes news with limit 10', () => {
    render(<NieuwsPage />);
    expect(screen.getByTestId('nieuwslijst')).toHaveAttribute('data-limit', '10');
    expect(screen.getByTestId('nieuwslijst')).toHaveAttribute('data-count', '1');
  });

  it('links the CTA button', () => {
    render(<NieuwsPage />);
    expect(screen.getByRole('link', {name: /Enige knop/})).toHaveAttribute('href', '/enige');
  });

  it('generates metadata with canonical url and openGraph from the page', () => {
    const metadata = generateMetadata();
    expect(metadata).toMatchObject({description: 'Fictieve beschrijving', alternates: {canonical: 'https://talentenraad.be/nieuws'}});
    expect(metadata.title).toEqual({absolute: 'Fictief nieuws | Talentenraad'});
    expect(metadata.openGraph).toMatchObject({description: 'Fictieve beschrijving'});
    expect(metadata.openGraph?.title).toBe('Fictief nieuws | Talentenraad');
  });
});
