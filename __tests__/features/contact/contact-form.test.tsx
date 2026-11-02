import {
  render, screen, fireEvent, waitFor, within,
} from '@testing-library/react';
import {ContactForm} from '../../../app/features/contact/contact-form';
import type {ContactState} from '../../../app/(main)/contact/actions';

// The real action talks to the database; the form gets a stand-in through its `action` prop
vi.mock('../../../app/(main)/contact/actions', () => ({sendContact: vi.fn()}));

const action = vi.fn<(state: ContactState, data: FormData) => Promise<ContactState>>();

const fill = (values: Partial<Record<'naam' | 'email' | 'bericht', string>> = {}) => {
  fireEvent.change(screen.getByLabelText('Naam'), {target: {value: values.naam ?? 'Lies Peeters'}});
  fireEvent.change(screen.getByLabelText('E-mail'), {target: {value: values.email ?? 'lies@voorbeeld.be'}});
  fireEvent.change(screen.getByLabelText('Je bericht'), {target: {value: values.bericht ?? 'Een bericht dat lang genoeg is.'}});
};

const submit = () => {
  fireEvent.click(screen.getByRole('button', {name: /Verstuur je bericht/}));
};

describe('ContactForm', () => {
  beforeEach(() => {
    action.mockReset();
  });

  it('labels every field in the je-form, with the phone visibly optional', () => {
    render(<ContactForm formToken='123.token' action={action} />);
    expect(screen.getByRole('heading', {name: 'Stuur ons een bericht'})).toBeInTheDocument();
    expect(screen.getByLabelText('Naam')).toHaveAttribute('autocomplete', 'name');
    expect(screen.getByLabelText('E-mail')).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText('Telefoon (niet verplicht)')).toHaveAttribute('type', 'tel');
    expect(screen.getByLabelText('Je bericht')).toBeInTheDocument();
  });

  it('offers the subjects as radio pills, the general question chosen by default', () => {
    render(<ContactForm formToken='123.token' action={action} />);
    const group = screen.getByRole('group', {name: 'Waarover gaat het?'});
    const radios = within(group).getAllByRole('radio');
    expect(radios.map(radio => radio.closest('label')?.textContent)).toEqual(['Algemene vraag', 'Een activiteit', 'Lid worden', 'Sponsoring', 'Iets anders']);
    expect(within(group).getByRole('radio', {name: 'Algemene vraag'})).toBeChecked();
    expect(radios[0].closest('label')).toHaveClass('rounded-full', 'has-[:checked]:bg-black');

    fireEvent.click(within(group).getByRole('radio', {name: 'Sponsoring'}));
    expect(within(group).getByRole('radio', {name: 'Sponsoring'})).toBeChecked();
  });

  it('can leave out the subject and the phone', () => {
    render(<ContactForm formToken='123.token' action={action} showSubject={false} showPhone={false} />);
    expect(screen.queryByRole('group', {name: 'Waarover gaat het?'})).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Telefoon/)).not.toBeInTheDocument();
  });

  describe('validation', () => {
    it('shows each message under its field, marks it and does not send', async () => {
      render(<ContactForm formToken='123.token' action={action} />);
      submit();

      expect(await screen.findByText('Vul je naam in.')).toBeInTheDocument();
      expect(screen.getByText('Vul je e-mailadres in, bv. naam@voorbeeld.be')).toBeInTheDocument();
      expect(screen.getByText('Schrijf je bericht.')).toBeInTheDocument();
      const naam = screen.getByLabelText('Naam');
      expect(naam).toHaveAttribute('aria-invalid', 'true');
      expect(naam).toHaveAccessibleDescription('Vul je naam in.');
      expect(naam).toHaveClass('border-red-700', 'bg-red-50');
      expect(action).not.toHaveBeenCalled();
    });

    it('asks for a complete e-mail address, as on the artboard', async () => {
      render(<ContactForm formToken='123.token' action={action} />);
      fill({email: 'lies.peeters@'});
      submit();
      expect(await screen.findByText('Vul een volledig e-mailadres in, bv. naam@voorbeeld.be')).toBeInTheDocument();
    });

    it('asks for a full name and a longer message', async () => {
      render(<ContactForm formToken='123.token' action={action} />);
      fill({naam: 'L', bericht: 'Kort'});
      submit();
      expect(await screen.findByText('Vul je volledige naam in.')).toBeInTheDocument();
      expect(screen.getByText('Schrijf iets meer: minstens 10 tekens.')).toBeInTheDocument();
    });

    it('clears a message when you type in the field', async () => {
      render(<ContactForm formToken='123.token' action={action} />);
      submit();
      await screen.findByText('Vul je naam in.');
      fireEvent.change(screen.getByLabelText('Naam'), {target: {value: 'Lies'}});
      expect(screen.queryByText('Vul je naam in.')).not.toBeInTheDocument();
      expect(screen.getByLabelText('Naam')).not.toHaveAttribute('aria-invalid');
    });
  });

  it('preselects the subject it is given', () => {
    render(<ContactForm formToken='123.token' action={action} defaultSubject='activiteit' />);
    expect(screen.getByRole('radio', {name: 'Een activiteit'})).toBeChecked();
  });

  describe('sending', () => {
    it('sends the fields with the chosen subject and thanks you', async () => {
      action.mockResolvedValue({status: 'sent'});
      render(<ContactForm formToken='123.token' action={action} />);
      fill();
      fireEvent.change(screen.getByLabelText('Telefoon (niet verplicht)'), {target: {value: '0470 12 34 56'}});
      fireEvent.click(screen.getByRole('radio', {name: 'Lid worden'}));
      submit();

      expect(await screen.findByRole('heading', {name: 'Bedankt voor je bericht!'})).toBeInTheDocument();
      const data = action.mock.calls[0][1];
      expect(Object.fromEntries(data)).toMatchObject({
        name: 'Lies Peeters', email: 'lies@voorbeeld.be', phone: '0470 12 34 56', subject: 'lidmaatschap', website: '', formToken: '123.token',
      });
    });

    it('shows a busy state while sending', async () => {
      let resolve: (value: ContactState) => void = () => {};
      action.mockReturnValue(new Promise(r => {
        resolve = r;
      }));
      render(<ContactForm formToken='123.token' action={action} />);
      fill();
      submit();
      expect(await screen.findByRole('button', {name: /Bezig met versturen/})).toBeDisabled();
      resolve({status: 'sent'});
      await screen.findByRole('heading', {name: 'Bedankt voor je bericht!'});
    });

    it('shows the server messages per field and keeps what you typed', async () => {
      action.mockResolvedValue({
        status: 'error',
        message: 'Er klopt nog iets niet. Kijk de rode velden na.',
        errors: {email: 'Vul een volledig e-mailadres in, bv. naam@voorbeeld.be'},
        values: {name: 'Lies Peeters', email: 'lies@voorbeeld', phone: '', subject: 'sponsoring', message: 'Een bericht dat lang genoeg is.'},
      });
      render(<ContactForm formToken='123.token' action={action} />);
      fill({email: 'lies@voorbeeld.be'});
      submit();
      expect(await screen.findByText('Vul een volledig e-mailadres in, bv. naam@voorbeeld.be')).toBeInTheDocument();
      expect(screen.getByLabelText('Naam')).toHaveValue('Lies Peeters');
      expect(screen.getByRole('radio', {name: 'Sponsoring'})).toBeChecked();
      await waitFor(() => {
        expect(screen.getByLabelText('E-mail')).toHaveFocus();
      });

      fireEvent.change(screen.getByLabelText('E-mail'), {target: {value: 'lies@voorbeeld.com'}});
      expect(screen.queryByText('Vul een volledig e-mailadres in, bv. naam@voorbeeld.be')).not.toBeInTheDocument();
    });

    it('shows a message for the whole form, such as the rate limit', async () => {
      const message = 'Te veel berichten in korte tijd. Probeer het over enkele minuten opnieuw.';
      action.mockResolvedValue({status: 'error', message, values: {name: 'Lies Peeters', email: 'lies@voorbeeld.be', phone: '', subject: 'vraag', message: 'Een bericht dat lang genoeg is.'}});
      render(<ContactForm formToken='123.token' action={action} />);
      fill();
      submit();
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(message);
      });
    });

    it('has a hidden, unfocusable honeypot field', () => {
      const {container} = render(<ContactForm formToken='123.token' action={action} />);
      const honeypot = container.querySelector<HTMLInputElement>('input[name="website"]')!;
      expect(honeypot).toHaveAttribute('tabindex', '-1');
      expect(honeypot.closest('[aria-hidden="true"]')).not.toBeNull();
    });
  });
});
