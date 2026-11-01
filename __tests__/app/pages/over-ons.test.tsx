import {render, screen, within} from '@testing-library/react';
import {content} from '@lib/content';
import * as paginas from '../../fixtures/paginas';
import {makeFaq, makeTeamlid} from '../../fixtures/content';
import OverOnsPage, {generateMetadata} from '../../../app/(main)/over-ons/page';
import {expectInOrder} from './helpers';

vi.mock('@lib/content', () => ({content: {getPagina: vi.fn(), getTeam: vi.fn(), getFaq: vi.fn()}}));

vi.mock('@components/layout/page-with-announcements', () => ({
  PageWithAnnouncements: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
}));

describe('Over ons page', () => {
  beforeEach(() => {
    vi.mocked(content.getPagina).mockReturnValue(paginas.overOns as never);
    vi.mocked(content.getTeam).mockReturnValue([
      makeTeamlid({naam: 'Bestuurslid Een', rol: 'Voorzitter', categorie: 'bestuur', html: '<p>Ik coördineer.</p>'}),
      makeTeamlid({naam: 'Gewoon Lid', categorie: 'lid', slug: 'gewoon-lid'}),
    ]);
    vi.mocked(content.getFaq).mockReturnValue([makeFaq({vraag: 'Hoe word ik lid?', html: '<p>Spreek ons aan.</p>'})]);
  });

  it('renders all texts in design order', () => {
    const {container} = render(<OverOnsPage />);
    expectInOrder(container, [
      'Hero titel over', 'Hero ondertitel over', 'Citaat over ons',
      'Bestuur titel', 'Bestuur tekst', 'Bestuurslid Een', 'Voorzitter', 'Ik coördineer.',
      'Leden titel', 'Leden tekst', 'Gewoon Lid',
      'Veelgestelde fictie', 'Hoe word ik lid?', 'Spreek ons aan.',
      'Fictieve oproeptekst', 'Enige knop',
    ]);
  });

  it('shows board members as cards and members by name only', () => {
    render(<OverOnsPage />);
    const card = screen.getByRole('heading', {name: 'Bestuurslid Een'}).closest('li')!;
    expect(within(card).getByText('BE')).toBeInTheDocument();
    expect(screen.queryByRole('heading', {name: 'Gewoon Lid'})).not.toBeInTheDocument();
  });

  it('adds FAQ structured data', () => {
    const {container} = render(<OverOnsPage />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(JSON.parse(script!.textContent!)).toMatchObject({'@type': 'FAQPage', mainEntity: [{name: 'Hoe word ik lid?', acceptedAnswer: {text: 'Spreek ons aan.'}}]});
  });

  it('links the call to action', () => {
    render(<OverOnsPage />);
    expect(screen.getByRole('link', {name: 'Enige knop'})).toHaveAttribute('href', '/enige');
  });

  it('generates metadata from the page', () => {
    expect(generateMetadata()).toMatchObject({description: 'Fictieve beschrijving'});
  });
});
