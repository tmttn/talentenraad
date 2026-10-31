import {render, screen} from '@testing-library/react';
import {content} from '@lib/content';
import * as paginas from '../../fixtures/paginas';
import SponsorsPage, {generateMetadata} from '../../../app/(main)/sponsors/page';
import {expectInOrder} from './helpers';

vi.mock('@lib/content', () => ({content: {getPagina: vi.fn()}}));

vi.mock('@components/layout/page-with-announcements', () => ({
  PageWithAnnouncements: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
}));

describe('Sponsors page', () => {
  beforeEach(() => {
    vi.mocked(content.getPagina).mockReturnValue(paginas.sponsors as never);
  });

  it('renders all texts in table order', () => {
    const {container} = render(<SponsorsPage />);
    expectInOrder(container, [
      'Hero titel sponsors', 'Hero ondertitel sponsors',
      'Gouden Sponsors', 'Gouden Voorbeeld',
      'Zilveren Sponsors', 'Geen zilver',
      'Bronzen Sponsors', 'Geen brons',
      'Partners',
      'Fictieve oproep', 'Fictieve oproeptekst', 'Enige knop',
    ]);
  });

  it('shows legeTekst only for levels without sponsors', () => {
    render(<SponsorsPage />);
    expect(screen.getByText('Geen zilver')).toBeInTheDocument();
    expect(screen.getByText('Geen brons')).toBeInTheDocument();
    expect(screen.queryByText('Geen goud')).not.toBeInTheDocument();
    expect(screen.queryByText('Geen partners')).not.toBeInTheDocument();
  });

  it('links sponsors with a link and shows logos', () => {
    render(<SponsorsPage />);
    expect(screen.getByRole('link', {name: /Gouden Voorbeeld/})).toHaveAttribute('href', 'https://goud.test');
    expect(screen.getByAltText('Partner Voorbeeld')).toHaveAttribute('src', '/partner.png');
  });

  it('links the CTA button', () => {
    render(<SponsorsPage />);
    expect(screen.getByRole('link', {name: /Enige knop/})).toHaveAttribute('href', '/enige');
  });

  it('generates metadata with canonical url and openGraph from the page', () => {
    const metadata = generateMetadata();
    expect(metadata).toMatchObject({description: 'Fictieve beschrijving', alternates: {canonical: 'https://talentenraad.be/sponsors'}});
    expect(metadata.title).toEqual({absolute: 'Fictieve sponsors | Talentenraad'});
    expect(metadata.openGraph).toMatchObject({description: 'Fictieve beschrijving'});
    expect(metadata.openGraph?.title).toBe('Fictieve sponsors | Talentenraad');
  });
});
