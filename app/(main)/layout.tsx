import {SiteFooterServer} from '@components/layout/site-footer-server';

/**
 * Main Site Layout
 *
 * Layout wrapper that provides the footer.
 * Header and announcements are rendered via PageWithAnnouncements component in each page.
 * This allows page-specific announcements to be fetched from page content.
 */
export default function MainSiteLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			{children}
			<SiteFooterServer />
		</>
	);
}
