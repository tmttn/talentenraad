import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {ContactFormInfo} from '../../../app/features/contact/contact-form';

const ContactForm = ContactFormInfo.component;

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('ContactForm', () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	it('renders title and subtitle', () => {
		render(<ContactForm title='Contact Title' subtitle='Contact subtitle' />);
		expect(screen.getByRole('heading', {name: 'Contact Title'})).toBeInTheDocument();
		expect(screen.getByText('Contact subtitle')).toBeInTheDocument();
	});

	it('renders required form fields', () => {
		render(<ContactForm />);
		expect(screen.getByLabelText(/naam/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/bericht/i)).toBeInTheDocument();
	});

	it('renders subject dropdown by default', () => {
		render(<ContactForm />);
		expect(screen.getByLabelText(/onderwerp/i)).toBeInTheDocument();
	});

	it('hides subject dropdown when showSubject is false', () => {
		render(<ContactForm showSubject={false} />);
		expect(screen.queryByLabelText(/onderwerp/i)).not.toBeInTheDocument();
	});

	it('shows phone field when showPhone is true', () => {
		render(<ContactForm showPhone />);
		expect(screen.getByLabelText(/telefoonnummer/i)).toBeInTheDocument();
	});

	it('hides phone field by default', () => {
		render(<ContactForm />);
		expect(screen.queryByLabelText(/telefoonnummer/i)).not.toBeInTheDocument();
	});

	describe('validation', () => {
		it('shows error for empty name', async () => {
			render(<ContactForm showSubject={false} />);

			const submitButton = screen.getByRole('button', {name: /verstuur bericht/i});
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(screen.getByText('Naam is verplicht')).toBeInTheDocument();
			});
		});

		it('shows error for short name', async () => {
			render(<ContactForm showSubject={false} />);

			const nameInput = screen.getByLabelText(/naam/i);
			fireEvent.change(nameInput, {target: {value: 'A'}});

			const submitButton = screen.getByRole('button', {name: /verstuur bericht/i});
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(screen.getByText('Naam moet minstens 2 karakters bevatten')).toBeInTheDocument();
			});
		});

		it('shows error for empty email', async () => {
			render(<ContactForm showSubject={false} />);

			const nameInput = screen.getByLabelText(/naam/i);
			fireEvent.change(nameInput, {target: {value: 'Test User'}});

			const submitButton = screen.getByRole('button', {name: /verstuur bericht/i});
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(screen.getByText('E-mailadres is verplicht')).toBeInTheDocument();
			});
		});

		it('shows error for invalid email', async () => {
			render(<ContactForm showSubject={false} />);

			const nameInput = screen.getByLabelText(/naam/i);
			const emailInput = screen.getByLabelText(/e-mail/i);

			fireEvent.change(nameInput, {target: {value: 'Test User'}});
			fireEvent.change(emailInput, {target: {value: 'invalid-email'}});

			const submitButton = screen.getByRole('button', {name: /verstuur bericht/i});
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(screen.getByText('Ongeldig e-mailadres')).toBeInTheDocument();
			});
		});

		it('shows error for empty message', async () => {
			render(<ContactForm showSubject={false} />);

			const nameInput = screen.getByLabelText(/naam/i);
			const emailInput = screen.getByLabelText(/e-mail/i);

			fireEvent.change(nameInput, {target: {value: 'Test User'}});
			fireEvent.change(emailInput, {target: {value: 'test@example.com'}});

			const submitButton = screen.getByRole('button', {name: /verstuur bericht/i});
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(screen.getByText('Bericht is verplicht')).toBeInTheDocument();
			});
		});

		it('shows error for short message', async () => {
			render(<ContactForm showSubject={false} />);

			const nameInput = screen.getByLabelText(/naam/i);
			const emailInput = screen.getByLabelText(/e-mail/i);
			const messageInput = screen.getByLabelText(/bericht/i);

			fireEvent.change(nameInput, {target: {value: 'Test User'}});
			fireEvent.change(emailInput, {target: {value: 'test@example.com'}});
			fireEvent.change(messageInput, {target: {value: 'Short'}});

			const submitButton = screen.getByRole('button', {name: /verstuur bericht/i});
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(screen.getByText('Bericht moet minstens 10 karakters bevatten')).toBeInTheDocument();
			});
		});

		it('shows error for missing subject when required', async () => {
			render(<ContactForm showSubject />);

			const nameInput = screen.getByLabelText(/naam/i);
			const emailInput = screen.getByLabelText(/e-mail/i);
			const messageInput = screen.getByLabelText(/bericht/i);

			fireEvent.change(nameInput, {target: {value: 'Test User'}});
			fireEvent.change(emailInput, {target: {value: 'test@example.com'}});
			fireEvent.change(messageInput, {target: {value: 'This is a longer message for testing'}});

			const submitButton = screen.getByRole('button', {name: /verstuur bericht/i});
			fireEvent.click(submitButton);

			await waitFor(() => {
				// Use role="alert" to find the error message, not the option placeholder
				expect(screen.getByRole('alert')).toHaveTextContent('Selecteer een onderwerp');
			});
		});

		it('clears error when user starts typing', async () => {
			render(<ContactForm showSubject={false} />);

			const submitButton = screen.getByRole('button', {name: /verstuur bericht/i});
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(screen.getByText('Naam is verplicht')).toBeInTheDocument();
			});

			const nameInput = screen.getByLabelText(/naam/i);
			fireEvent.change(nameInput, {target: {value: 'Test'}});

			expect(screen.queryByText('Naam is verplicht')).not.toBeInTheDocument();
		});
	});

	describe('form submission', () => {
		it('submits form successfully', async () => {
			mockFetch.mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({message: 'Success'}),
			});

			render(<ContactForm showSubject={false} />);

			const nameInput = screen.getByLabelText(/naam/i);
			const emailInput = screen.getByLabelText(/e-mail/i);
			const messageInput = screen.getByLabelText(/bericht/i);

			fireEvent.change(nameInput, {target: {value: 'Test User'}});
			fireEvent.change(emailInput, {target: {value: 'test@example.com'}});
			fireEvent.change(messageInput, {target: {value: 'This is a test message that is long enough'}});

			const submitButton = screen.getByRole('button', {name: /verstuur bericht/i});
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(screen.getByText(/bedankt voor uw bericht/i)).toBeInTheDocument();
			});
		});

		it('shows loading state during submission', async () => {
			mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

			render(<ContactForm showSubject={false} />);

			const nameInput = screen.getByLabelText(/naam/i);
			const emailInput = screen.getByLabelText(/e-mail/i);
			const messageInput = screen.getByLabelText(/bericht/i);

			fireEvent.change(nameInput, {target: {value: 'Test User'}});
			fireEvent.change(emailInput, {target: {value: 'test@example.com'}});
			fireEvent.change(messageInput, {target: {value: 'This is a test message that is long enough'}});

			const submitButton = screen.getByRole('button', {name: /verstuur bericht/i});
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(screen.getByText(/verzenden/i)).toBeInTheDocument();
			});

			expect(submitButton).toBeDisabled();
		});

		it('handles server validation errors', async () => {
			mockFetch.mockResolvedValue({
				ok: false,
				json: () => Promise.resolve({
					message: 'Validation failed',
					errors: {email: 'Invalid email'},
				}),
			});

			render(<ContactForm showSubject={false} />);

			const nameInput = screen.getByLabelText(/naam/i);
			const emailInput = screen.getByLabelText(/e-mail/i);
			const messageInput = screen.getByLabelText(/bericht/i);

			fireEvent.change(nameInput, {target: {value: 'Test User'}});
			fireEvent.change(emailInput, {target: {value: 'test@example.com'}});
			fireEvent.change(messageInput, {target: {value: 'This is a test message that is long enough'}});

			const submitButton = screen.getByRole('button', {name: /verstuur bericht/i});
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(screen.getByText('Invalid email')).toBeInTheDocument();
			});
		});

		it('handles network error', async () => {
			mockFetch.mockRejectedValue(new Error('Network error'));

			render(<ContactForm showSubject={false} />);

			const nameInput = screen.getByLabelText(/naam/i);
			const emailInput = screen.getByLabelText(/e-mail/i);
			const messageInput = screen.getByLabelText(/bericht/i);

			fireEvent.change(nameInput, {target: {value: 'Test User'}});
			fireEvent.change(emailInput, {target: {value: 'test@example.com'}});
			fireEvent.change(messageInput, {target: {value: 'This is a test message that is long enough'}});

			const submitButton = screen.getByRole('button', {name: /verstuur bericht/i});
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(screen.getByText(/netwerkfout/i)).toBeInTheDocument();
			});
		});
	});

	it('has proper accessibility attributes', () => {
		render(<ContactForm />);

		const nameInput = screen.getByLabelText(/naam/i);
		expect(nameInput).toHaveAttribute('aria-required', 'true');
	});
});

describe('ContactFormInfo', () => {
	it('exports correct component info', () => {
		expect(ContactFormInfo.name).toBe('ContactForm');
		expect(ContactFormInfo.component).toBeDefined();
		expect(ContactFormInfo.inputs).toBeInstanceOf(Array);
	});
});
