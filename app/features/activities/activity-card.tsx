import {Card, CategoryBadge} from '@components/ui';
import type {Activiteit} from '@lib/content';
import {parseLocalDate} from '@lib/dates';

/** How a category is named on the site; the editor keeps its own labels. */
export const categoryLabels: Record<Activiteit['categorie'], string> = {
  feest: 'Feest',
  activiteit: 'Actie',
  kalender: 'Kalender',
};

/** Logo colors for activities, in turn; text colors pass 4.5:1 on each. */
export const activityTones = ['pink', 'orange', 'green'] as const;

const headerStyles = {
  pink: 'bg-primary text-white',
  orange: 'bg-logo-orange text-black',
  green: 'bg-logo-green text-black',
};

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/** "vr 19 dec" */
export function formatShortDate(datum: string) {
  return parseLocalDate(datum)
    .toLocaleDateString('nl-BE', {weekday: 'short', day: 'numeric', month: 'short'})
    .replaceAll('.', '');
}

/** "Vrijdag 19 december" */
export function formatDayDate(datum: string) {
  return capitalize(parseLocalDate(datum).toLocaleDateString('nl-BE', {weekday: 'long', day: 'numeric', month: 'long'}));
}

/** "19 december 2025" */
export function formatLongDate(datum: string) {
  return parseLocalDate(datum).toLocaleDateString('nl-BE', {day: 'numeric', month: 'long', year: 'numeric'});
}

/** "Zaterdag · 19:00 - 23:00 · Beversheem" */
export function formatMeta(activiteit: Pick<Activiteit, 'datum' | 'tijd' | 'locatie'>) {
  const weekday = capitalize(parseLocalDate(activiteit.datum).toLocaleDateString('nl-BE', {weekday: 'long'}));
  return [weekday, activiteit.tijd, activiteit.locatie].filter(Boolean).join(' · ');
}

/** Small contour card with a colored date header, for "Later dit schooljaar" and "Ook op de kalender". */
export function ActivityCard({activiteit, index}: Readonly<{activiteit: Activiteit; index: number}>) {
  const tone = activityTones[index % activityTones.length];

  return (
    <Card variant='contour' padding='none' href={`/activiteiten/${activiteit.slug}`} hover className='flex flex-col'>
      <span className={`flex justify-between items-center gap-3 px-5 py-3.5 border-b-(length:--contour-width-sm) border-ink ${headerStyles[tone]}`}>
        <span className='font-display font-bold text-[22px]'>{formatShortDate(activiteit.datum)}</span>
        <CategoryBadge category={categoryLabels[activiteit.categorie]} variant='outline' size='sm' className='text-[13px]' />
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
