import {notFound, permanentRedirect} from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {Calendar, Clock, MapPin} from 'lucide-react';
import {AnimatedButton, AnimatedLink, AddToCalendarButton} from '@components/ui';
import {PageWithAnnouncements} from '@components/layout/page-with-announcements';
import {ClapButton} from '@components/claps';
import {
  generateMetadata as generateSeoMetadata,
  generateEventSchema,
  generateBreadcrumbSchema,
  JsonLd,
} from '@lib/seo';
import {content} from '@lib/content';
import {parseLocalDate, todayString} from '@lib/dates';
import {clapsButton} from '@lib/flags';

function formatDate(dateString: string) {
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString('nl-BE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatShortDate(dateString: string) {
  const date = parseLocalDate(dateString);
  const day = date.getDate();
  const month = date.toLocaleDateString('nl-BE', {month: 'short'}).toUpperCase();
  return {day, month};
}

const categoryStyles: Record<string, {bg: string; text: string}> = {
  feest: {bg: 'bg-category-event-bg', text: 'text-category-event-text'},
  kalender: {bg: 'bg-category-calendar-bg', text: 'text-category-calendar-text'},
  activiteit: {bg: 'bg-category-activity-bg', text: 'text-category-activity-text'},
  nieuws: {bg: 'bg-category-news-bg', text: 'text-category-news-text'},
};

export function generateStaticParams() {
  return content.getActiviteiten().map(item => ({slug: item.slug}));
}

export async function generateMetadata({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params;
  const item = content.getActiviteit(slug);

  if (!item) {
    return {title: 'Activiteit niet gevonden'};
  }

  const description = item.samenvatting;

  return generateSeoMetadata({
    title: item.titel,
    description,
    url: `/activiteiten/${item.slug}`,
    image: item.afbeelding?.src,
    type: 'website',
  });
}

type PageProperties = {
  params: Promise<{slug: string}>;
};

export default async function ActivityDetailPage({params}: Readonly<PageProperties>) {
  const {slug} = await params;
  const item = content.getActiviteit(slug);

  if (!item) {
    notFound();
  }

  if (item.slug !== slug) {
    permanentRedirect(`/activiteiten/${item.slug}`);
  }

  const {day, month} = formatShortDate(item.datum);
  const style = categoryStyles[item.categorie] ?? categoryStyles.activiteit;

  // Check if event is in the past
  const isPast = item.datum < todayString();

  const eventSchema = generateEventSchema({
    name: item.titel,
    description: item.samenvatting,
    url: `/activiteiten/${item.slug}`,
    startDate: item.datum,
    location: item.locatie,
    image: item.afbeelding?.src,
  });
  const breadcrumbSchema = generateBreadcrumbSchema([
    {name: 'Home', url: '/'},
    {name: 'Kalender', url: '/kalender'},
    {name: item.titel, url: `/activiteiten/${item.slug}`},
  ]);

  const showClaps = await clapsButton();

  return (
    <PageWithAnnouncements content={undefined}>
      <JsonLd data={eventSchema} />
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
                <Link href='/kalender' className='hover:text-primary'>Kalender</Link>
              </li>
              <li>/</li>
              <li className='text-gray-800 font-medium truncate max-w-[200px]'>
                {item.titel}
              </li>
            </ol>
          </nav>

          {/* Header with date badge */}
          <header className='mb-8'>
            <div className='flex items-start gap-6'>
              <div className='flex-shrink-0 w-20 h-20 bg-primary rounded-modal flex flex-col items-center justify-center text-white shadow-elevated'>
                <span className='text-3xl font-bold leading-none'>{day}</span>
                <span className='text-sm uppercase'>{month}</span>
              </div>
              <div className='flex-grow'>
                <div className='flex items-center gap-3 mb-2'>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${style.bg} ${style.text}`}>
                    {item.categorie}
                  </span>
                  {isPast && (
                    <span className='px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-600'>
                      Afgelopen
                    </span>
                  )}
                </div>
                <h1 className='text-3xl md:text-4xl font-bold text-gray-800'>{item.titel}</h1>
              </div>
            </div>
          </header>

          {/* Event details card */}
          <div className='bg-gray-50 rounded-modal p-6 mb-8'>
            <h2 className='text-lg font-bold text-gray-800 mb-4'>Details</h2>
            <dl className='space-y-4'>
              <div className='flex items-start gap-3'>
                <dt className='sr-only'>Datum</dt>
                <Calendar className='h-5 w-5 text-primary mt-0.5' />
                <dd className='text-gray-700'>{formatDate(item.datum)}</dd>
              </div>

              {item.tijd && (
                <div className='flex items-start gap-3'>
                  <dt className='sr-only'>Tijd</dt>
                  <Clock className='h-5 w-5 text-primary mt-0.5' />
                  <dd className='text-gray-700'>{item.tijd}</dd>
                </div>
              )}

              {item.locatie && (
                <div className='flex items-start gap-3'>
                  <dt className='sr-only'>Locatie</dt>
                  <MapPin className='h-5 w-5 text-primary mt-0.5' />
                  <dd className='text-gray-700'>{item.locatie}</dd>
                </div>
              )}
            </dl>
            {!isPast && (
              <div className='mt-6 pt-4 border-t border-gray-200'>
                <AddToCalendarButton
                  title={item.titel}
                  date={item.datum}
                  time={item.tijd}
                  location={item.locatie}
                  description={item.samenvatting}
                  url={`https://www.talentenraad.be/activiteiten/${item.slug}`}
                  id={item.slug}
                />
              </div>
            )}
          </div>

          {/* Image */}
          {item.afbeelding && (
            <div className='mb-8 rounded-modal overflow-hidden shadow-elevated'>
              <Image
                src={item.afbeelding.src}
                width={item.afbeelding.width}
                height={item.afbeelding.height}
                alt={item.titel}
                className='w-full h-auto'
              />
            </div>
          )}

          {/* Content */}
          {item.html.trim() && (
            <div className='prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-600'>
              <h2>Over deze activiteit</h2>
              <div dangerouslySetInnerHTML={{__html: item.html}} />
            </div>
          )}

          {/* Clap button */}
          {showClaps && (
            <div className='mt-8 flex items-center justify-center'>
              <ClapButton contentType='activiteit' contentId={item.slug} />
            </div>
          )}

          {/* CTA for future events */}
          {!isPast && (
            <div className='mt-8 p-6 bg-gradient-to-r from-primary/10 to-brand-primary-50 rounded-modal'>
              <h3 className='font-bold text-gray-800 mb-2'>Vragen over deze activiteit?</h3>
              <p className='text-gray-600 mb-4'>
                Neem contact op met de Talentenraad voor meer informatie.
              </p>
              <AnimatedButton href='/contact?onderwerp=activiteit'>
                Contact opnemen
              </AnimatedButton>
            </div>
          )}

          {/* Back link */}
          <div className='mt-12 pt-8 border-t border-gray-200'>
            <AnimatedLink href='/kalender' arrowDirection='left'>
              Terug naar kalender
            </AnimatedLink>
          </div>
        </div>
      </article>
    </PageWithAnnouncements>
  );
}
