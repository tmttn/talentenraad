import {notFound, permanentRedirect} from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {ArrowLeft} from 'lucide-react';
import {Card} from '@components/ui';
import {PageWithAnnouncements} from '@components/layout/page-with-announcements';
import {formatLongDate} from '@features/activities/activity-card';
import {ArticleBody} from '@features/news/article-body';
import {
  generateMetadata as generateSeoMetadata,
  generateArticleSchema,
  generateBreadcrumbSchema,
  JsonLd,
} from '@lib/seo';
import {content} from '@lib/content';
import {parseLocalDate} from '@lib/dates';

/** "Maandag 1 september 2025" */
function formatFullDate(datum: string) {
  const text = parseLocalDate(datum).toLocaleDateString('nl-BE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function generateStaticParams() {
  return content.getNieuws().map(item => ({slug: item.slug}));
}

export async function generateMetadata({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params;
  const item = content.getNieuwsItem(slug);

  if (!item) {
    return {title: 'Nieuws niet gevonden'};
  }

  return generateSeoMetadata({
    title: item.titel,
    description: item.samenvatting,
    url: `/nieuws/${item.slug}`,
    image: item.afbeelding?.src,
    type: 'article',
    publishedTime: item.datum,
  });
}

type PageProperties = {
  params: Promise<{slug: string}>;
};

export default async function NewsDetailPage({params}: Readonly<PageProperties>) {
  const {slug} = await params;
  const item = content.getNieuwsItem(slug);

  if (!item) {
    notFound();
  }

  if (item.slug !== slug) {
    permanentRedirect(`/nieuws/${item.slug}`);
  }

  const meer = content.getNieuws()
    .filter(nieuws => nieuws.slug !== item.slug)
    .sort((a, b) => b.datum.localeCompare(a.datum))
    .slice(0, 3);

  const articleSchema = generateArticleSchema({
    title: item.titel,
    description: item.samenvatting,
    url: `/nieuws/${item.slug}`,
    image: item.afbeelding?.src,
    datePublished: item.datum,
  });
  const breadcrumbSchema = generateBreadcrumbSchema([
    {name: 'Home', url: '/'},
    {name: 'Nieuws', url: '/nieuws'},
    {name: item.titel, url: `/nieuws/${item.slug}`},
  ]);

  return (
    <PageWithAnnouncements>
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      <article className='px-5 pt-[clamp(32px,4vw,48px)] pb-[clamp(64px,7vw,96px)]'>
        <div className='max-w-[780px] mx-auto flex flex-col gap-[26px]'>
          <Link href='/nieuws' className='self-start inline-flex items-center gap-2 font-bold text-primary-text underline-offset-4 hover:underline'>
            <ArrowLeft className='h-[18px] w-[18px]' strokeWidth={2.5} aria-hidden='true' />
            Terug naar nieuws
          </Link>

          <header className='flex flex-col gap-4'>
            <time dateTime={item.datum} className='text-[15px] font-bold text-secondary-hover'>{formatFullDate(item.datum)}</time>
            <h1 className='font-display font-extrabold text-black text-[clamp(38px,4.6vw,60px)] leading-none tracking-[-0.02em]'>{item.titel}</h1>
            <p className='text-gray-700 text-[clamp(18px,1.5vw,21px)] leading-normal'>{item.samenvatting}</p>
          </header>

          {item.afbeelding && (
            <div className='rounded-tile contour-sm overflow-hidden'>
              <Image
                src={item.afbeelding.src}
                width={item.afbeelding.width}
                height={item.afbeelding.height}
                alt=''
                sizes='(min-width: 820px) 780px, 100vw'
                className='w-full h-auto'
                priority
              />
            </div>
          )}

          {item.segmenten.length > 0 && <ArticleBody segmenten={item.segmenten} />}
        </div>
      </article>

      {meer.length > 0 && (
        <section className='bg-gray-50 border-t-(length:--contour-width-sm) border-ink px-5 py-[clamp(48px,5vw,72px)]'>
          <div className='max-w-[780px] mx-auto flex flex-col gap-5'>
            <h2 className='font-display font-extrabold text-black text-[clamp(28px,2.8vw,36px)] tracking-[-0.02em]'>Meer nieuws</h2>
            {meer.map(nieuws => (
              <Card key={nieuws.slug} variant='contour' padding='none' hover href={`/nieuws/${nieuws.slug}`} className='flex flex-col gap-1.5 px-6 py-[22px]'>
                <span className='text-sm font-bold text-secondary-hover'>{formatLongDate(nieuws.datum)}</span>
                <span className='font-display font-bold text-[22px] leading-tight text-black'>{nieuws.titel}</span>
              </Card>
            ))}
          </div>
        </section>
      )}
    </PageWithAnnouncements>
  );
}
