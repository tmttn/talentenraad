import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {PageWithAnnouncements} from '@components/layout/page-with-announcements';
import {LogoStripe} from '@components/layout/contour-parts';
import {articleProse} from '@features/news/article-body';
import {content} from '@lib/content';
import {generateMetadata as generateSeoMetadata, generateBreadcrumbSchema, JsonLd} from '@lib/seo';

type PageProperties = {
  params: Promise<{tekst: string}>;
};

export function generateStaticParams() {
  return content.listTeksten().map(tekst => ({tekst: tekst.slug}));
}

export async function generateMetadata({params}: Readonly<PageProperties>): Promise<Metadata> {
  const {tekst: slug} = await params;
  const tekst = content.getTekst(slug);

  if (!tekst) {
    return {title: 'Pagina niet gevonden', robots: {index: false, follow: false}};
  }

  return generateSeoMetadata({title: tekst.titel, description: tekst.beschrijving, url: `/${tekst.slug}`});
}

/** Text pages (privacy, cookies, terms) in the reading column of a news article. */
export default async function Page({params}: Readonly<PageProperties>) {
  const {tekst: slug} = await params;
  const tekst = content.getTekst(slug);

  if (!tekst) {
    notFound();
  }

  const breadcrumbSchema = generateBreadcrumbSchema([
    {name: 'Home', url: '/'},
    {name: tekst.titel, url: `/${tekst.slug}`},
  ]);

  return (
    <PageWithAnnouncements>
      <JsonLd data={breadcrumbSchema} />
      <article className='px-5 pt-[clamp(48px,6vw,80px)] pb-[clamp(64px,7vw,96px)]'>
        <div className='max-w-[780px] mx-auto flex flex-col gap-[26px]'>
          <header className='flex flex-col gap-4'>
            <LogoStripe />
            <h1 className='font-display font-extrabold text-black text-[clamp(38px,4.6vw,60px)] leading-none tracking-[-0.02em] hyphens-auto break-words'>{tekst.titel}</h1>
          </header>
          <div className={articleProse} dangerouslySetInnerHTML={{__html: tekst.html}} />
        </div>
      </article>
    </PageWithAnnouncements>
  );
}
