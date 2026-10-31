'use client';

import {useState} from 'react';
import {Archive, ChevronDown} from 'lucide-react';
import {Container, Stack} from '@components/ui/layout';
import type {Activiteit} from '@lib/content';
import {parseLocalDate} from '@lib/dates';
import {useFlag} from '@lib/flags-client';

type ActivitiesArchiveProperties = {
  /** Local date (YYYY-MM-DD) computed on the server, so hydration matches the static HTML. */
  today: string;
  activiteiten: Activiteit[];
  title: string;
  subtitle: string;
  limit?: number;
  showYear?: boolean;
};

function ActivitiesArchive({
  today,
  activiteiten,
  title,
  subtitle,
  limit = 20,
  showYear = true,
}: Readonly<ActivitiesArchiveProperties>) {
  const isEnabled = useFlag('activitiesArchive');
  const [isExpanded, setIsExpanded] = useState(false);
  const activities = activiteiten
    .filter(activity => activity.datum < today)
    .sort((a, b) => b.datum.localeCompare(a.datum))
    .slice(0, limit);

  const formatDate = (dateString: string) => {
    const date = parseLocalDate(dateString);
    return date.toLocaleDateString('nl-BE', {
      day: 'numeric',
      month: 'long',
      year: showYear ? 'numeric' : undefined,
    });
  };

  const groupByYear = (items: Activiteit[]) => {
    const groups: Record<string, Activiteit[]> = {};
    for (const item of items) {
      const year = parseLocalDate(item.datum).getFullYear().toString();
      groups[year] ||= [];

      groups[year].push(item);
    }

    return groups;
  };

  if (activities.length === 0) {
    return null;
  }

  // Check feature flag
  if (!isEnabled) {
    return null;
  }

  const groupedActivities = groupByYear(activities);
  const years = Object.keys(groupedActivities).sort((a, b) => Number(b) - Number(a));

  return (
    <section className='py-12 px-6 bg-gray-50' aria-labelledby='archief-title'>
      <Container size='lg'>
        <button
          type='button'
          onClick={() => {
            setIsExpanded(!isExpanded);
          }}
          className='w-full flex items-center justify-between text-left mb-6 group'
          aria-expanded={isExpanded}
          aria-controls='archief-content'
          aria-describedby='archief-subtitle'
        >
          <div className='flex items-center gap-3'>
            <Archive className='h-6 w-6 text-gray-400' aria-hidden='true' />
            <span id='archief-title' className='text-2xl font-bold text-gray-800'>
              {title}
            </span>
            <span className='text-sm font-normal text-gray-500'>
              ({activities.length} activiteiten)
            </span>
          </div>
          <ChevronDown
            className={`h-6 w-6 text-gray-400 transition-transform duration-fast ${isExpanded ? 'rotate-180' : ''}`}
            aria-hidden='true'
          />
        </button>

        <p id='archief-subtitle' className='sr-only'>{subtitle}</p>

        <div
          id='archief-content'
          className={`transition-all duration-slow overflow-hidden ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
        >
          {years.map(year => (
            <div key={year} className='mb-8'>
              <h3 className='text-lg font-bold text-gray-700 mb-4 flex items-center gap-2'>
                <span className='w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm'>
                  {groupedActivities[year].length}
                </span>
                {year}
              </h3>
              <Stack gap='sm' className='pl-4 border-l-2 border-gray-200'>
                {groupedActivities[year].map(activity => (
                  <a
                    key={activity.slug}
                    href={`/activiteiten/${activity.slug}`}
                    className='block bg-white p-4 rounded-button shadow-subtle hover:shadow-base transition-shadow group'
                  >
                    <div className='flex items-center justify-between'>
                      <div>
                        <h4 className='font-semibold text-gray-800 group-hover:text-primary transition-colors'>
                          {activity.titel}
                        </h4>
                        <p className='text-sm text-gray-500'>
                          {formatDate(activity.datum)}
                          {activity.locatie && ` • ${activity.locatie}`}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        activity.categorie === 'feest'
                          ? 'bg-pink-100 text-pink-800'
                          : (activity.categorie === 'kalender'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800')
                      }`}>
                        {activity.categorie}
                      </span>
                    </div>
                  </a>
                ))}
              </Stack>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

export {ActivitiesArchive};
