import type {Metadata} from 'next';
import {PageWithAnnouncements} from '@components/layout/page-with-announcements';
import {PageCtaBanner, PageHero, SectionHeading} from '@components/layout/page-parts';
import {ActivitiesArchive} from '@features/activities/activities-archive';
import {ActivitiesList} from '@features/activities/activities-list';
import {content} from '@lib/content';
import {todayString} from '@lib/dates';
import {generateMetadata as generateSeoMetadata} from '@lib/seo';

export function generateMetadata(): Metadata {
  const pagina = content.getPagina('kalender');
  return generateSeoMetadata({title: pagina.titel, description: pagina.beschrijving, url: '/kalender'});
}

export default function Page() {
  const pagina = content.getPagina('kalender');
  const activiteiten = content.getActiviteiten();
  const today = todayString();

  return (
    <PageWithAnnouncements>
      <PageHero size='small' titel={pagina.hero.titel} ondertitel={pagina.hero.ondertitel} />
      <div className='py-12'>
        <SectionHeading titel={pagina.lijst.titel} tekst={pagina.lijst.ondertitel} />
        <ActivitiesList
          today={today}
          activiteiten={activiteiten}
          limit={20}
          showViewAll={false}
          showLocation
          showDescription
        />
      </div>
      <ActivitiesArchive
        today={today}
        activiteiten={activiteiten}
        title={pagina.archief.titel}
        subtitle={pagina.archief.ondertitel}
        limit={20}
        showYear
      />
      <PageCtaBanner cta={pagina.cta} />
    </PageWithAnnouncements>
  );
}
