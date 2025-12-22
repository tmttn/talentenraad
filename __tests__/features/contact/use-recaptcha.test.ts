import {renderHook, act, waitFor} from '@testing-library/react';
import {useRecaptcha} from '../../../app/features/contact/use-recaptcha';

describe('useRecaptcha', () => {
	const originalEnv = process.env;
	const mockExecute = jest.fn();
	const mockReady = jest.fn(callback => callback());

	// Helper to set up grecaptcha.enterprise mock
	function setupGrecaptchaMock() {
		(window as {grecaptcha?: unknown}).grecaptcha = {
			enterprise: {
				ready: mockReady,
				execute: mockExecute,
			},
		};
	}

	beforeEach(() => {
		jest.resetModules();
		jest.clearAllMocks();
		process.env = {...originalEnv};

		// Reset window.grecaptcha
		delete (window as {grecaptcha?: unknown}).grecaptcha;

		// Remove any existing script tags
		const script = document.querySelector('#recaptcha-script');
		if (script) {
			script.remove();
		}
	});

	afterAll(() => {
		process.env = originalEnv;
	});

	describe('when NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not set', () => {
		it('sets isReady to true immediately', async () => {
			delete process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
			const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

			const {result} = renderHook(() => useRecaptcha());

			await waitFor(() => {
				expect(result.current.isReady).toBe(true);
			});

			expect(consoleSpy).toHaveBeenCalledWith('NEXT_PUBLIC_RECAPTCHA_SITE_KEY not set, reCAPTCHA disabled');
			consoleSpy.mockRestore();
		});

		it('executeRecaptcha returns undefined', async () => {
			delete process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
			jest.spyOn(console, 'warn').mockImplementation();

			const {result} = renderHook(() => useRecaptcha());

			await waitFor(() => {
				expect(result.current.isReady).toBe(true);
			});

			let token: string | undefined;
			await act(async () => {
				token = await result.current.executeRecaptcha('submit');
			});

			expect(token).toBeUndefined();
		});
	});

	describe('when NEXT_PUBLIC_RECAPTCHA_SITE_KEY is set', () => {
		beforeEach(() => {
			process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY = 'test-site-key';
		});

		it('loads the reCAPTCHA Enterprise script', () => {
			renderHook(() => useRecaptcha());

			const script = document.querySelector('#recaptcha-script');
			expect(script).toBeInTheDocument();
			expect(script).toHaveAttribute('src', 'https://www.google.com/recaptcha/enterprise.js?render=test-site-key');
		});

		it('sets isReady to true when script loads', async () => {
			// Set up grecaptcha.enterprise mock before rendering
			setupGrecaptchaMock();

			const {result} = renderHook(() => useRecaptcha());

			// Simulate script load
			const script = document.querySelector('#recaptcha-script');
			act(() => {
				script?.dispatchEvent(new Event('load'));
			});

			await waitFor(() => {
				expect(result.current.isReady).toBe(true);
			});
		});

		it('sets error when script fails to load', async () => {
			const {result} = renderHook(() => useRecaptcha());

			// Simulate script error
			const script = document.querySelector('#recaptcha-script');
			act(() => {
				script?.dispatchEvent(new Event('error'));
			});

			await waitFor(() => {
				expect(result.current.error).toBe('Failed to load reCAPTCHA');
			});
		});

		it('does not load script again if already loaded', () => {
			// First render
			renderHook(() => useRecaptcha());

			// Second render
			renderHook(() => useRecaptcha());

			// Should only have one script
			const scripts = document.querySelectorAll('#recaptcha-script');
			expect(scripts.length).toBe(1);
		});

		it('sets isReady if script already exists and grecaptcha is available', async () => {
			// Pre-add script
			const existingScript = document.createElement('script');
			existingScript.id = 'recaptcha-script';
			document.head.append(existingScript);

			setupGrecaptchaMock();

			const {result} = renderHook(() => useRecaptcha());

			await waitFor(() => {
				expect(result.current.isReady).toBe(true);
			});
		});

		describe('executeRecaptcha', () => {
			beforeEach(() => {
				mockExecute.mockResolvedValue('test-token');
				setupGrecaptchaMock();
			});

			it('executes reCAPTCHA and returns token', async () => {
				const {result} = renderHook(() => useRecaptcha());

				// Simulate script load
				const script = document.querySelector('#recaptcha-script');
				act(() => {
					script?.dispatchEvent(new Event('load'));
				});

				await waitFor(() => {
					expect(result.current.isReady).toBe(true);
				});

				let token: string | undefined;
				await act(async () => {
					token = await result.current.executeRecaptcha('submit');
				});

				expect(token).toBe('test-token');
				expect(mockExecute).toHaveBeenCalledWith('test-site-key', {action: 'submit'});
			});

			it('returns undefined and sets error if grecaptcha is not loaded', async () => {
				delete (window as {grecaptcha?: unknown}).grecaptcha;

				const {result} = renderHook(() => useRecaptcha());

				let token: string | undefined;
				await act(async () => {
					token = await result.current.executeRecaptcha('submit');
				});

				expect(token).toBeUndefined();
				expect(result.current.error).toBe('reCAPTCHA not loaded');
			});

			it('handles execution errors', async () => {
				const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
				mockExecute.mockRejectedValue(new Error('Execute failed'));

				setupGrecaptchaMock();

				const {result} = renderHook(() => useRecaptcha());

				// Simulate script load
				const script = document.querySelector('#recaptcha-script');
				act(() => {
					script?.dispatchEvent(new Event('load'));
				});

				await waitFor(() => {
					expect(result.current.isReady).toBe(true);
				});

				let token: string | undefined;
				await act(async () => {
					token = await result.current.executeRecaptcha('submit');
				});

				expect(token).toBeUndefined();
				expect(result.current.error).toBe('Failed to execute reCAPTCHA');
				expect(consoleSpy).toHaveBeenCalled();
				consoleSpy.mockRestore();
			});
		});
	});
});
