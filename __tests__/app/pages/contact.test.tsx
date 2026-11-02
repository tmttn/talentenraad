import {render, screen} from '@testing-library/react';
import {content} from '@lib/content';
import * as paginas from '../../fixtures/paginas';
import {fixtureSite} from '../../fixtures/site';
import ContactPage, {generateMetadata} from '../../../app/(main)/contact/page';
import {checkFormToken} from '@lib/form-timing';
import {expectInOrder} from './helpers';

vi.mock('@lib/content', () => ({content: {getPagina: vi.fn(), getSite: vi.fn()}}));

vi.mock('@components/layout/page-with-announcements', () => ({
  PageWithAnnouncements: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
}));

vi.mock('@features/contact/contact-form', () => ({
  ContactForm: (p: {titel?: string; defaultSubject?: string; formToken: string}) => (
    <form data-testid='form' data-subject={p.defaultSubject ?? ''} data-token={p.formToken}>FORMULIER {p.titel}</form>
  ),
}));

vi.stubEnv('AUTH_SECRET', 'x'.repeat(40));

describe('Contact page', () => {
  beforeEach(() => {
    vi.mocked(content.getPagina).mockReturnValue(paginas.contact as never);
    vi.mocked(content.getSite).mockReturnValue(fixtureSite);
  });

  it('renders intro, the two ways to reach us and the form', async () => {
    const {container} = render(await ContactPage({searchParams: Promise.resolve({})}));
    expectInOrder(container, [
      'Hero titel contact', 'Hero ondertitel contact',
      'Liever mailen?', 'info@voorbeeld.test',
      'Of spreek ons aan op school', 'Voorbeeldstraat 1, 1000 Voorbeeldstad',
      'Wil je lid worden? Zo werkt het',
      'FORMULIER Formulier titel',
    ]);
  });

  it('links the e-mail address and the membership page', async () => {
    render(await ContactPage({searchParams: Promise.resolve({})}));
    expect(screen.getByRole('link', {name: 'info@voorbeeld.test'})).toHaveAttribute('href', 'mailto:info@voorbeeld.test');
    expect(screen.getByRole('link', {name: 'Wil je lid worden? Zo werkt het'})).toHaveAttribute('href', '/over-ons');
  });

  it('passes a valid ?onderwerp= to the form and ignores others', async () => {
    const {unmount} = render(await ContactPage({searchParams: Promise.resolve({onderwerp: 'sponsoring'})}));
    expect(screen.getByTestId('form')).toHaveAttribute('data-subject', 'sponsoring');
    unmount();
    render(await ContactPage({searchParams: Promise.resolve({onderwerp: 'hack'})}));
    expect(screen.getByTestId('form')).toHaveAttribute('data-subject', '');
  });

  it('gives the form a timing token signed for the contact form, issued now', async () => {
    render(await ContactPage({searchParams: Promise.resolve({})}));
    const token = screen.getByTestId('form').dataset.token;
    expect(checkFormToken('contact', token)).toBe('too-fast');
    expect(checkFormToken('contact', token, Date.now() + 5000)).toBe('ok');
  });

  it('generates metadata from the page', () => {
    expect(generateMetadata()).toMatchObject({description: 'Fictieve beschrijving'});
  });
});
