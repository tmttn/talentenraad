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
import {content} from '@lib/content';

// Dynamically import the server component to prevent build-time errors
async function SafeSeasonalDecorations({children}: {children: React.ReactNode}) {
  let config: SeasonalDecorationsConfig = defaultSeasonalConfig;

  try {
    const site = await content.getSite();
    config = site.decoraties;
  } catch {
    // Silently fall back to default config (disabled) if content is unavailable
  }

  if (!config.enabled) {
    return <>{children}</>;
  }

  return (
    <SeasonalDecorationsProvider config={config}>
      <SeasonalStyles />
      <Snowfall />
      {children}
    </SeasonalDecorationsProvider>
  );
}

/**
 * Main Site Layout
 *
 * Layout wrapper that provides:
 * - Cookie consent management
 * - Seasonal decorations context (controlled by decoraties.enabled in site.yaml)
 * - Site footer with loading skeleton
 */
export default function MainSiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <CookieConsentProvider>
        <SafeSeasonalDecorations>
          {children}
          <Suspense fallback={<SiteFooterSkeleton />}>
            <SiteFooterServer />
          </Suspense>
        </SafeSeasonalDecorations>
        <CookieBanner />
        <ConditionalFeedbackButton />
        <Toaster position='bottom-left' richColors closeButton />
      </CookieConsentProvider>
  );
}
