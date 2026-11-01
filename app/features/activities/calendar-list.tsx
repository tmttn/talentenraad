'use client';

import {useState} from 'react';
import {AddToCalendarButton, CategoryBadge, DateBadge} from '@components/ui';
import {CtaButton} from '@components/ui/cta-button';
import {PageIntro} from '@components/layout/contour-parts';
import type {Activiteit} from '@lib/content';
import {parseLocalDate} from '@lib/dates';
import {siteConfig} from '@lib/seo';
import {activityTones, categoryLabels} from './activity-card';

/** Only what the list shows: the body and images stay on the server. */
export type CalendarItem = Pick<Activiteit, 'slug' | 'titel' | 'datum' | 'tijd' | 'locatie' | 'categorie' | 'samenvatting'>;

type Filter = 'alles' | Activiteit['categorie'];

const filterLabels: Record<Activiteit['categorie'], string> = {
  feest: 'Feesten',
  activiteit: 'Acties',
  kalender: 'Schoolkalender',
};

const filterButton = 'px-[18px] py-2.5 font-bold rounded-full contour-xs transition-colors';

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/** "December", or "December 2027" when it is not this year. */
function monthLabel(datum: string, thisYear: number) {
  const date = parseLocalDate(datum);
  const month = capitalize(date.toLocaleDateString('nl-BE', {month: 'long'}));
  return date.getFullYear() === thisYear ? month : `${month} ${date.getFullYear()}`;
}

function CalendarRow({item, index}: Readonly<{item: CalendarItem; index: number}>) {
  const href = `/activiteiten/${item.slug}`;
  const meta = [item.tijd, item.locatie].filter(Boolean).join(' · ');

  return (
    <article className='flex flex-wrap items-center gap-6 p-[22px] bg-white rounded-tile contour-sm shadow-hard-md'>
      <DateBadge date={item.datum} variant='contour' tone={activityTones[index % activityTones.length]} label='weekday' size='lg' />
      <div className='flex-[1_1_320px] min-w-0 flex flex-col gap-2'>
        <div>
          <CategoryBadge category={categoryLabels[item.categorie]} variant='contour' size='sm' className='text-[13px]' />
        </div>
        <h3 className='font-display font-bold text-black text-[28px] leading-[1.1]'>{item.titel}</h3>
        {meta && <p className='text-gray-700'>{meta}</p>}
      </div>
      <div className='flex flex-wrap gap-3'>
        <AddToCalendarButton
          variant='contour'
          label='In mijn agenda'
          title={item.titel}
          date={item.datum}
          time={item.tijd}
          location={item.locatie}
          description={item.samenvatting}
          url={`${siteConfig.url}${href}`}
          id={item.slug}
        />
        <CtaButton text='Meer info' href={href} variant='contour' size='sm' />
      </div>
    </article>
  );
}

type CalendarListProperties = {
  titel: string;
  intro?: string;
  /** Upcoming activities, soonest first. */
  items: CalendarItem[];
  thisYear: number;
};

/** Page intro with a category filter beside it, then the upcoming activities grouped per month. */
export function CalendarList({
  titel, intro, items, thisYear,
}: Readonly<CalendarListProperties>) {
  const [filter, setFilter] = useState<Filter>('alles');
  const categories = (Object.keys(filterLabels) as Array<Activiteit['categorie']>)
    .filter(categorie => items.some(item => item.categorie === categorie));
  const visible = filter === 'alles' ? items : items.filter(item => item.categorie === filter);

  const months: Array<{label: string; items: CalendarItem[]}> = [];
  for (const item of visible) {
    const label = monthLabel(item.datum, thisYear);
    const last = months.at(-1);
    if (last?.label === label) {
      last.items.push(item);
    } else {
      months.push({label, items: [item]});
    }
  }

  return (
    <>
      <PageIntro titel={titel} intro={intro}>
        {categories.length > 1 && (
          <div role='group' aria-label='Filter op soort' className='flex flex-wrap gap-2.5'>
            {(['alles', ...categories] as Filter[]).map(option => (
              <button
                key={option}
                type='button'
                aria-pressed={filter === option}
                onClick={() => {
                  setFilter(option);
                }}
                className={`${filterButton} ${filter === option ? 'bg-black text-white' : 'bg-white text-black hover:bg-brand-primary-50'}`}
              >
                {option === 'alles' ? 'Alles' : filterLabels[option]}
              </button>
            ))}
          </div>
        )}
      </PageIntro>
      <section className='px-5 pb-[clamp(64px,7vw,96px)]'>
        <div className='max-w-[1240px] mx-auto flex flex-col gap-10'>
          {months.length === 0
          ? (
            <p className='rounded-tile contour-sm p-6 text-[17px] text-gray-700'>
              Er staat nog niets gepland. Kom binnenkort terug, of kijk hieronder wat we al deden.
            </p>
          )
          : months.map(month => (
            <div key={month.label} className='flex flex-col gap-[18px]'>
              <h2 className='font-display font-extrabold text-black text-[28px] tracking-[-0.01em]'>{month.label}</h2>
              {month.items.map(item => (
                <CalendarRow key={item.slug} item={item} index={items.indexOf(item)} />
              ))}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
