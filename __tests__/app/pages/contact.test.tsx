import {render, screen} from '@testing-library/react';
import {content} from '@lib/content';
import * as paginas from '../../fixtures/paginas';
import {fixtureSite} from '../../fixtures/site';
import ContactPage, {generateMetadata} from '../../../app/(main)/contact/page';
import {expectInOrder} from './helpers';

vi.mock('@lib/content', () => ({content: {getPagina: vi.fn(), getSite: vi.fn()}}));

vi.mock('@components/layout/page-with-announcements', () => ({
  PageWithAnnouncements: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
}));

vi.mock('@features/contact/contact-form', () => ({
  ContactForm: (p: {titel?: string}) => <form data-testid='form'>FORMULIER {p.titel}</form>,
}));

describe('Contact page', () => {
  beforeEach(() => {
    vi.mocked(content.getPagina).mockReturnValue(paginas.contact as never);
    vi.mocked(content.getSite).mockReturnValue(fixtureSite);
  });

  it('renders intro, the two ways to reach us and the form', () => {
    const {container} = render(<ContactPage />);
    expectInOrder(container, [
      'Hero titel contact', 'Hero ondertitel contact',
      'Liever mailen?', 'info@voorbeeld.test',
      'Of spreek ons aan op school', 'Voorbeeldstraat 1, 1000 Voorbeeldstad',
      'Wil je lid worden? Zo werkt het',
      'FORMULIER Formulier titel',
    ]);
  });

  it('links the e-mail address and the membership page', () => {
    render(<ContactPage />);
    expect(screen.getByRole('link', {name: 'info@voorbeeld.test'})).toHaveAttribute('href', 'mailto:info@voorbeeld.test');
    expect(screen.getByRole('link', {name: 'Wil je lid worden? Zo werkt het'})).toHaveAttribute('href', '/over-ons');
  });

  it('generates metadata from the page', () => {
    expect(generateMetadata()).toMatchObject({description: 'Fictieve beschrijving'});
  });
});
