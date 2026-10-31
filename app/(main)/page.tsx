import type {Metadata} from 'next';
import {PageWithAnnouncements} from '@components/layout/page-with-announcements';
import {PageHero, PageUnifiedCta, SectionHeading} from '@components/layout/page-parts';
import {HomepageDashboard} from '@features/dashboard/homepage-dashboard';
import {Faq} from '@features/faq/faq';
import {InfoCard} from '@features/info/info-card';
import {content} from '@lib/content';
import {generateMetadata as generateSeoMetadata} from '@lib/seo';

export function generateMetadata(): Metadata {
  const pagina = content.getPagina('home');
  return generateSeoMetadata({title: pagina.titel, description: pagina.beschrijving, url: '/'});
}

export default function Page() {
  const pagina = content.getPagina('home');

  return (
    <PageWithAnnouncements>
      <PageHero size='compact' titel={pagina.hero.titel} ondertitel={pagina.hero.ondertitel} />
      <div className='py-12 bg-gray-50'>
        <SectionHeading titel={pagina.dashboardTitel} />
        <HomepageDashboard activiteiten={content.getActiviteiten()} nieuws={content.getNieuws()} />
      </div>
      <InfoCard icon='heart' variant='default' title={pagina.infokaart.titel} html={pagina.html} />
      <div className='py-12'>
        <SectionHeading titel={pagina.faqTitel} />
        <Faq items={content.getFaq()} />
      </div>
      <PageUnifiedCta variant='compact' cta={pagina.cta} />
    </PageWithAnnouncements>
  );
}
