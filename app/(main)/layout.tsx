import {Suspense} from 'react';
import {SiteFooterServer} from '@components/layout/site-footer-server';
import {SeasonalDecorationsServer} from '@components/seasonal-decorations-server';
import {CookieConsentProvider, CookieBanner} from '@components/cookie-consent';
import {SiteFooterSkeleton} from '@components/skeletons';

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
			<SeasonalDecorationsServer>
				{children}
				<Suspense fallback={<SiteFooterSkeleton />}>
					<SiteFooterServer />
				</Suspense>
			</SeasonalDecorationsServer>
			<CookieBanner />
		</CookieConsentProvider>
	);
}
