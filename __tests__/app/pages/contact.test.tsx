import {render, screen} from '@testing-library/react';
import {content} from '@lib/content';
import * as paginas from '../../fixtures/paginas';
import ContactPage, {generateMetadata} from '../../../app/(main)/contact/page';
import {expectInOrder} from './helpers';

vi.mock('@lib/content', () => ({content: {getPagina: vi.fn()}}));

vi.mock('@components/layout/page-with-announcements', () => ({
  PageWithAnnouncements: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
}));

vi.mock('@features/contact/contact-form', () => ({
  ContactForm: (p: Record<string, unknown>) => <form data-testid='form' data-phone={String(p.showPhone)} data-subject={String(p.showSubject)}>FORMULIER</form>,
}));

describe('Contact page', () => {
  beforeEach(() => {
    vi.mocked(content.getPagina).mockReturnValue(paginas.contact as never);
  });

  it('renders all texts in table order', () => {
    const {container} = render(<ContactPage />);
    expectInOrder(container, [
      'Hero titel contact', 'Hero ondertitel contact', 'Formulier titel', 'Formulier tekst', 'FORMULIER',
      'Infokaart titel contact', 'Infokaart body contact',
    ]);
  });

  it('uses fixed form props', () => {
    render(<ContactPage />);
    expect(screen.getByTestId('form')).toHaveAttribute('data-phone', 'false');
    expect(screen.getByTestId('form')).toHaveAttribute('data-subject', 'true');
  });

  it('generates metadata with canonical url and openGraph from the page', () => {
    const metadata = generateMetadata();
    expect(metadata).toMatchObject({description: 'Fictieve beschrijving', alternates: {canonical: 'https://talentenraad.be/contact'}});
    expect(String(metadata.title)).toContain('Fictief contact');
    expect(metadata.openGraph).toMatchObject({description: 'Fictieve beschrijving'});
    expect(String(metadata.openGraph?.title)).toContain('Fictief contact');
  });
});
