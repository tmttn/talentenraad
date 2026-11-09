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
      makeTeamlid({naam: 'Gewoon Lid', rol: 'Lid', categorie: 'lid', slug: 'gewoon-lid', html: '<p>Ik help graag.</p><p>Tot op school!</p>'}),
      makeTeamlid({naam: 'Stil Lid', rol: 'Lid', categorie: 'lid', slug: 'stil-lid', html: '\n'}),
    ]);
    vi.mocked(content.getFaq).mockReturnValue([makeFaq({vraag: 'Hoe word ik lid?', html: '<p>Spreek ons aan.</p>'})]);
  });

  it('renders all texts in design order', () => {
    const {container} = render(<OverOnsPage />);
    expectInOrder(container, [
      'Hero titel over', 'Hero ondertitel over', 'Citaat over ons',
      'Bestuur titel', 'Bestuur tekst', 'Bestuurslid Een', 'Voorzitter', 'Ik coördineer.',
      'Leden titel', 'Leden tekst', 'Gewoon Lid', 'Ik help graag.', 'Tot op school!', 'Stil Lid',
      'Veelgestelde fictie', 'Hoe word ik lid?', 'Spreek ons aan.',
      'Fictieve oproeptekst', 'Enige knop',
    ]);
  });

  it('shows board members and members as cards with their introduction', () => {
    render(<OverOnsPage />);
    const bestuurslid = screen.getByRole('heading', {name: 'Bestuurslid Een'}).closest('li')!;
    expect(within(bestuurslid).getByText('BE')).toBeInTheDocument();
    expect(within(bestuurslid).getByText('Voorzitter')).toBeInTheDocument();

    const lid = screen.getByRole('heading', {name: 'Gewoon Lid'}).closest('li')!;
    expect(within(lid).getByText('GL')).toBeInTheDocument();
    expect(within(lid).getByText('Lid')).toBeInTheDocument();
    expect(within(lid).getByText('Tot op school!')).toBeInTheDocument();
  });

  it('leaves out the introduction of a member without one', () => {
    render(<OverOnsPage />);
    const lid = screen.getByRole('heading', {name: 'Stil Lid'}).closest('li')!;
    expect(lid.children).toHaveLength(1);
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
