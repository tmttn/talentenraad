import {Suspense} from 'react';
import {Toaster} from 'sonner';
import {SiteFooterServer} from '@components/layout/site-footer-server';
import {CookieConsentProvider, CookieBanner} from '@components/cookie-consent';
import {SiteFooterSkeleton} from '@components/skeletons';
import {
  SeasonalDecorationsProvider,
  defaultSeasonalConfig,
  type SeasonalDecorationsConfig,
} from '@components/seasonal-decorations-context';
import {Snowfall, SeasonalStyles} from '@components/seasonal-decorations';
import {ConditionalFeedbackButton} from '@components/feedback';
import {seasonalDecorations, cookieBanner, getAllFlags} from '@lib/flags';
import {FlagsProvider} from '@lib/flags-client';

// Dynamically import the server component to prevent build-time errors
async function SafeSeasonalDecorations({children}: {children: React.ReactNode}) {
  // Check feature flag first
  const isEnabled = await seasonalDecorations();
  if (!isEnabled) {
    return <>{children}</>;
  }

  let config: SeasonalDecorationsConfig = defaultSeasonalConfig;

  try {
    const {getSeasonalDecorationsConfig} = await import('@components/seasonal-decorations-server');
    const fetchedConfig: SeasonalDecorationsConfig = await getSeasonalDecorationsConfig();
    config = fetchedConfig;
  } catch {
    // Silently fall back to default config if content is unavailable
  }

  return (
    <SeasonalDecorationsProvider config={config}>
      <SeasonalStyles />
      <Snowfall />
      {children}
    </SeasonalDecorationsProvider>
  );
}

// Conditionally render cookie banner based on feature flag
async function ConditionalCookieBanner() {
  const isEnabled = await cookieBanner();
  if (!isEnabled) {
    return null;
  }

  return <CookieBanner />;
}

/**
 * Main Site Layout
 *
 * Layout wrapper that provides:
 * - Cookie consent management (controlled by cookieBanner flag)
 * - Seasonal decorations context (controlled by seasonalDecorations flag)
 * - Site footer with loading skeleton
 */
export default async function MainSiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get all flags for client-side components
  const flags = await getAllFlags();

  return (
    <FlagsProvider flags={flags}>
      <CookieConsentProvider>
        <SafeSeasonalDecorations>
          {children}
          <Suspense fallback={<SiteFooterSkeleton />}>
            <SiteFooterServer />
          </Suspense>
        </SafeSeasonalDecorations>
        <ConditionalCookieBanner />
        <ConditionalFeedbackButton />
        <Toaster position='bottom-left' richColors closeButton />
      </CookieConsentProvider>
    </FlagsProvider>
  );
}
