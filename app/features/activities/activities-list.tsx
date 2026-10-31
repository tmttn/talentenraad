'use client';

import {
  MapPin,
  Clock,
  Calendar,
} from 'lucide-react';
import {AnimatedLink} from '@components/ui';
import {Container, Stack} from '@components/ui/layout';
import type {Activiteit} from '@lib/content';
import {parseLocalDate} from '@lib/dates';

const articleClassName = [
  'flex items-start gap-6 bg-white p-4 rounded-card shadow-base hover:shadow-elevated transition-shadow',
  'focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 group',
].join(' ');

type ActivitiesListProperties = {
  /** Local date (YYYY-MM-DD) computed on the server, so hydration matches the static HTML. */
  today: string;
  activiteiten: Activiteit[];
  showViewAll?: boolean;
  viewAllLink?: string;
  limit?: number;
  showLocation?: boolean;
  showDescription?: boolean;
};

function ActivitiesList({
  today,
  activiteiten,
  showViewAll = true,
  viewAllLink = '/kalender',
  limit = 5,
  showLocation = true,
  showDescription = false,
}: Readonly<ActivitiesListProperties>) {
  const activities = activiteiten
    .filter(activity => activity.datum >= today)
    .sort((a, b) => a.datum.localeCompare(b.datum))
    .slice(0, limit);

  const formatDate = (dateString: string) => {
    const date = parseLocalDate(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('nl-BE', {month: 'short'}).toUpperCase();
    return {day, month};
  };

  return (
    <section className='py-16 px-6'>
      <Container size='lg'>
        {activities.length > 0
          ? (
            <Stack gap='md' role='list' aria-label='Lijst van activiteiten'>
              {activities.map(activity => {
                const {day, month} = formatDate(activity.datum);
                return (
                  <a
                    key={activity.slug}
                    href={`/activiteiten/${activity.slug}`}
                    className='block'
                  >
                    <article
                      role='listitem'
                      className={articleClassName}
                    >
                      <div className='flex-shrink-0 w-16 h-16 bg-primary rounded-card flex flex-col items-center justify-center text-white'>
                        <span className='text-2xl font-bold leading-none'>{day}</span>
                        <span className='text-xs uppercase'>{month}</span>
                      </div>
                      <div className='flex-grow'>
                        <h3 className='font-bold text-gray-800 flex items-center gap-2 group-hover:text-primary transition-colors'>
                          {activity.titel}
                        </h3>
                        {activity.tijd && (
                          <p className='text-sm text-gray-500 flex items-center gap-1'>
                            <Clock className='h-4 w-4' aria-hidden='true' />
                            {activity.tijd}
                          </p>
                        )}
                        {showLocation && activity.locatie && (
                          <p className='text-sm text-gray-500 flex items-center gap-1 mt-1'>
                            <MapPin className='h-4 w-4' aria-hidden='true' />
                            {activity.locatie}
                          </p>
                        )}
                        {showDescription && activity.samenvatting && (
                          <p className='text-sm text-gray-600 mt-2 line-clamp-2'>
                            {activity.samenvatting.length > 150
                              ? `${activity.samenvatting.slice(0, 150)}...`
                              : activity.samenvatting}
                          </p>
                        )}
                      </div>
                      <div className='flex-shrink-0 flex flex-col items-end gap-2'>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          activity.categorie === 'feest'
                            ? 'bg-category-event-bg text-category-event-text'
                            : (activity.categorie === 'kalender'
                              ? 'bg-category-calendar-bg text-category-calendar-text'
                              : 'bg-category-activity-bg text-category-activity-text')
                        }`}>
                          {activity.categorie}
                        </span>
                        <span className='text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity'>
                          Meer info →
                        </span>
                      </div>
                    </article>
                  </a>
                );
              })}
            </Stack>
          )
          : (
            <div className='text-center py-16 px-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-modal border-2 border-dashed border-gray-200'>
              <div className='w-20 h-20 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-subtle text-primary'>
                <Calendar className='h-10 w-10' aria-hidden='true' />
              </div>
              <h3 className='text-xl font-bold text-gray-800 mb-2'>Nog geen activiteiten gepland</h3>
              <p className='text-gray-500 max-w-sm mx-auto mb-6'>
                Binnenkort plannen we nieuwe activiteiten voor de schoolgemeenschap. Houd deze pagina in de gaten!
              </p>
              <AnimatedLink href='/contact?onderwerp=activiteit' size='sm'>
                Heb je een idee? Laat het ons weten!
              </AnimatedLink>
            </div>
          )}

        {showViewAll && activities.length > 0 && (
          <div className='text-center mt-8'>
            <AnimatedLink href={viewAllLink}>
              Bekijk alle activiteiten
            </AnimatedLink>
          </div>
        )}
      </Container>
    </section>
  );
}

export {ActivitiesList};
