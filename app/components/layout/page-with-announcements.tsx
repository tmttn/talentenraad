import {Suspense} from 'react';
import {type fetchOneEntry} from '@builder.io/sdk-react-nextjs';
import {AnnouncementsContainer} from '@features/marketing/announcements-container';
import {SiteHeaderServer} from '@components/layout/site-header-server';
import {SiteHeaderSkeleton} from '@components/skeletons';
import {extractPageAnnouncement} from '@lib/builder-utils';
import {content as siteContent} from '@lib/content';

type PageWithAnnouncementsProps = {
  // Builder page content; goes away once the pages are rendered from content/ (later task).
  content: Awaited<ReturnType<typeof fetchOneEntry>> | undefined;
  children: React.ReactNode;
};

export async function PageWithAnnouncements({content, children}: PageWithAnnouncementsProps) {
  const {aankondiging} = await siteContent.getSite();

  // Extract page-specific announcement from content
  const pageAnnouncementData = extractPageAnnouncement(content);

  const globalAnnouncement = aankondiging.actief
    ? {
      tekst: aankondiging.tekst,
      type: aankondiging.type,
      link: aankondiging.link,
      linkTekst: aankondiging.linkTekst,
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
