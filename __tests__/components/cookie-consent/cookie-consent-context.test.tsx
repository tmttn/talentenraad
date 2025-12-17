import {render, screen, act} from '@testing-library/react';
import {CookieConsentProvider, useCookieConsent} from '../../../app/components/cookie-consent/cookie-consent-context';

// Mock localStorage
const localStorageMock = (() => {
	let store: Record<string, string> = {};
	return {
		getItem: (key: string) => store[key] ?? null,
		setItem: (key: string, value: string) => {
			store[key] = value;
		},
		removeItem: (key: string) => {
			delete store[key];
		},
		clear: () => {
			store = {};
		},
	};
})();

Object.defineProperty(window, 'localStorage', {
	value: localStorageMock,
});

// Test component to access context
function TestConsumer() {
	const {preferences, consentStatus, showBanner, acceptAll, rejectAll, savePreferences, openPreferences, closeBanner} = useCookieConsent();

	return (
		<div>
			<div data-testid="consent-status">{consentStatus}</div>
			<div data-testid="show-banner">{String(showBanner)}</div>
			<div data-testid="analytics">{String(preferences.analytics)}</div>
			<div data-testid="marketing">{String(preferences.marketing)}</div>
			<div data-testid="necessary">{String(preferences.necessary)}</div>
			<button type="button" onClick={acceptAll}>Accept All</button>
			<button type="button" onClick={rejectAll}>Reject All</button>
			<button type="button" onClick={() => savePreferences({analytics: true})}>Save Custom</button>
			<button type="button" onClick={openPreferences}>Open Preferences</button>
			<button type="button" onClick={closeBanner}>Close Banner</button>
		</div>
	);
}

describe('CookieConsentContext', () => {
	beforeEach(() => {
		localStorageMock.clear();
		jest.clearAllMocks();
	});

	describe('useCookieConsent outside provider', () => {
		it('returns default context values when used outside provider', () => {
			render(<TestConsumer />);

			expect(screen.getByTestId('consent-status')).toHaveTextContent('pending');
			expect(screen.getByTestId('show-banner')).toHaveTextContent('false');
			expect(screen.getByTestId('analytics')).toHaveTextContent('false');
			expect(screen.getByTestId('marketing')).toHaveTextContent('false');
			expect(screen.getByTestId('necessary')).toHaveTextContent('true');
		});
	});

	describe('CookieConsentProvider', () => {
		it('shows banner when no consent is stored', () => {
			render(
				<CookieConsentProvider>
					<TestConsumer />
				</CookieConsentProvider>,
			);

			expect(screen.getByTestId('consent-status')).toHaveTextContent('pending');
			expect(screen.getByTestId('show-banner')).toHaveTextContent('true');
		});

		it('loads saved preferences from localStorage', () => {
			localStorageMock.setItem('cookie-consent', 'accepted');
			localStorageMock.setItem('cookie-preferences', JSON.stringify({
				necessary: true,
				analytics: true,
				marketing: false,
			}));

			render(
				<CookieConsentProvider>
					<TestConsumer />
				</CookieConsentProvider>,
			);

			expect(screen.getByTestId('consent-status')).toHaveTextContent('accepted');
			expect(screen.getByTestId('show-banner')).toHaveTextContent('false');
			expect(screen.getByTestId('analytics')).toHaveTextContent('true');
			expect(screen.getByTestId('marketing')).toHaveTextContent('false');
		});

		it('shows banner when localStorage has invalid JSON', () => {
			localStorageMock.setItem('cookie-consent', 'accepted');
			localStorageMock.setItem('cookie-preferences', 'invalid-json');

			render(
				<CookieConsentProvider>
					<TestConsumer />
				</CookieConsentProvider>,
			);

			expect(screen.getByTestId('show-banner')).toHaveTextContent('true');
		});

		it('acceptAll sets all preferences to true', async () => {
			render(
				<CookieConsentProvider>
					<TestConsumer />
				</CookieConsentProvider>,
			);

			await act(async () => {
				screen.getByRole('button', {name: 'Accept All'}).click();
			});

			expect(screen.getByTestId('consent-status')).toHaveTextContent('accepted');
			expect(screen.getByTestId('analytics')).toHaveTextContent('true');
			expect(screen.getByTestId('marketing')).toHaveTextContent('true');
			expect(screen.getByTestId('show-banner')).toHaveTextContent('false');

			// Check localStorage
			expect(localStorageMock.getItem('cookie-consent')).toBe('accepted');
		});

		it('rejectAll sets analytics and marketing to false', async () => {
			render(
				<CookieConsentProvider>
					<TestConsumer />
				</CookieConsentProvider>,
			);

			await act(async () => {
				screen.getByRole('button', {name: 'Reject All'}).click();
			});

			expect(screen.getByTestId('consent-status')).toHaveTextContent('rejected');
			expect(screen.getByTestId('analytics')).toHaveTextContent('false');
			expect(screen.getByTestId('marketing')).toHaveTextContent('false');
			expect(screen.getByTestId('necessary')).toHaveTextContent('true');
			expect(screen.getByTestId('show-banner')).toHaveTextContent('false');
		});

		it('savePreferences sets customized status', async () => {
			render(
				<CookieConsentProvider>
					<TestConsumer />
				</CookieConsentProvider>,
			);

			await act(async () => {
				screen.getByRole('button', {name: 'Save Custom'}).click();
			});

			expect(screen.getByTestId('consent-status')).toHaveTextContent('customized');
			expect(screen.getByTestId('analytics')).toHaveTextContent('true');
			expect(screen.getByTestId('show-banner')).toHaveTextContent('false');
		});

		it('openPreferences shows banner', async () => {
			localStorageMock.setItem('cookie-consent', 'accepted');
			localStorageMock.setItem('cookie-preferences', JSON.stringify({
				necessary: true,
				analytics: true,
				marketing: true,
			}));

			render(
				<CookieConsentProvider>
					<TestConsumer />
				</CookieConsentProvider>,
			);

			expect(screen.getByTestId('show-banner')).toHaveTextContent('false');

			await act(async () => {
				screen.getByRole('button', {name: 'Open Preferences'}).click();
			});

			expect(screen.getByTestId('show-banner')).toHaveTextContent('true');
		});

		it('closeBanner hides banner when consent has been given', async () => {
			localStorageMock.setItem('cookie-consent', 'accepted');
			localStorageMock.setItem('cookie-preferences', JSON.stringify({
				necessary: true,
				analytics: true,
				marketing: true,
			}));

			render(
				<CookieConsentProvider>
					<TestConsumer />
				</CookieConsentProvider>,
			);

			// Open preferences first
			await act(async () => {
				screen.getByRole('button', {name: 'Open Preferences'}).click();
			});

			expect(screen.getByTestId('show-banner')).toHaveTextContent('true');

			// Close banner
			await act(async () => {
				screen.getByRole('button', {name: 'Close Banner'}).click();
			});

			expect(screen.getByTestId('show-banner')).toHaveTextContent('false');
		});

		it('closeBanner does nothing when consent is pending', async () => {
			render(
				<CookieConsentProvider>
					<TestConsumer />
				</CookieConsentProvider>,
			);

			expect(screen.getByTestId('consent-status')).toHaveTextContent('pending');
			expect(screen.getByTestId('show-banner')).toHaveTextContent('true');

			await act(async () => {
				screen.getByRole('button', {name: 'Close Banner'}).click();
			});

			// Banner should still be visible
			expect(screen.getByTestId('show-banner')).toHaveTextContent('true');
		});

		it('necessary is always true even in saved preferences', () => {
			localStorageMock.setItem('cookie-consent', 'customized');
			localStorageMock.setItem('cookie-preferences', JSON.stringify({
				necessary: false, // Attempting to set to false
				analytics: true,
				marketing: false,
			}));

			render(
				<CookieConsentProvider>
					<TestConsumer />
				</CookieConsentProvider>,
			);

			// Necessary should still be true
			expect(screen.getByTestId('necessary')).toHaveTextContent('true');
		});

		it('renders children correctly', () => {
			render(
				<CookieConsentProvider>
					<div data-testid="child">Child Content</div>
				</CookieConsentProvider>,
			);

			expect(screen.getByTestId('child')).toBeInTheDocument();
		});
	});
});
