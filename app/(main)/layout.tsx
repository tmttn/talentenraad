// eslint-disable-next-line import-x/extensions
import {SiteHeader} from '../components/site-header';
// eslint-disable-next-line import-x/extensions
import {SiteFooter} from '../components/site-footer';
// eslint-disable-next-line import-x/extensions
import {AnnouncementBanner} from '../components/announcement-banner';
// eslint-disable-next-line import-x/extensions
import {FooterCTASection} from '../components/builder-section';

/**
 * Main Site Layout
 *
 * Includes header, footer, announcement banner, and CTA section.
 * Used for all public-facing pages.
 */
export default function MainSiteLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<AnnouncementBanner />
			<SiteHeader />
			<main id='main-content' role='main' className='flex-grow' tabIndex={-1}>
				{children}
			</main>
			<FooterCTASection />
			<SiteFooter />
		</>
	);
}
