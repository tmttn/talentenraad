import type {Metadata} from 'next';
import {PageWithAnnouncements} from '@components/layout/page-with-announcements';
import {HomeHero} from '@features/home/home-hero';
import {HomeActivities} from '@features/home/home-activities';
import {HomeNewsAndTeam, HomePhotoWall, HomeQuote} from '@features/home/home-sections';
import {ContourCta} from '@components/layout/contour-parts';
import {content} from '@lib/content';
import {todayString} from '@lib/dates';
import {generateMetadata as generateSeoMetadata} from '@lib/seo';

export function generateMetadata(): Metadata {
  const pagina = content.getPagina('home');
  return generateSeoMetadata({title: pagina.titel, description: pagina.beschrijving, url: '/'});
}

export default function Page() {
  const pagina = content.getPagina('home');
  const today = todayString();
  const activiteiten = content.getActiviteiten();
  const komend = activiteiten
    .filter(activiteit => activiteit.datum >= today)
    .sort((a, b) => a.datum.localeCompare(b.datum));
  const voorbij = activiteiten
    .filter(activiteit => activiteit.datum < today)
    .sort((a, b) => b.datum.localeCompare(a.datum));
  const [laatsteNieuws] = [...content.getNieuws()].sort((a, b) => b.datum.localeCompare(a.datum));
  const bestuur = content.getTeam()
    .filter(lid => lid.categorie === 'bestuur')
    .sort((a, b) => a.volgorde - b.volgorde)
    .slice(0, 3);

  return (
    <PageWithAnnouncements>
      <HomeHero titel={pagina.hero.titel} ondertitel={pagina.hero.ondertitel} knoppen={pagina.hero.knoppen} />
      <HomeActivities activiteiten={komend} />
      <HomeQuote citaat={pagina.citaat} bijschriftHtml={pagina.html} />
      <HomeNewsAndTeam nieuws={laatsteNieuws} team={bestuur} />
      <HomePhotoWall activiteiten={voorbij} />
      <ContourCta cta={pagina.cta} />
    </PageWithAnnouncements>
  );
}
