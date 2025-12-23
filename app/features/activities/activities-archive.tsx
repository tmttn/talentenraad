'use client';

import {useEffect, useState} from 'react';
import {Archive, ChevronDown} from 'lucide-react';
import {Container, Stack} from '@components/ui/layout';
import {useFlag} from '@lib/flags-client';

type Activity = {
  id: string;
  data: {
    titel: string;
    datum: string;
    tijd?: string;
    locatie?: string;
    samenvatting?: string;
    inhoud?: string;
    categorie: string;
  };
};

type ActivitiesArchiveProperties = {
  limit?: number;
  showYear?: boolean;
};

const builderApiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY!;

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036F]/g, '')
    .replaceAll(/[^a-z\d\s-]/g, '')
    .replaceAll(/\s+/g, '-')
    .replaceAll(/-+/g, '-')
    .trim();
}

function ActivitiesArchive({
  limit = 20,
  showYear = true,
}: Readonly<ActivitiesArchiveProperties>) {
  const isEnabled = useFlag('activitiesArchive');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    async function fetchActivities() {
      try {
        const url = new URL('https://cdn.builder.io/api/v3/content/activiteit');
        url.searchParams.set('apiKey', builderApiKey);
        url.searchParams.set('limit', '100');
        url.searchParams.set('sort.data.datum', '-1'); // Sort by date descending (newest first)
        url.searchParams.set('cachebust', 'true');

        const response = await fetch(url.toString(), {cache: 'no-store'});
        const data = await response.json() as {results?: Activity[]};

        if (data.results) {
          // Filter to only show past events
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          const pastEvents = data.results
            .filter((item: Activity) => {
              const eventDate = new Date(item.data.datum);
              return eventDate < now;
            })
            .slice(0, limit);

          setActivities(pastEvents);
        }
      } catch (error) {
        console.error('Error fetching archive:', error);
      } finally {
        setLoading(false);
      }
    }

    void fetchActivities();
  }, [limit]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-BE', {
      day: 'numeric',
      month: 'long',
      year: showYear ? 'numeric' : undefined,
    });
  };

  const groupByYear = (items: Activity[]) => {
    const groups: Record<string, Activity[]> = {};
    for (const item of items) {
      const year = new Date(item.data.datum).getFullYear().toString();
      groups[year] ||= [];

      groups[year].push(item);
    }

    return groups;
  };

  if (loading) {
    return (
      <section className='py-12 px-6 bg-gray-50' aria-busy='true'>
        <Container size='lg'>
          <div className='animate-pulse'>
            <div className='h-6 bg-gray-200 rounded w-32 mb-4' />
            <Stack gap='xs'>
              <div className='h-4 bg-gray-200 rounded w-full' />
              <div className='h-4 bg-gray-200 rounded w-3/4' />
            </Stack>
          </div>
        </Container>
      </section>
    );
  }

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
        >
          <div className='flex items-center gap-3'>
            <Archive className='h-6 w-6 text-gray-400' aria-hidden='true' />
            <span id='archief-title' className='text-2xl font-bold text-gray-800'>
              Archief
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
                    key={activity.id}
                    href={`/activiteiten/${generateSlug(activity.data.titel)}`}
                    className='block bg-white p-4 rounded-button shadow-subtle hover:shadow-base transition-shadow group'
                  >
                    <div className='flex items-center justify-between'>
                      <div>
                        <h4 className='font-semibold text-gray-800 group-hover:text-primary transition-colors'>
                          {activity.data.titel}
                        </h4>
                        <p className='text-sm text-gray-500'>
                          {formatDate(activity.data.datum)}
                          {activity.data.locatie && ` • ${activity.data.locatie}`}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        activity.data.categorie === 'feest'
                          ? 'bg-pink-100 text-pink-800'
                          : (activity.data.categorie === 'kalender'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800')
                      }`}>
                        {activity.data.categorie}
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

export const ActivitiesArchiveInfo = {
  name: 'ActivitiesArchive',
  component: ActivitiesArchive,
  inputs: [
    {
      name: 'limit',
      type: 'number',
      defaultValue: 20,
      helperText: 'Maximum aantal voorbije activiteiten om te tonen',
    },
    {
      name: 'showYear',
      type: 'boolean',
      defaultValue: true,
      helperText: 'Toon het jaar bij de datum',
    },
  ],
};
