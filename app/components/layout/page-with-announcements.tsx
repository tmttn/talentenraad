import {Suspense} from 'react';
import {fetchOneEntry} from '@builder.io/sdk-react-nextjs';
import {AnnouncementsContainer} from '@features/marketing/announcements-container';
import {SiteHeaderServer} from '@components/layout/site-header-server';
import {SiteHeaderSkeleton} from '@components/skeletons';
import {fetchGlobalAnnouncement, extractPageAnnouncement} from '../../lib/builder-utils';

type PageWithAnnouncementsProps = {
	content: Awaited<ReturnType<typeof fetchOneEntry>> | undefined;
	children: React.ReactNode;
};

export async function PageWithAnnouncements({content, children}: PageWithAnnouncementsProps) {
	// Fetch global announcement server-side
	const globalAnnouncementData = await fetchGlobalAnnouncement();

	// Extract page-specific announcement from content
	const pageAnnouncementData = extractPageAnnouncement(content);

	// Convert to the format expected by AnnouncementsContainer
	const globalAnnouncement = globalAnnouncementData
		? {
			tekst: globalAnnouncementData.tekst,
			type: globalAnnouncementData.type,
			link: globalAnnouncementData.link,
			linkTekst: globalAnnouncementData.linkTekst,
		}
		: undefined;

	return (
		<>
			<AnnouncementsContainer
				globalAnnouncement={globalAnnouncement}
				pageAnnouncement={pageAnnouncementData}
			/>
			<Suspense fallback={<SiteHeaderSkeleton />}>
				<SiteHeaderServer />
			</Suspense>
			<main id='main-content' role='main' className='flex-grow' tabIndex={-1}>
				{children}
			</main>
		</>
	);
}
