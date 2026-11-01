import {
  render, screen, fireEvent, waitFor, within,
} from '@testing-library/react';
import {ContactForm} from '../../../app/features/contact/contact-form';

const mockFetch = vi.fn();
global.fetch = mockFetch;

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
    mockFetch.mockReset();
  });

  it('labels every field in the je-form, with the phone visibly optional', () => {
    render(<ContactForm />);
    expect(screen.getByRole('heading', {name: 'Stuur ons een bericht'})).toBeInTheDocument();
    expect(screen.getByLabelText('Naam')).toHaveAttribute('autocomplete', 'name');
    expect(screen.getByLabelText('E-mail')).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText('Telefoon (niet verplicht)')).toHaveAttribute('type', 'tel');
    expect(screen.getByLabelText('Je bericht')).toBeInTheDocument();
  });

  it('offers the subjects as radio pills, the general question chosen by default', () => {
    render(<ContactForm />);
    const group = screen.getByRole('group', {name: 'Waarover gaat het?'});
    const radios = within(group).getAllByRole('radio');
    expect(radios.map(radio => radio.closest('label')?.textContent)).toEqual(['Algemene vraag', 'Een activiteit', 'Lid worden', 'Sponsoring', 'Iets anders']);
    expect(within(group).getByRole('radio', {name: 'Algemene vraag'})).toBeChecked();
    expect(radios[0].closest('label')).toHaveClass('rounded-full', 'has-[:checked]:bg-black');

    fireEvent.click(within(group).getByRole('radio', {name: 'Sponsoring'}));
    expect(within(group).getByRole('radio', {name: 'Sponsoring'})).toBeChecked();
  });

  it('can leave out the subject and the phone', () => {
    render(<ContactForm showSubject={false} showPhone={false} />);
    expect(screen.queryByRole('group', {name: 'Waarover gaat het?'})).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Telefoon/)).not.toBeInTheDocument();
  });

  describe('validation', () => {
    it('shows each message under its field, marks it and does not send', async () => {
      render(<ContactForm />);
      submit();

      expect(await screen.findByText('Vul je naam in.')).toBeInTheDocument();
      expect(screen.getByText('Vul je e-mailadres in, bv. naam@voorbeeld.be')).toBeInTheDocument();
      expect(screen.getByText('Schrijf je bericht.')).toBeInTheDocument();
      const naam = screen.getByLabelText('Naam');
      expect(naam).toHaveAttribute('aria-invalid', 'true');
      expect(naam).toHaveAccessibleDescription('Vul je naam in.');
      expect(naam).toHaveClass('border-red-700', 'bg-red-50');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('asks for a complete e-mail address, as on the artboard', async () => {
      render(<ContactForm />);
      fill({email: 'lies.peeters@'});
      submit();
      expect(await screen.findByText('Vul een volledig e-mailadres in, bv. naam@voorbeeld.be')).toBeInTheDocument();
    });

    it('asks for a full name and a longer message', async () => {
      render(<ContactForm />);
      fill({naam: 'L', bericht: 'Kort'});
      submit();
      expect(await screen.findByText('Vul je volledige naam in.')).toBeInTheDocument();
      expect(screen.getByText('Schrijf iets meer: minstens 10 tekens.')).toBeInTheDocument();
    });

    it('clears a message when you type in the field', async () => {
      render(<ContactForm />);
      submit();
      await screen.findByText('Vul je naam in.');
      fireEvent.change(screen.getByLabelText('Naam'), {target: {value: 'Lies'}});
      expect(screen.queryByText('Vul je naam in.')).not.toBeInTheDocument();
      expect(screen.getByLabelText('Naam')).not.toHaveAttribute('aria-invalid');
    });
  });

  describe('sending', () => {
    it('sends the fields with the chosen subject and thanks you', async () => {
      mockFetch.mockResolvedValue({ok: true, json: () => Promise.resolve({success: true})});
      render(<ContactForm />);
      fill();
      fireEvent.change(screen.getByLabelText('Telefoon (niet verplicht)'), {target: {value: '0470 12 34 56'}});
      fireEvent.click(screen.getByRole('radio', {name: 'Lid worden'}));
      submit();

      expect(await screen.findByRole('heading', {name: 'Bedankt voor je bericht!'})).toBeInTheDocument();
      const sent = JSON.parse((mockFetch.mock.calls[0] as [string, {body: string}])[1].body) as Record<string, string>;
      expect(sent).toMatchObject({name: 'Lies Peeters', email: 'lies@voorbeeld.be', phone: '0470 12 34 56', subject: 'lidmaatschap', website: ''});
    });

    it('shows a busy state while sending', async () => {
      let resolve: (value: unknown) => void = () => {};
      mockFetch.mockReturnValue(new Promise(r => {
        resolve = r;
      }));
      render(<ContactForm />);
      fill();
      submit();
      expect(await screen.findByRole('button', {name: /Bezig met versturen/})).toBeDisabled();
      resolve({ok: true, json: () => Promise.resolve({success: true})});
      await screen.findByRole('heading', {name: 'Bedankt voor je bericht!'});
    });

    it('shows the server messages per field', async () => {
      mockFetch.mockResolvedValue({ok: false, status: 400, json: () => Promise.resolve({errors: {email: 'Vul een volledig e-mailadres in, bv. naam@voorbeeld.be'}, message: 'Er klopt nog iets niet.'})});
      render(<ContactForm />);
      fill();
      submit();
      expect(await screen.findByText('Vul een volledig e-mailadres in, bv. naam@voorbeeld.be')).toBeInTheDocument();
    });

    it('explains a network failure', async () => {
      mockFetch.mockRejectedValue(new Error('offline'));
      render(<ContactForm />);
      fill();
      submit();
      expect(await screen.findByRole('alert')).toHaveTextContent('Je bericht is niet verstuurd.');
    });

    it('shows the rate limit message', async () => {
      const message = 'Te veel berichten in korte tijd. Probeer het over enkele minuten opnieuw.';
      mockFetch.mockResolvedValue({ok: false, status: 429, json: () => Promise.resolve({success: false, message})});
      render(<ContactForm />);
      fill();
      submit();
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(message);
      });
    });

    it('has a hidden, unfocusable honeypot field', () => {
      const {container} = render(<ContactForm />);
      const honeypot = container.querySelector<HTMLInputElement>('input[name="website"]')!;
      expect(honeypot).toHaveAttribute('tabindex', '-1');
      expect(honeypot.closest('[aria-hidden="true"]')).not.toBeNull();
    });
  });
});
