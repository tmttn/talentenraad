import {notFound, permanentRedirect} from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {ArrowLeft, MapPin} from 'lucide-react';
import {
  AddToCalendarButton, CategoryBadge, DateBadge, SpeechBubble,
} from '@components/ui';
import {PageWithAnnouncements} from '@components/layout/page-with-announcements';
import {contourTitle} from '@components/layout/contour-parts';
import {
  ActivityCard, categoryLabels, formatDayDate,
} from '@features/activities/activity-card';
import {
  generateMetadata as generateSeoMetadata,
  generateEventSchema,
  generateBreadcrumbSchema,
  JsonLd,
  siteConfig,
} from '@lib/seo';
import {content} from '@lib/content';
import {todayString} from '@lib/dates';

export function generateStaticParams() {
  return content.getActiviteiten().map(item => ({slug: item.slug}));
}

export async function generateMetadata({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params;
  const item = content.getActiviteit(slug);

  if (!item) {
    return {title: 'Activiteit niet gevonden'};
  }

  return generateSeoMetadata({
    title: item.titel,
    description: item.samenvatting,
    url: `/activiteiten/${item.slug}`,
    image: item.afbeelding?.src,
    type: 'website',
  });
}

/** Route search on Google Maps; "Beverst" narrows a bare venue name like "Beversheem". */
const routeUrl = (locatie: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${locatie}, Beverst`)}`;

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

  const today = todayString();
  const isPast = item.datum < today;
  const href = `/activiteiten/${item.slug}`;
  const andere = content.getActiviteiten()
    .filter(activiteit => activiteit.datum >= today && activiteit.slug !== item.slug)
    .sort((a, b) => a.datum.localeCompare(b.datum))
    .slice(0, 3);

  const eventSchema = generateEventSchema({
    name: item.titel,
    description: item.samenvatting,
    url: href,
    startDate: item.datum,
    location: item.locatie,
    image: item.afbeelding?.src,
  });
  const breadcrumbSchema = generateBreadcrumbSchema([
    {name: 'Home', url: '/'},
    {name: 'Kalender', url: '/kalender'},
    {name: item.titel, url: href},
  ]);

  return (
    <PageWithAnnouncements>
      <JsonLd data={eventSchema} />
      <JsonLd data={breadcrumbSchema} />
      <section className='px-5 pt-[clamp(32px,4vw,48px)] pb-[clamp(64px,7vw,96px)]'>
        <div className='max-w-[1240px] mx-auto flex flex-col gap-7'>
          <Link href='/kalender' className='self-start inline-flex items-center gap-2 font-bold text-primary-text underline-offset-4 hover:underline'>
            <ArrowLeft className='h-[18px] w-[18px]' strokeWidth={2.5} aria-hidden='true' />
            Terug naar de kalender
          </Link>

          <div className='flex flex-wrap items-start gap-[clamp(32px,4vw,56px)]'>
            <article className='flex-[999_1_560px] min-w-0 flex flex-col gap-6'>
              <div className='flex flex-wrap gap-2'>
                <CategoryBadge category={categoryLabels[item.categorie]} variant='contour' size='sm' className='text-[13px]' />
                {isPast && <span className='rounded-full contour-xs bg-gray-100 px-2 py-1 text-[13px] font-bold text-gray-700'>Afgelopen</span>}
              </div>
              <h1 className='font-display font-extrabold text-black text-[clamp(40px,5vw,64px)] leading-[0.98] tracking-[-0.02em]'>{item.titel}</h1>
              <p className='text-gray-700 text-[clamp(18px,1.5vw,21px)] leading-normal'>{item.samenvatting}</p>
              {item.afbeelding && (
                // A poster is shown whole, never cropped
                <div className='rounded-tile contour-sm overflow-hidden bg-gray-50'>
                  <Image
                    src={item.afbeelding.src}
                    width={item.afbeelding.width}
                    height={item.afbeelding.height}
                    alt={`Affiche of foto van ${item.titel}`}
                    sizes='(min-width: 1240px) 760px, 100vw'
                    className='w-full h-auto max-h-[640px] object-contain'
                  />
                </div>
              )}
              {item.html.trim() && (
                <div
                  className='max-w-[720px] prose prose-lg prose-p:text-gray-700 prose-headings:font-display prose-headings:text-black prose-a:text-primary-text'
                  dangerouslySetInnerHTML={{__html: item.html}}
                />
              )}
            </article>

            <aside className='flex-[1_1_340px] min-w-0 pt-3.5' aria-label='Praktisch'>
              <SpeechBubble size='md'>
                <div className='flex flex-col gap-[22px]'>
                  <div className='flex items-center gap-4'>
                    <DateBadge date={item.datum} variant='contour' tone='pink' size='lg' />
                    <div className='flex flex-col gap-0.5'>
                      <span className='font-display font-bold text-[22px] text-black'>{formatDayDate(item.datum)}</span>
                      <span className='text-[15px] text-gray-700'>
                        {[item.programma.length === 0 ? item.tijd : undefined, item.locatie].filter(Boolean).join(' · ')}
                      </span>
                    </div>
                  </div>

                  {item.programma.length > 0 && (
                    <ol aria-label='Programma' className='border-t-2 border-ink'>
                      {item.programma.map(punt => (
                        <li key={`${punt.uur}-${punt.titel}`} className='flex gap-3.5 py-3.5 border-b border-gray-200 last:border-b-0'>
                          <span className='shrink-0 w-14 font-extrabold text-black'>{punt.uur}</span>
                          <span className='flex flex-col gap-0.5'>
                            <span className='font-bold text-black'>{punt.titel}</span>
                            {punt.info && <span className='text-sm text-gray-600'>{punt.info}</span>}
                          </span>
                        </li>
                      ))}
                    </ol>
                  )}

                  {(!isPast || item.locatie) && (
                    <div className='flex flex-col gap-3'>
                      {!isPast && (
                        <AddToCalendarButton
                          variant='contour-solid'
                          title={item.titel}
                          date={item.datum}
                          time={item.tijd}
                          location={item.locatie}
                          description={item.samenvatting}
                          url={`${siteConfig.url}${href}`}
                          id={item.slug}
                        />
                      )}
                      {item.locatie && (
                        <a
                          href={routeUrl(item.locatie)}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='inline-flex justify-center items-center gap-2 px-[18px] py-3 font-bold text-black bg-white hover:bg-brand-primary-50 contour-sm rounded-control transition-colors'
                        >
                          <MapPin className='h-[18px] w-[18px]' aria-hidden='true' />
                          Route naar {item.locatie}
                          <span className='sr-only'> (opent Google Maps in een nieuw venster)</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </SpeechBubble>
            </aside>
          </div>
        </div>
      </section>

      {andere.length > 0 && (
        <section className='bg-gray-50 border-t-(length:--contour-width-sm) border-ink px-5 py-[clamp(56px,6vw,80px)]'>
          <div className='max-w-[1240px] mx-auto flex flex-col gap-7'>
            <h2 className={contourTitle}>Ook op de kalender</h2>
            <div className='grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-7'>
              {andere.map((activiteit, index) => (
                <ActivityCard key={activiteit.slug} activiteit={activiteit} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}
    </PageWithAnnouncements>
  );
}
