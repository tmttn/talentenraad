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

	describe('card variant (default)', () => {
		it('renders title and subtitle', () => {
			render(<NewsletterSignup />);
			expect(screen.getByRole('heading', {name: /blijf op de hoogte/i})).toBeInTheDocument();
			expect(screen.getByText(/ontvang updates/i)).toBeInTheDocument();
		});

		it('renders email input with label', () => {
			render(<NewsletterSignup />);
			expect(screen.getByLabelText('E-mailadres')).toBeInTheDocument();
		});

		it('renders submit button', () => {
			render(<NewsletterSignup />);
			expect(screen.getByRole('button', {name: /inschrijven/i})).toBeInTheDocument();
		});

		it('shows social links by default', () => {
			render(<NewsletterSignup />);
			expect(screen.getByLabelText(/facebook/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/instagram/i)).toBeInTheDocument();
		});

		it('hides social links when showSocialLinks is false', () => {
			render(<NewsletterSignup showSocialLinks={false} />);
			expect(screen.queryByLabelText(/facebook/i)).not.toBeInTheDocument();
		});

		it('handles form submission successfully', async () => {
			render(<NewsletterSignup />);

			const emailInput = screen.getByLabelText('E-mailadres');
			const submitButton = screen.getByRole('button', {name: /inschrijven/i});

			fireEvent.change(emailInput, {target: {value: 'test@example.com'}});
			fireEvent.click(submitButton);

			// Should show loading state
			expect(screen.getByText(/bezig met inschrijven/i)).toBeInTheDocument();

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
	});

	describe('inline variant', () => {
		it('renders inline form', () => {
			render(<NewsletterSignup variant='inline' />);
			expect(screen.getByPlaceholderText('Je e-mailadres')).toBeInTheDocument();
		});

		it('has sr-only label for accessibility', () => {
			render(<NewsletterSignup variant='inline' />);
			expect(screen.getByLabelText('E-mailadres')).toBeInTheDocument();
		});
	});

	describe('banner variant', () => {
		it('renders in banner layout', () => {
			const {container} = render(<NewsletterSignup variant='banner' />);
			const section = container.querySelector('section');
			expect(section).toHaveClass('bg-gradient-to-r');
		});

		it('renders title and subtitle', () => {
			render(<NewsletterSignup variant='banner' title='Banner Title' subtitle='Banner subtitle' />);
			expect(screen.getByRole('heading', {name: 'Banner Title'})).toBeInTheDocument();
			expect(screen.getByText('Banner subtitle')).toBeInTheDocument();
		});
	});

	describe('custom props', () => {
		it('uses custom title', () => {
			render(<NewsletterSignup title='Custom Title' />);
			expect(screen.getByRole('heading', {name: 'Custom Title'})).toBeInTheDocument();
		});

		it('uses custom subtitle', () => {
			render(<NewsletterSignup subtitle='Custom subtitle text' />);
			expect(screen.getByText('Custom subtitle text')).toBeInTheDocument();
		});

		it('uses custom button text', () => {
			render(<NewsletterSignup buttonText='Subscribe Now' />);
			expect(screen.getByRole('button', {name: /subscribe now/i})).toBeInTheDocument();
		});
	});

	it('shows privacy notice', () => {
		render(<NewsletterSignup />);
		expect(screen.getByText(/we respecteren je privacy/i)).toBeInTheDocument();
	});
});

describe('NewsletterSignupInfo', () => {
	it('exports correct component info', () => {
		expect(NewsletterSignupInfo.name).toBe('NewsletterSignup');
		expect(NewsletterSignupInfo.component).toBeDefined();
		expect(NewsletterSignupInfo.inputs).toBeInstanceOf(Array);
	});
});
