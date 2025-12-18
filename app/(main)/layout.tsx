import {Suspense} from 'react';
import {SiteFooterServer} from '@components/layout/site-footer-server';
import {CookieConsentProvider, CookieBanner} from '@components/cookie-consent';
import {SiteFooterSkeleton} from '@components/skeletons';
import {
	SeasonalDecorationsProvider,
	defaultSeasonalConfig,
	type SeasonalDecorationsConfig,
} from '@components/seasonal-decorations-context';
import {Snowfall, SeasonalStyles} from '@components/seasonal-decorations';

// Dynamically import the server component to prevent build-time errors
async function SafeSeasonalDecorations({children}: {children: React.ReactNode}) {
	let config: SeasonalDecorationsConfig = defaultSeasonalConfig;

	try {
		const {getSeasonalDecorationsConfig} = await import('@components/seasonal-decorations-server');
		const fetchedConfig: SeasonalDecorationsConfig = await getSeasonalDecorationsConfig();
		config = fetchedConfig;
	} catch {
		// Silently fall back to default config if database is unavailable
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
 * - Seasonal decorations context (with async config fetching from database)
 * - Site footer with loading skeleton
 *
 * Header and announcements are rendered via PageWithAnnouncements component in each page.
 * This allows page-specific announcements to be fetched from page content.
 *
 * Note: 404 detection is handled in proxy.ts before page rendering, so async
 * wrappers here don't interfere with 404 status codes.
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
		</CookieConsentProvider>
	);
}
