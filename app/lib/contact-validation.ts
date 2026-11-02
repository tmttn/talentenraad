/** Contact form rules and messages, shared by the form and /api/contact so both say the same thing. */

export type ContactFields = {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
};

export type ContactErrors = Partial<Record<'name' | 'email' | 'phone' | 'subject' | 'message', string>>;

export const subjectOptions = [
  {value: 'vraag', label: 'Algemene vraag'},
  {value: 'activiteit', label: 'Een activiteit'},
  {value: 'lidmaatschap', label: 'Lid worden'},
  {value: 'sponsoring', label: 'Sponsoring'},
  {value: 'anders', label: 'Iets anders'},
] as const;

export const isValidSubject = (value: string | undefined | null): value is string =>
  subjectOptions.some(option => option.value === value);

export const contactMessages = {
  success: 'Bedankt voor je bericht! We antwoorden zo snel mogelijk.',
  invalid: 'Er klopt nog iets niet. Kijk de rode velden na.',
  recaptcha: 'We konden niet nagaan of je bericht van een mens komt. Probeer het opnieuw.',
  network: 'Je bericht is niet verstuurd. Kijk je internetverbinding na en probeer het opnieuw.',
  failed: 'Er ging iets mis bij het versturen. Probeer het later opnieuw.',
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContact(fields: ContactFields, requireSubject = false): ContactErrors {
  const errors: ContactErrors = {};
  const name = fields.name?.trim() ?? '';
  const email = fields.email?.trim() ?? '';
  const message = fields.message?.trim() ?? '';

  if (name === '') {
    errors.name = 'Vul je naam in.';
  } else if (name.length < 2) {
    errors.name = 'Vul je volledige naam in.';
  }

  if (email === '') {
    errors.email = 'Vul je e-mailadres in, bv. naam@voorbeeld.be';
  } else if (!emailPattern.test(email)) {
    errors.email = 'Vul een volledig e-mailadres in, bv. naam@voorbeeld.be';
  }

  if (requireSubject && !isValidSubject(fields.subject)) {
    errors.subject = 'Kies waarover het gaat.';
  }

  if (message === '') {
    errors.message = 'Schrijf je bericht.';
  } else if (message.length < 10) {
    errors.message = 'Schrijf iets meer: minstens 10 tekens.';
  }

  return errors;
}
