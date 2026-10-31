'use client';

import {
  createContext, useContext, useState, useEffect, useCallback, type ReactNode,
} from 'react';

type CookieConsentContextType = {
  showBanner: boolean;
  dismiss: () => void;
  /** Shows the notice again (footer link). */
  openPreferences: () => void;
};

// Same key as before, so returning visitors who already answered are not shown the notice again.
// Any stored value (including old 'accepted' / 'rejected' / 'customized') counts as seen.
const COOKIE_CONSENT_KEY = 'cookie-consent';

const CookieConsentContext = createContext<CookieConsentContextType | null>(null);

function hasSeenNotice(): boolean {
  try {
    return Boolean(localStorage.getItem(COOKIE_CONSENT_KEY));
  } catch {
    return false;
  }
}

export function CookieConsentProvider({children}: Readonly<{children: ReactNode}>) {
  const [showBanner, setShowBanner] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setShowBanner(!hasSeenNotice());
    setIsInitialized(true);
  }, []);

  const dismiss = useCallback(() => {
    setShowBanner(false);
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'acknowledged');
    } catch {
      // Storage unavailable: the notice simply shows again next visit.
    }
  }, []);

  const openPreferences = useCallback(() => {
    setShowBanner(true);
  }, []);

  // Don't render anything until initialized to prevent hydration mismatch
  if (!isInitialized) {
    return <>{children}</>;
  }

  return (
    <CookieConsentContext.Provider value={{showBanner, dismiss, openPreferences}}>
      {children}
    </CookieConsentContext.Provider>
  );
}

// Default context value for when used outside provider (e.g., during SSR/static generation)
const defaultContextValue: CookieConsentContextType = {
  showBanner: false,
  dismiss() {},
  openPreferences() {},
};

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  return context ?? defaultContextValue;
}
