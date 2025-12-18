import {SiteFooterServer} from '@components/layout/site-footer-server';
import {CookieConsentProvider, CookieBanner} from '@components/cookie-consent';
import {
	SeasonalDecorationsProvider,
	defaultSeasonalConfig,
} from '@components/seasonal-decorations-context';
import {Snowfall, SeasonalStyles} from '@components/seasonal-decorations';

/**
 * Main Site Layout
 *
 * Layout wrapper that provides:
 * - Cookie consent management
 * - Seasonal decorations context (with default config to avoid async wrapper)
 * - Site footer
 *
 * Header and announcements are rendered via PageWithAnnouncements component in each page.
 * This allows page-specific announcements to be fetched from page content.
 *
 * Note: Using default seasonal config to avoid async wrapper in layout.
 * Async wrappers around {children} can interfere with notFound() error propagation,
 * causing 500 errors instead of 404 on Vercel.
 */
export default function MainSiteLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<CookieConsentProvider>
			<SeasonalDecorationsProvider config={defaultSeasonalConfig}>
				<SeasonalStyles />
				<Snowfall />
				{children}
				<SiteFooterServer />
			</SeasonalDecorationsProvider>
			<CookieBanner />
		</CookieConsentProvider>
	);
}
