import {submitContact} from '@lib/contact-submit';
import {sendContact} from '../../../app/(main)/contact/actions';

vi.mock('next/headers', () => ({headers: vi.fn(async () => new Headers({'x-forwarded-for': '10.1.2.3, 10.0.0.1'}))}));
vi.mock('@lib/contact-submit', () => ({submitContact: vi.fn()}));

const form = (values: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) {
    data.set(key, value);
  }

  return data;
};

const filled = {name: 'Lies', email: 'lies@voorbeeld.be', phone: '', subject: 'vraag', message: 'Een bericht dat lang genoeg is.'};

describe('sendContact', () => {
  it('passes the fields, honeypot, token and client IP to submitContact', async () => {
    vi.mocked(submitContact).mockResolvedValue({status: 'sent'});
    expect(await sendContact({status: 'idle'}, form({...filled, website: '', recaptchaToken: 'tok'}))).toEqual({status: 'sent'});
    expect(submitContact).toHaveBeenCalledWith({...filled, website: '', recaptchaToken: 'tok'}, '10.1.2.3');
  });

  it('sends no token when the hidden field is empty', async () => {
    vi.mocked(submitContact).mockResolvedValue({status: 'sent'});
    await sendContact({status: 'idle'}, form({...filled, recaptchaToken: ''}));
    expect(vi.mocked(submitContact).mock.calls.at(-1)![0].recaptchaToken).toBeNull();
  });

  it('returns the field errors with what was sent', async () => {
    vi.mocked(submitContact).mockResolvedValue({status: 'invalid', errors: {email: 'Vul een volledig e-mailadres in, bv. naam@voorbeeld.be'}});
    expect(await sendContact({status: 'idle'}, form(filled))).toEqual({
      status: 'error',
      message: 'Er klopt nog iets niet. Kijk de rode velden na.',
      errors: {email: 'Vul een volledig e-mailadres in, bv. naam@voorbeeld.be'},
      values: filled,
    });
  });

  it.each([
    ['limited', 'Te veel berichten in korte tijd. Probeer het over enkele minuten opnieuw.'],
    ['recaptcha', 'We konden niet nagaan of je bericht van een mens komt. Probeer het opnieuw.'],
    ['failed', 'Er ging iets mis bij het versturen. Probeer het later opnieuw.'],
  ] as const)('explains %s for the whole form', async (status, message) => {
    vi.mocked(submitContact).mockResolvedValue({status});
    expect(await sendContact({status: 'idle'}, form(filled))).toEqual({status: 'error', message, values: filled});
  });
});
