import {notFound, permanentRedirect} from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {Calendar} from 'lucide-react';
import {AnimatedLink} from '@components/ui';
import {PageWithAnnouncements} from '@components/layout/page-with-announcements';
import {
  generateMetadata as generateSeoMetadata,
  generateArticleSchema,
  generateBreadcrumbSchema,
  JsonLd,
} from '@lib/seo';
import {content} from '@lib/content';
import {parseLocalDate} from '@lib/dates';

const proseClassName = [
  'prose prose-lg max-w-none prose-headings:text-gray-800 prose-headings:font-bold',
  'prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-p:text-gray-600 prose-p:mb-4',
  'prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4 prose-li:mb-1',
  'prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-800',
].join(' ');

function formatDate(dateString: string) {
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString('nl-BE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
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
      <article className='py-12 px-6'>
        <div className='max-w-3xl mx-auto'>
          {/* Breadcrumb */}
          <nav className='mb-8' aria-label='Breadcrumb'>
            <ol className='flex items-center gap-2 text-sm text-gray-500'>
              <li>
                <Link href='/' className='hover:text-primary'>Home</Link>
              </li>
              <li>/</li>
              <li>
                <Link href='/nieuws' className='hover:text-primary'>Nieuws</Link>
              </li>
              <li>/</li>
              <li className='text-gray-800 font-medium truncate max-w-[200px]'>
                {item.titel}
              </li>
            </ol>
          </nav>

          {/* Header */}
          <header className='mb-8'>
            <time className='text-sm text-primary font-semibold flex items-center gap-2 mb-4'>
              <Calendar className='h-4 w-4' />
              {formatDate(item.datum)}
            </time>
            <h1 className='text-3xl md:text-4xl font-bold text-gray-800 mb-4'>{item.titel}</h1>
            <p className='text-xl text-gray-600 leading-relaxed'>{item.samenvatting}</p>
          </header>

          {/* Featured Image */}
          {item.afbeelding && (
            <div className='relative aspect-video rounded-modal overflow-hidden mb-8'>
              <Image
                src={item.afbeelding.src}
                alt={item.titel}
                fill
                className='object-cover'
                priority
              />
            </div>
          )}

          {/* Content */}
          {item.html.trim() && (
            <div className={proseClassName} dangerouslySetInnerHTML={{__html: item.html}} />
          )}

          {/* Back link */}
          <div className='mt-12 pt-8 border-t border-gray-200'>
            <AnimatedLink href='/nieuws' arrowDirection='left'>
              Terug naar nieuws
            </AnimatedLink>
          </div>
        </div>
      </article>
    </PageWithAnnouncements>
  );
}
