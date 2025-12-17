import {SiteFooterServer} from '@components/layout/site-footer-server';
import {SeasonalDecorationsServer} from '@components/seasonal-decorations-server';

/**
 * Main Site Layout
 *
 * Layout wrapper that provides:
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
		<SeasonalDecorationsServer>
			{children}
			<SiteFooterServer />
		</SeasonalDecorationsServer>
	);
}
