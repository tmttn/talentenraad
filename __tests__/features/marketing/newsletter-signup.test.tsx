import {render, screen, fireEvent, waitFor, act} from '@testing-library/react';
import {NewsletterSignupInfo} from '../../../app/features/marketing/newsletter-signup';

const NewsletterSignup = NewsletterSignupInfo.component;

describe('NewsletterSignup', () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('renders email input', () => {
		render(<NewsletterSignup />);
		expect(screen.getByPlaceholderText('Je e-mailadres')).toBeInTheDocument();
	});

	it('has sr-only label for accessibility', () => {
		render(<NewsletterSignup />);
		expect(screen.getByLabelText('E-mailadres')).toBeInTheDocument();
	});

	it('renders submit button with default text', () => {
		render(<NewsletterSignup />);
		expect(screen.getByRole('button', {name: /inschrijven/i})).toBeInTheDocument();
	});

	it('renders submit button with custom text', () => {
		render(<NewsletterSignup buttonText='Subscribe Now' />);
		expect(screen.getByRole('button', {name: /subscribe now/i})).toBeInTheDocument();
	});

	it('handles form submission successfully', async () => {
		render(<NewsletterSignup />);

		const emailInput = screen.getByLabelText('E-mailadres');
		const submitButton = screen.getByRole('button', {name: /inschrijven/i});

		fireEvent.change(emailInput, {target: {value: 'test@example.com'}});
		fireEvent.click(submitButton);

		// Should show loading state
		expect(screen.getByText(/bezig/i)).toBeInTheDocument();

		// Advance timers
		await act(async () => {
			jest.advanceTimersByTime(1000);
		});

		// Should show success message
		await waitFor(() => {
			expect(screen.getByText(/bedankt voor je inschrijving/i)).toBeInTheDocument();
		});
	});

	it('clears email input after successful submission', async () => {
		render(<NewsletterSignup />);

		const emailInput = screen.getByLabelText('E-mailadres') as HTMLInputElement;
		fireEvent.change(emailInput, {target: {value: 'test@example.com'}});
		fireEvent.click(screen.getByRole('button', {name: /inschrijven/i}));

		await act(async () => {
			jest.advanceTimersByTime(1000);
		});

		await waitFor(() => {
			expect(emailInput.value).toBe('');
		});
	});

	it('disables form during submission', async () => {
		render(<NewsletterSignup />);

		const emailInput = screen.getByLabelText('E-mailadres');
		const submitButton = screen.getByRole('button', {name: /inschrijven/i});

		fireEvent.change(emailInput, {target: {value: 'test@example.com'}});
		fireEvent.click(submitButton);

		expect(emailInput).toBeDisabled();
		expect(submitButton).toBeDisabled();

		await act(async () => {
			jest.advanceTimersByTime(1000);
		});
	});

	it('renders as a form element', () => {
		const {container} = render(<NewsletterSignup />);
		const form = container.querySelector('form');
		expect(form).toBeInTheDocument();
	});
});

describe('NewsletterSignupInfo', () => {
	it('exports correct component info', () => {
		expect(NewsletterSignupInfo.name).toBe('NewsletterSignup');
		expect(NewsletterSignupInfo.component).toBeDefined();
		expect(NewsletterSignupInfo.inputs).toBeInstanceOf(Array);
	});

	it('has buttonText input', () => {
		const buttonTextInput = NewsletterSignupInfo.inputs.find(i => i.name === 'buttonText');
		expect(buttonTextInput).toBeDefined();
		expect(buttonTextInput?.defaultValue).toBe('Inschrijven');
	});
});
