'use client';

import {useEffect, useState, useCallback} from 'react';

type Grecaptcha = {
	ready: (callback: () => void) => void;
	execute: (siteKey: string, options: {action: string}) => Promise<string>;
};

declare global {
	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
	interface Window {
		grecaptcha?: Grecaptcha;
	}
}

const recaptchaScriptId = 'recaptcha-script';

function getGrecaptcha(): Grecaptcha | undefined {
	// eslint-disable-next-line unicorn/prefer-global-this
	return window.grecaptcha;
}

/**
 * Hook for reCAPTCHA v3 integration
 * Loads the reCAPTCHA script and provides executeRecaptcha function
 */
export function useRecaptcha() {
	const [isReady, setIsReady] = useState(false);
	const [error, setError] = useState<string | undefined>(undefined);

	// eslint-disable-next-line n/prefer-global/process
	const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

	useEffect(() => {
		// Skip if no site key configured
		if (!siteKey) {
			console.warn('NEXT_PUBLIC_RECAPTCHA_SITE_KEY not set, reCAPTCHA disabled');
			setIsReady(true);
			return;
		}

		// Check if already loaded
		if (document.querySelector(`#${recaptchaScriptId}`)) {
			const grecaptcha = getGrecaptcha();
			if (grecaptcha) {
				grecaptcha.ready(() => {
					setIsReady(true);
				});
				return;
			}

			// Script tag exists but grecaptcha not ready yet - poll until ready
			const checkReady = setInterval(() => {
				const g = getGrecaptcha();
				if (g) {
					clearInterval(checkReady);
					g.ready(() => {
						setIsReady(true);
					});
				}
			}, 100);

			return () => {
				clearInterval(checkReady);
			};
		}

		// Load the reCAPTCHA script
		const script = document.createElement('script');
		script.id = recaptchaScriptId;
		script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
		script.async = true;
		script.defer = true;

		script.addEventListener('load', () => {
			getGrecaptcha()?.ready(() => {
				setIsReady(true);
			});
		});

		script.addEventListener('error', () => {
			setError('Failed to load reCAPTCHA');
		});

		document.head.append(script);

		return () => {
			// Don't remove script on cleanup to avoid re-loading
		};
	}, [siteKey]);

	const executeRecaptcha = useCallback(async (action: string): Promise<string | undefined> => {
		// If no site key, return undefined (verification will be skipped server-side)
		if (!siteKey) {
			return undefined;
		}

		const grecaptcha = getGrecaptcha();
		if (!grecaptcha) {
			setError('reCAPTCHA not loaded');
			return undefined;
		}

		try {
			const token = await grecaptcha.execute(siteKey, {action});
			return token;
		} catch (executeError) {
			console.error('reCAPTCHA execute error:', executeError);
			setError('Failed to execute reCAPTCHA');
			return undefined;
		}
	}, [siteKey]);

	return {
		isReady,
		error,
		executeRecaptcha,
	};
}
