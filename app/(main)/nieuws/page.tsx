import type {Metadata} from 'next';
import {PageWithAnnouncements} from '@components/layout/page-with-announcements';
import {PageCtaBanner, PageHero} from '@components/layout/page-parts';
import {NewsList} from '@features/news/news-list';
import {content} from '@lib/content';
import {generateMetadata as generateSeoMetadata} from '@lib/seo';

export function generateMetadata(): Metadata {
  const pagina = content.getPagina('nieuws');
  return generateSeoMetadata({title: pagina.titel, description: pagina.beschrijving, url: '/nieuws'});
}

export default function Page() {
  const pagina = content.getPagina('nieuws');

  return (
    <PageWithAnnouncements>
      <PageHero size='small' titel={pagina.hero.titel} ondertitel={pagina.hero.ondertitel} />
      <NewsList nieuws={content.getNieuws()} limit={10} />
      <PageCtaBanner cta={pagina.cta} />
    </PageWithAnnouncements>
  );
}
