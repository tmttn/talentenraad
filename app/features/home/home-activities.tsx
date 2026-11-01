import Image from 'next/image';
import Link from 'next/link';
import {
  AddToCalendarButton, Card, CategoryBadge, DateBadge,
} from '@components/ui';
import {CtaButton} from '@components/ui/cta-button';
import type {Activiteit} from '@lib/content';
import {parseLocalDate} from '@lib/dates';
import {siteConfig} from '@lib/seo';

type HomeActivitiesProperties = {
  /** Upcoming activities, soonest first. */
  activiteiten: Activiteit[];
};

/** Header colors of the small cards, in turn; text colors pass 4.5:1 on each. */
const headerStyles = [
  'bg-primary text-white',
  'bg-logo-green text-black',
  'bg-logo-orange text-black',
];

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/** "vr 19 dec" */
function formatShortDate(datum: string) {
  return parseLocalDate(datum)
    .toLocaleDateString('nl-BE', {weekday: 'short', day: 'numeric', month: 'short'})
    .replaceAll('.', '');
}

/** "Zaterdag · 19:00 - 23:00 · Beversheem" */
function formatMeta(activiteit: Activiteit) {
  const weekday = capitalize(parseLocalDate(activiteit.datum).toLocaleDateString('nl-BE', {weekday: 'long'}));
  return [weekday, activiteit.tijd, activiteit.locatie].filter(Boolean).join(' · ');
}

function FeaturedActivity({activiteit}: Readonly<{activiteit: Activiteit}>) {
  const href = `/activiteiten/${activiteit.slug}`;

  return (
    <article className='flex flex-wrap rounded-panel bg-white contour shadow-hard-lg overflow-hidden'>
      {activiteit.afbeelding && (
        <Image
          src={activiteit.afbeelding.src}
          width={activiteit.afbeelding.width}
          height={activiteit.afbeelding.height}
          alt=''
          className='flex-[1_1_480px] min-w-0 h-[clamp(200px,26vw,380px)] object-cover'
        />
      )}
      <div className='flex-[1_1_380px] min-w-0 p-[clamp(24px,3vw,44px)] flex flex-col gap-[18px] justify-center'>
        <div className='flex gap-[18px] items-center'>
          <DateBadge date={activiteit.datum} variant='contour' size='lg' className='w-21 h-21' />
          <div className='flex flex-col gap-1.5 min-w-0'>
            <h3 className='font-display font-extrabold text-black text-[clamp(32px,3.4vw,46px)] leading-none tracking-[-0.02em]'>
              {activiteit.titel}
            </h3>
            <span className='text-gray-700'>{formatMeta(activiteit)}</span>
          </div>
        </div>
        <p className='text-gray-700 text-[17px] leading-relaxed'>{activiteit.samenvatting}</p>
        <div className='flex flex-wrap gap-3'>
          <CtaButton text='Meer info' href={href} variant='contour' showArrow={false} />
          <AddToCalendarButton
            variant='contour'
            title={activiteit.titel}
            date={activiteit.datum}
            time={activiteit.tijd}
            location={activiteit.locatie}
            description={activiteit.samenvatting}
            url={`${siteConfig.url}${href}`}
            id={activiteit.slug}
          />
        </div>
      </div>
    </article>
  );
}

function ActivityCard({activiteit, index}: Readonly<{activiteit: Activiteit; index: number}>) {
  return (
    <Card variant='contour' padding='none' href={`/activiteiten/${activiteit.slug}`} hover className='flex flex-col'>
      <span className={`flex justify-between items-center gap-3 px-5 py-3.5 border-b-(length:--contour-width-sm) border-ink ${headerStyles[index % headerStyles.length]}`}>
        <span className='font-display font-bold text-[22px]'>{formatShortDate(activiteit.datum)}</span>
        <CategoryBadge category={capitalize(activiteit.categorie)} variant='outline' size='sm' className='text-[13px]' />
      </span>
      <span className='flex flex-col gap-2 p-5'>
        <span className='text-xl font-bold leading-snug text-black'>{activiteit.titel}</span>
        {(activiteit.tijd ?? activiteit.locatie) && (
          <span className='text-[15px] text-gray-600'>
            {[activiteit.tijd, activiteit.locatie].filter(Boolean).join(' · ')}
          </span>
        )}
      </span>
    </Card>
  );
}

const sectionTitle = 'font-display font-extrabold text-black text-[clamp(32px,3.2vw,44px)] tracking-[-0.02em]';

/** "Eerstvolgende activiteit" (featured) plus up to three more as cards. */
function HomeActivities({activiteiten}: Readonly<HomeActivitiesProperties>) {
  const [eerste, ...later] = activiteiten;

  if (!eerste) {
    return (
      <section className='px-5 pt-[clamp(64px,7vw,96px)]'>
        <div className='max-w-[1240px] mx-auto flex flex-col items-start gap-4 rounded-panel contour shadow-hard-lg p-[clamp(24px,3vw,44px)]'>
          <h2 className={sectionTitle}>Binnenkort meer</h2>
          <p className='text-gray-700 text-[17px] leading-relaxed'>
            Er staat nog geen nieuwe activiteit in de kalender. Kijk gerust wat er al gebeurd is.
          </p>
          <CtaButton text='Bekijk de kalender' href='/kalender' variant='contour' />
        </div>
      </section>
    );
  }

  return (
    <>
      <section className='px-5 pt-[clamp(64px,7vw,96px)]'>
        <div className='max-w-[1240px] mx-auto flex flex-col gap-6'>
          <h2 className='text-sm font-bold tracking-[0.08em] uppercase text-primary-text'>Eerstvolgende activiteit</h2>
          <FeaturedActivity activiteit={eerste} />
        </div>
      </section>
      {later.length > 0 && (
        <section className='px-5 pt-[clamp(56px,6vw,80px)]'>
          <div className='max-w-[1240px] mx-auto flex flex-col gap-8'>
            <div className='flex flex-wrap items-end justify-between gap-3'>
              <h2 className={sectionTitle}>Later dit schooljaar</h2>
              <Link href='/kalender' className='font-bold text-[17px] text-primary-text underline'>Volledige kalender</Link>
            </div>
            <div className='grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-7'>
              {later.slice(0, 3).map((activiteit, index) => (
                <ActivityCard key={activiteit.slug} activiteit={activiteit} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

export {HomeActivities, formatShortDate, formatMeta, sectionTitle};
