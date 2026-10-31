import {Suspense} from 'react';
import {AnnouncementsContainer} from '@features/marketing/announcements-container';
import {SiteHeaderServer} from '@components/layout/site-header-server';
import {SiteHeaderSkeleton} from '@components/skeletons';
import {content as siteContent} from '@lib/content';

type PageWithAnnouncementsProps = {
  children: React.ReactNode;
};

export async function PageWithAnnouncements({children}: PageWithAnnouncementsProps) {
  const {aankondiging} = await siteContent.getSite();

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
