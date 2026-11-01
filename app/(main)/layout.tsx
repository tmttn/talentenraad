import {Suspense} from 'react';
import {Toaster} from 'sonner';
import {SiteFooterServer} from '@components/layout/site-footer-server';
import {SiteFooterSkeleton} from '@components/skeletons';
import {
  SeasonalDecorationsProvider,
  defaultSeasonalConfig,
  type SeasonalDecorationsConfig,
} from '@components/seasonal-decorations-context';
import {Snowfall, SeasonalStyles} from '@components/seasonal-decorations';
import {content} from '@lib/content';

// Reads the site config; falls back to no decorations when content is unavailable (e.g. at build time)
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
 * - Seasonal decorations context (controlled by decoraties.enabled in site.yaml)
 * - Site footer with loading skeleton
 */
export default function MainSiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SafeSeasonalDecorations>
        {children}
        <Suspense fallback={<SiteFooterSkeleton />}>
          <SiteFooterServer />
        </Suspense>
      </SafeSeasonalDecorations>
      <Toaster position='bottom-left' richColors closeButton />
    </>
  );
}
