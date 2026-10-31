'use client';

import {Calendar, Newspaper} from 'lucide-react';
import {AnimatedLink} from '@components/ui';
import type {Activiteit, NieuwsItem} from '@lib/content';
import {parseLocalDate, todayString} from '@lib/dates';

type HomepageDashboardProperties = {
  activiteiten: Activiteit[];
  nieuws: NieuwsItem[];
};

function HomepageDashboard({activiteiten: alleActiviteiten, nieuws}: Readonly<HomepageDashboardProperties>) {
  const today = todayString();
  const activiteiten = alleActiviteiten
    .filter(activiteit => activiteit.datum >= today)
    .sort((a, b) => a.datum.localeCompare(b.datum))
    .slice(0, 3);
  const nieuwsItems = [...nieuws]
    .sort((a, b) => b.datum.localeCompare(a.datum))
    .slice(0, 3);

  const formatDate = (dateString: string) => {
    const date = parseLocalDate(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('nl-BE', {month: 'short'}).toUpperCase();
    return {day, month};
  };

  const formatFullDate = (dateString: string) => {
    const date = parseLocalDate(dateString);
    return date.toLocaleDateString('nl-BE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <section className='py-12 px-6 bg-gray-50'>
      <div className='max-w-6xl mx-auto'>
        <div className='grid md:grid-cols-2 gap-6'>
          {/* Komende Activiteiten */}
          <div className='bg-white rounded-modal shadow-subtle hover:shadow-base transition-shadow overflow-hidden flex flex-col'>
            <div className='bg-gradient-to-r from-brand-primary-500 to-brand-primary-600 px-6 py-3'>
              <h3 className='text-white font-semibold flex items-center gap-2'>
                <Calendar className='h-5 w-5' />
                Komende Activiteiten
              </h3>
            </div>
            <div className='p-4 flex-grow'>
              {activiteiten.length > 0
                ? (
                  <div className='space-y-3'>
                    {activiteiten.map(activiteit => (
                      <a
                        key={activiteit.slug}
                        href={`/activiteiten/${activiteit.slug}`}
                        className='block group'
                      >
                        <div className='flex items-center gap-3 p-2 rounded-button hover:bg-gray-50 transition-colors'>
                          <div className='flex-shrink-0 w-12 h-12 bg-primary rounded-button flex flex-col items-center justify-center text-white'>
                            <span className='text-lg font-bold leading-none'>{formatDate(activiteit.datum).day}</span>
                            <span className='text-[9px] uppercase'>{formatDate(activiteit.datum).month}</span>
                          </div>
                          <div className='flex-grow min-w-0'>
                            <h4 className='font-semibold text-gray-800 group-hover:text-primary transition-colors text-sm truncate'>
                              {activiteit.titel}
                            </h4>
                            <div className='flex items-center gap-2 text-xs text-gray-600'>
                              {activiteit.tijd && <span>{activiteit.tijd}</span>}
                              {activiteit.tijd && activiteit.locatie && <span>•</span>}
                              {activiteit.locatie && <span className='truncate'>{activiteit.locatie}</span>}
                            </div>
                          </div>
                          <span className={`flex-shrink-0 px-2 py-0.5 text-[10px] font-medium rounded-full ${
                            activiteit.categorie === 'feest'
                              ? 'bg-category-event-bg text-category-event-text'
                              : (activiteit.categorie === 'kalender'
                                ? 'bg-category-calendar-bg text-category-calendar-text'
                                : 'bg-category-activity-bg text-category-activity-text')
                          }`}>
                            {activiteit.categorie}
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                )
                : (
                  <div className='text-center py-6'>
                    <p className='text-gray-600 text-sm'>Geen activiteiten gepland</p>
                  </div>
                )}
            </div>
            <div className='px-6 pb-4 border-t border-gray-100 pt-3 mt-auto'>
              <AnimatedLink href='/kalender' size='sm'>
                Bekijk alle activiteiten
              </AnimatedLink>
            </div>
          </div>

          {/* Laatste Nieuws */}
          <div className='bg-white rounded-modal shadow-subtle hover:shadow-base transition-shadow overflow-hidden flex flex-col'>
            <div className='bg-gradient-to-r from-brand-secondary-400 to-brand-secondary-500 px-6 py-3'>
              <h3 className='text-white font-semibold flex items-center gap-2'>
                <Newspaper className='h-5 w-5' />
                Laatste Nieuws
              </h3>
            </div>
            <div className='p-4 flex-grow'>
              {nieuwsItems.length > 0
                ? (
                  <div className='space-y-3'>
                    {nieuwsItems.map(nieuws => (
                      <a
                        key={nieuws.slug}
                        href={`/nieuws/${nieuws.slug}`}
                        className='block group'
                      >
                        <div className='p-2 rounded-button hover:bg-gray-50 transition-colors'>
                          <div className='flex items-start justify-between gap-2'>
                            <div className='min-w-0'>
                              <h4 className='font-semibold text-gray-800 group-hover:text-secondary transition-colors text-sm truncate'>
                                {nieuws.titel}
                              </h4>
                              <p className='text-xs text-gray-600 mt-0.5'>{formatFullDate(nieuws.datum)}</p>
                            </div>
                          </div>
                          <p className='text-xs text-gray-600 mt-1 line-clamp-2'>
                            {nieuws.samenvatting}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                )
                : (
                  <div className='text-center py-6'>
                    <p className='text-gray-600 text-sm'>Nog geen nieuws</p>
                  </div>
                )}
            </div>
            <div className='px-6 pb-4 border-t border-gray-100 pt-3 mt-auto'>
              <AnimatedLink href='/nieuws' size='sm' variant='secondary'>
                Alle nieuwsberichten
              </AnimatedLink>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

export {HomepageDashboard};

export const HomepageDashboardInfo = {
  name: 'HomepageDashboard',
  component: HomepageDashboard,
  inputs: [],
};
