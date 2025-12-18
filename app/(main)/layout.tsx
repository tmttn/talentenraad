import {SiteFooterServer} from '@components/layout/site-footer-server';
import {CookieConsentProvider, CookieBanner} from '@components/cookie-consent';
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
 * - Seasonal decorations context (wraps all children)
 * - Site footer with loading skeleton
 *
 * Header and announcements are rendered via PageWithAnnouncements component in each page.
 * This allows page-specific announcements to be fetched from page content.
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
				{/* No Suspense here - streaming before page validation causes 500 instead of 404 */}
				<SiteFooterServer />
			</SafeSeasonalDecorations>
			<CookieBanner />
		</CookieConsentProvider>
	);
}
