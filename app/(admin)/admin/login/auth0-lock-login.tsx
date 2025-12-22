'use client';

import {useEffect, useRef, useState} from 'react';
import {brandColors} from '@/styles/tokens/colors';

type Auth0LockLoginProps = {
	domain: string;
	clientId: string;
	returnTo: string;
};

// Type for Auth0Lock instance
type Auth0LockInstance = {
	show: () => void;
	hide: () => void;
	on: (event: string, callback: (...args: unknown[]) => void) => void;
};

// Declare Auth0Lock on window for CDN loading
declare global {
	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
	interface Window {
		Auth0Lock?: new (clientId: string, domain: string, options?: Record<string, unknown>) => Auth0LockInstance;
	}
}

function loadAuth0LockScript(): Promise<void> {
	return new Promise((resolve, reject) => {
		// Check if already loaded
		if (window.Auth0Lock) {
			resolve();
			return;
		}

		// Check if script is already being loaded
		const existingScript = document.querySelector('script[src*="auth0-lock"]');
		if (existingScript) {
			existingScript.addEventListener('load', () => {
				resolve();
			});
			existingScript.addEventListener('error', () => {
				reject(new Error('Failed to load Auth0 Lock script'));
			});
			return;
		}

		// Load the script from CDN
		const script = document.createElement('script');
		script.src = 'https://cdn.auth0.com/js/lock/12.5/lock.min.js';
		script.async = true;
		script.onload = () => {
			resolve();
		};

		script.onerror = () => {
			reject(new Error('Failed to load Auth0 Lock script'));
		};

		document.head.append(script);
	});
}

export function Auth0LockLogin({domain, clientId, returnTo}: Auth0LockLoginProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const lockRef = useRef<Auth0LockInstance | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let mounted = true;

		async function initLock() {
			try {
				// Load Auth0 Lock from CDN
				await loadAuth0LockScript();

				if (!mounted || !containerRef.current || !window.Auth0Lock) {
					return;
				}

				// Build the callback URL for Auth0
				const callbackUrl = `${window.location.origin}/auth/callback`;

				// Store returnTo in sessionStorage for after callback
				// (can't use custom state param - conflicts with Auth0 SDK's CSRF validation)
				sessionStorage.setItem('auth0_returnTo', returnTo);

				// Initialize Auth0 Lock with custom branding
				const lock = new window.Auth0Lock(clientId, domain, {
					container: 'auth0-lock-container',
					auth: {
						redirectUrl: callbackUrl,
						responseType: 'code',
						params: {
							scope: 'openid profile email',
						},
					},
					theme: {
						logo: '/Logo.png',
						primaryColor: brandColors.primary.shade500,
						authButtons: {
							connectionName: {
								displayName: 'Log in',
								primaryColor: brandColors.primary.shade500,
								foregroundColor: '#ffffff',
							},
						},
					},
					languageDictionary: {
						title: 'Admin Login',
						loginLabel: 'Inloggen',
						loginSubmitLabel: 'Inloggen',
						emailInputPlaceholder: 'je@email.nl',
						passwordInputPlaceholder: 'je wachtwoord',
						forgotPasswordAction: 'Wachtwoord vergeten?',
						lastLoginInstructions: 'Vorige keer logde je in met',
						loginWithLabel: 'Inloggen met %s',
						signUpLabel: 'Registreren',
						signUpSubmitLabel: 'Registreren',
						signUpTitle: 'Registreren',
						usernameInputPlaceholder: 'je gebruikersnaam',
						usernameOrEmailInputPlaceholder: 'gebruikersnaam/email',
						error: {
							forgotPassword: {
								too_many_requests: 'Je hebt de limiet voor wachtwoord reset bereikt. Wacht even en probeer opnieuw.',
								'lock.fallback': 'Er ging iets mis bij het aanvragen van de wachtwoord reset.',
								enterprise_email: 'Het domein van je email maakt deel uit van een Enterprise identity provider. Om je wachtwoord te resetten, neem contact op met je beveiligingsbeheerder.',
							},
							login: {
								blocked_user: 'De gebruiker is geblokkeerd.',
								invalid_user_password: 'Ongeldige inloggegevens.',
								'lock.fallback': 'Er ging iets mis. Probeer het opnieuw.',
								'lock.invalid_code': 'Ongeldige code.',
								'lock.invalid_email_password': 'Ongeldig email of wachtwoord.',
								'lock.invalid_username_password': 'Ongeldige gebruikersnaam of wachtwoord.',
								'lock.network': 'We konden de server niet bereiken. Controleer je verbinding en probeer opnieuw.',
								'lock.popup_closed': 'Popup venster gesloten. Probeer opnieuw.',
								'lock.unauthorized': 'Toegang geweigerd. Probeer opnieuw.',
								password_change_required: 'Je moet je wachtwoord bijwerken omdat dit de eerste keer is dat je inlogt, of omdat je wachtwoord is verlopen.',
								password_leaked: 'Deze login is geblokkeerd omdat je wachtwoord is gelekt op een andere website. We hebben je een email gestuurd met instructies om je account te ontgrendelen.',
								too_many_attempts: 'Je account is geblokkeerd na meerdere opeenvolgende inlogpogingen.',
								too_many_requests: 'Sorry, je probeert te vaak in te loggen. Wacht even en probeer opnieuw.',
								session_missing: 'Kon je authenticatie verzoek niet voltooien. Probeer opnieuw na het sluiten van alle open dialogen.',
							},
							passwordless: {
								'bad.email': 'Het email is ongeldig.',
								'bad.phone_number': 'Het telefoonnummer is ongeldig.',
								'lock.fallback': 'Er ging iets mis. Probeer het opnieuw.',
								'lock.network': 'We konden de server niet bereiken. Controleer je verbinding en probeer opnieuw.',
								'lock.unauthorized': 'Toegang geweigerd. Probeer opnieuw.',
							},
							signUp: {
								invalid_password: 'Wachtwoord is ongeldig.',
								'lock.fallback': 'Er ging iets mis bij het registreren.',
								password_dictionary_error: 'Wachtwoord is te gewoon.',
								password_no_user_info_error: 'Wachtwoord is gebaseerd op gebruikersinformatie.',
								password_strength_error: 'Wachtwoord is te zwak.',
								user_exists: 'De gebruiker bestaat al.',
								username_exists: 'De gebruikersnaam bestaat al.',
								social_signup_needs_terms_acception: 'Accepteer de Servicevoorwaarden hieronder om door te gaan.',
							},
						},
						success: {
							logIn: 'Bedankt voor het inloggen.',
							signUp: 'Bedankt voor het registreren.',
						},
					},
					language: 'nl',
					closable: false,
					allowSignUp: false,
					allowShowPassword: true,
					rememberLastLogin: true,
					avatar: null,
					additionalSignUpFields: [],
				});

				lockRef.current = lock;
				lock.show();
				setIsLoading(false);

				// Handle authentication events
				lock.on('authenticated', () => {
					// The SDK handles the redirect automatically
					console.log('Authentication successful');
				});

				lock.on('authorization_error', (err: unknown) => {
					console.error('Authorization error:', err);
					const errorObj = err as {errorDescription?: string} | undefined;
					setError(errorObj?.errorDescription ?? 'Er ging iets mis bij het inloggen.');
				});
			} catch (err) {
				console.error('Failed to initialize Auth0 Lock:', err);
				if (mounted) {
					setError('Kon de login niet laden. Probeer de pagina te verversen.');
					setIsLoading(false);
				}
			}
		}

		void initLock();

		return () => {
			mounted = false;
			if (lockRef.current) {
				lockRef.current.hide();
			}
		};
	}, [domain, clientId, returnTo]);

	return (
		<div className="w-full">
			{isLoading && (
				<div className="flex items-center justify-center py-12">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
				</div>
			)}
			{error && (
				<div className="bg-red-50 border border-red-200 rounded-card p-4 mb-4">
					<p className="text-red-700 text-sm">{error}</p>
					<button
						type="button"
						onClick={() => window.location.reload()}
						className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
					>
						Probeer opnieuw
					</button>
				</div>
			)}
			<div
				id="auth0-lock-container"
				ref={containerRef}
				className="auth0-lock-container"
			/>
			<style jsx global>{`
				/* Override Auth0 Lock styles for better integration */
				.auth0-lock.auth0-lock {
					font-family: inherit !important;
				}

				.auth0-lock.auth0-lock .auth0-lock-widget {
					box-shadow: none !important;
					border-radius: 0 !important;
					overflow: visible !important;
				}

				.auth0-lock.auth0-lock .auth0-lock-header {
					display: none !important;
				}

				.auth0-lock.auth0-lock .auth0-lock-content-wrapper {
					background: transparent !important;
				}

				.auth0-lock.auth0-lock .auth0-lock-content {
					padding: 0 !important;
				}

				.auth0-lock.auth0-lock .auth0-lock-form {
					padding: 0 !important;
				}

				.auth0-lock.auth0-lock .auth0-lock-input-wrap {
					border-radius: 0.5rem !important;
					border-color: #e5e7eb !important;
				}

				.auth0-lock.auth0-lock .auth0-lock-input-wrap.auth0-lock-focused {
					border-color: ${brandColors.primary.shade500} !important;
					box-shadow: 0 0 0 3px ${brandColors.primary.shade500}20 !important;
				}

				.auth0-lock.auth0-lock .auth0-lock-input {
					font-size: 1rem !important;
					padding: 0.75rem 1rem !important;
				}

				.auth0-lock.auth0-lock .auth0-lock-submit {
					border-radius: 0.75rem !important;
					font-weight: 500 !important;
					padding: 0.75rem 1rem !important;
					transition: background-color 0.15s ease !important;
				}

				.auth0-lock.auth0-lock .auth0-lock-submit:hover {
					background-color: ${brandColors.primary.shade700} !important;
				}

				.auth0-lock.auth0-lock .auth0-lock-alternative {
					margin-top: 1rem !important;
				}

				.auth0-lock.auth0-lock .auth0-lock-alternative-link {
					color: ${brandColors.primary.shade500} !important;
				}

				.auth0-lock.auth0-lock .auth0-lock-alternative-link:hover {
					color: ${brandColors.primary.shade700} !important;
				}

				.auth0-lock.auth0-lock .auth0-lock-social-button {
					border-radius: 0.5rem !important;
				}

				.auth0-lock.auth0-lock .auth0-lock-social-button-text {
					font-weight: 500 !important;
				}

				/* Hide unnecessary elements */
				.auth0-lock.auth0-lock .auth0-lock-badge-bottom {
					display: none !important;
				}

				.auth0-lock-overlay {
					display: none !important;
				}

				/* Error styles */
				.auth0-lock.auth0-lock .auth0-lock-error-msg {
					border-radius: 0.5rem !important;
					padding: 0.75rem 1rem !important;
				}

				/* Password visibility toggle */
				.auth0-lock.auth0-lock .auth0-lock-show-password {
					right: 0.75rem !important;
					color: #6b7280 !important;
				}
			`}</style>
		</div>
	);
}
