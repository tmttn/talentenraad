'use client';

import {createContext, useContext, useState, useEffect, useCallback, type ReactNode} from 'react';

export type CookiePreferences = {
	necessary: boolean; // Always true, cannot be disabled
	analytics: boolean;
	marketing: boolean;
};

export type ConsentStatus = 'pending' | 'accepted' | 'rejected' | 'customized';

type CookieConsentContextType = {
	preferences: CookiePreferences;
	consentStatus: ConsentStatus;
	showBanner: boolean;
	acceptAll: () => void;
	rejectAll: () => void;
	savePreferences: (preferences: Partial<CookiePreferences>) => void;
	openPreferences: () => void;
	closeBanner: () => void;
};

const COOKIE_CONSENT_KEY = 'cookie-consent';
const COOKIE_PREFERENCES_KEY = 'cookie-preferences';

const defaultPreferences: CookiePreferences = {
	necessary: true,
	analytics: false,
	marketing: false,
};

const CookieConsentContext = createContext<CookieConsentContextType | null>(null);

export function CookieConsentProvider({children}: Readonly<{children: ReactNode}>) {
	const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
	const [consentStatus, setConsentStatus] = useState<ConsentStatus>('pending');
	const [showBanner, setShowBanner] = useState(false);
	const [isInitialized, setIsInitialized] = useState(false);

	// Load saved preferences on mount
	useEffect(() => {
		const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
		const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);

		if (savedConsent && savedPreferences) {
			try {
				const parsed = JSON.parse(savedPreferences) as CookiePreferences;
				setPreferences({...parsed, necessary: true});
				setConsentStatus(savedConsent as ConsentStatus);
				setShowBanner(false);
			} catch {
				setShowBanner(true);
			}
		} else {
			setShowBanner(true);
		}

		setIsInitialized(true);
	}, []);

	const saveToStorage = useCallback((status: ConsentStatus, prefs: CookiePreferences) => {
		localStorage.setItem(COOKIE_CONSENT_KEY, status);
		localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
	}, []);

	const acceptAll = useCallback(() => {
		const allAccepted: CookiePreferences = {
			necessary: true,
			analytics: true,
			marketing: true,
		};
		setPreferences(allAccepted);
		setConsentStatus('accepted');
		setShowBanner(false);
		saveToStorage('accepted', allAccepted);
	}, [saveToStorage]);

	const rejectAll = useCallback(() => {
		const onlyNecessary: CookiePreferences = {
			necessary: true,
			analytics: false,
			marketing: false,
		};
		setPreferences(onlyNecessary);
		setConsentStatus('rejected');
		setShowBanner(false);
		saveToStorage('rejected', onlyNecessary);
	}, [saveToStorage]);

	const savePreferences = useCallback((newPreferences: Partial<CookiePreferences>) => {
		const updated: CookiePreferences = {
			...preferences,
			...newPreferences,
			necessary: true, // Always true
		};
		setPreferences(updated);
		setConsentStatus('customized');
		setShowBanner(false);
		saveToStorage('customized', updated);
	}, [preferences, saveToStorage]);

	const openPreferences = useCallback(() => {
		setShowBanner(true);
	}, []);

	const closeBanner = useCallback(() => {
		// Only allow closing if consent has been given
		if (consentStatus !== 'pending') {
			setShowBanner(false);
		}
	}, [consentStatus]);

	// Don't render anything until initialized to prevent hydration mismatch
	if (!isInitialized) {
		return <>{children}</>;
	}

	return (
		<CookieConsentContext.Provider
			value={{
				preferences,
				consentStatus,
				showBanner,
				acceptAll,
				rejectAll,
				savePreferences,
				openPreferences,
				closeBanner,
			}}
		>
			{children}
		</CookieConsentContext.Provider>
	);
}

// Default context value for when used outside provider (e.g., during SSR/static generation)
const defaultContextValue: CookieConsentContextType = {
	preferences: defaultPreferences,
	consentStatus: 'pending',
	showBanner: false,
	acceptAll: () => {},
	rejectAll: () => {},
	savePreferences: () => {},
	openPreferences: () => {},
	closeBanner: () => {},
};

export function useCookieConsent() {
	const context = useContext(CookieConsentContext);
	// Return default context for SSR/static generation (when provider isn't available)
	return context ?? defaultContextValue;
}
