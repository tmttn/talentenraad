import {SiteHeaderServer} from '@components/layout/site-header-server';
import {SiteFooterServer} from '@components/layout/site-footer-server';
import {AnnouncementBanner} from '@features/marketing/announcement-banner';

/**
 * Main Site Layout
 *
 * Includes header, footer, and announcement banner.
 * Header and footer content is managed via Builder.io.
 * CTA sections should be added per-page via Builder.io content.
 */
export default function MainSiteLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<AnnouncementBanner />
			<SiteHeaderServer />
			<main id='main-content' role='main' className='flex-grow' tabIndex={-1}>
				{children}
			</main>
			<SiteFooterServer />
		</>
	);
}
