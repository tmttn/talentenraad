import {render, screen} from '@testing-library/react';
import {content} from '@lib/content';
import * as paginas from '../../fixtures/paginas';
import {makeFaq, makeTeamlid} from '../../fixtures/content';
import OverOnsPage, {generateMetadata} from '../../../app/(main)/over-ons/page';
import {expectInOrder} from './helpers';

vi.mock('@lib/content', () => ({content: {getPagina: vi.fn(), getTeam: vi.fn(), getFaq: vi.fn()}}));

vi.mock('@features/faq/faq', () => ({
  Faq: (p: {items: Array<{vraag: string}>}) => <div data-testid='faq'>FAQ {p.items.map(i => i.vraag).join(',')}</div>,
}));

vi.mock('@components/layout/page-with-announcements', () => ({
  PageWithAnnouncements: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
}));

vi.mock('@features/team/team-grid', () => ({
  TeamGrid: (p: {leden: Array<{naam: string}>; columns: number; showDescription: boolean}) => (
    <div data-testid='team' data-columns={p.columns} data-description={String(p.showDescription)}>{p.leden.map(l => l.naam).join(',')}</div>
  ),
}));

describe('Over ons page', () => {
  beforeEach(() => {
    vi.mocked(content.getPagina).mockReturnValue(paginas.overOns as never);
    vi.mocked(content.getTeam).mockReturnValue([
      makeTeamlid({naam: 'Bestuurslid Een', categorie: 'bestuur'}),
      makeTeamlid({naam: 'Gewoon Lid', categorie: 'lid', slug: 'gewoon-lid'}),
    ]);
    vi.mocked(content.getFaq).mockReturnValue([makeFaq({vraag: 'Waarom?'})]);
  });

  it('renders all texts in table order', () => {
    const {container} = render(<OverOnsPage />);
    expectInOrder(container, [
      'Hero titel over', 'Hero ondertitel over', 'Infokaart titel over', 'Infokaart body over',
      'Bestuur titel', 'Bestuur tekst', 'Bestuurslid Een', 'Leden titel', 'Leden tekst', 'Gewoon Lid',
      'Veelgestelde fictie', 'FAQ Waarom?',
      'Fictieve oproep', 'Fictieve oproeptekst', 'Enige knop',
    ]);
  });

  it('filters team by category with fixed props', () => {
    render(<OverOnsPage />);
    const [bestuur, leden] = screen.getAllByTestId('team');
    expect(bestuur).toHaveTextContent('Bestuurslid Een');
    expect(bestuur).not.toHaveTextContent('Gewoon Lid');
    expect(bestuur).toHaveAttribute('data-columns', '3');
    expect(bestuur).toHaveAttribute('data-description', 'true');
    expect(leden).toHaveTextContent('Gewoon Lid');
    expect(leden).not.toHaveTextContent('Bestuurslid Een');
    expect(leden).toHaveAttribute('data-columns', '4');
    expect(leden).toHaveAttribute('data-description', 'false');
  });

  it('links the CTA button', () => {
    render(<OverOnsPage />);
    expect(screen.getByRole('link', {name: /Enige knop/})).toHaveAttribute('href', '/enige');
  });

  it('generates metadata with canonical url and openGraph from the page', () => {
    const metadata = generateMetadata();
    expect(metadata).toMatchObject({description: 'Fictieve beschrijving', alternates: {canonical: 'https://talentenraad.be/over-ons'}});
    expect(metadata.title).toEqual({absolute: 'Fictief over ons | Talentenraad'});
    expect(metadata.openGraph).toMatchObject({description: 'Fictieve beschrijving'});
    expect(metadata.openGraph?.title).toBe('Fictief over ons | Talentenraad');
  });
});
