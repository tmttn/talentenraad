import {SiteFooterServer} from '@components/layout/site-footer-server';
import {SeasonalDecorationsServer} from '@components/seasonal-decorations-server';
import {CookieConsentProvider, CookieBanner} from '@components/cookie-consent';

/**
 * Main Site Layout
 *
 * Layout wrapper that provides:
 * - Cookie consent management
 * - Seasonal decorations context (wraps all children)
 * - Site footer
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
			<SeasonalDecorationsServer>
				{children}
				<SiteFooterServer />
			</SeasonalDecorationsServer>
			<CookieBanner />
		</CookieConsentProvider>
	);
}
