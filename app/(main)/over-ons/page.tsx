import type {Metadata} from 'next';
import {PageWithAnnouncements} from '@components/layout/page-with-announcements';
import {PageCtaBanner, PageHero, SectionHeading} from '@components/layout/page-parts';
import {InfoCard} from '@features/info/info-card';
import {TeamGrid} from '@features/team/team-grid';
import {content} from '@lib/content';
import {generateMetadata as generateSeoMetadata} from '@lib/seo';

export function generateMetadata(): Metadata {
  const pagina = content.getPagina('over-ons');
  return generateSeoMetadata({title: pagina.titel, description: pagina.beschrijving, url: '/over-ons'});
}

export default function Page() {
  const pagina = content.getPagina('over-ons');
  const team = content.getTeam();

  return (
    <PageWithAnnouncements>
      <PageHero size='medium' titel={pagina.hero.titel} ondertitel={pagina.hero.ondertitel} />
      <InfoCard icon='heart' variant='default' title={pagina.infokaart.titel} html={pagina.html} />
      <div className='pt-12 pb-6'>
        <SectionHeading titel={pagina.bestuur.titel} tekst={pagina.bestuur.tekst} />
        <TeamGrid leden={team.filter(lid => lid.categorie === 'bestuur')} columns={3} showDescription />
      </div>
      <div className='pt-6 pb-12'>
        <SectionHeading titel={pagina.leden.titel} tekst={pagina.leden.tekst} />
        <TeamGrid leden={team.filter(lid => lid.categorie === 'lid')} columns={4} showDescription={false} />
      </div>
      <PageCtaBanner cta={pagina.cta} />
    </PageWithAnnouncements>
  );
}
