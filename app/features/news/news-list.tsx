'use client';

import Image from 'next/image';
import {
  Calendar,
  Newspaper,
  ArrowRight,
} from 'lucide-react';
import {linkStyles} from '@components/ui';
import {Container, Stack, Grid} from '@components/ui/layout';
import type {NieuwsItem} from '@lib/content';
import {parseLocalDate} from '@lib/dates';

const articleListClassName = [
  'bg-white rounded-card shadow-base hover:shadow-elevated transition-shadow group overflow-hidden',
  'p-6 border-l-4 border-primary',
].join(' ');

const articleGridClassName = 'bg-white rounded-card shadow-base hover:shadow-elevated transition-shadow group overflow-hidden';

const linkClassName = [
  'block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
  'focus-visible:ring-offset-2 rounded-card',
].join(' ');

const socialLinkClassName = [
  'inline-flex items-center gap-2 text-primary font-semibold hover:underline',
  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded',
].join(' ');

type NewsListProperties = {
  nieuws: NieuwsItem[];
  limit?: number;
  layout?: 'list' | 'grid';
  showImages?: boolean;
};

function NewsList({
  nieuws,
  limit = 10,
  layout = 'list',
  showImages = true,
}: Readonly<NewsListProperties>) {
  const newsItems = [...nieuws]
    .sort((a, b) => b.datum.localeCompare(a.datum))
    .slice(0, limit);

  const formatDate = (dateString: string) => {
    const date = parseLocalDate(dateString);
    return date.toLocaleDateString('nl-BE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const renderGridLayout = () => (
    <Grid cols={1} colsMd={2} colsLg={3} gap='md' as='div' aria-label='Nieuwsberichten'>
      {newsItems.map(item => (
        <a
          key={item.slug}
          href={`/nieuws/${item.slug}`}
          className={linkClassName}
        >
          <article className={articleGridClassName}>
            {showImages && item.afbeelding && (
              <div className='relative h-48 overflow-hidden'>
                <Image
                  src={item.afbeelding.src}
                  width={item.afbeelding.width}
                  height={item.afbeelding.height}
                  alt=''
                  className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-slow'
                />
              </div>
            )}
            <div className='p-5'>
              <div className='flex items-center gap-2 text-sm text-gray-500 mb-2'>
                <Calendar className='h-4 w-4' aria-hidden='true' />
                {formatDate(item.datum)}
              </div>
              <h3 className='font-bold text-gray-800 mb-2 flex items-center gap-2 group-hover:text-primary transition-colors text-lg line-clamp-2'>
                {item.titel}
              </h3>
              <p className='text-gray-600 text-sm line-clamp-2'>
                {item.samenvatting}
              </p>
              <span
                className='animated-link inline-flex items-center gap-1 mt-3 text-primary font-semibold text-sm'
                aria-hidden='true'
              >
                Lees meer
                <ArrowRight className='h-4 w-4 animated-link-arrow' aria-hidden='true' />
              </span>
            </div>
          </article>
        </a>
      ))}
    </Grid>
  );

  const renderListLayout = () => (
    <Stack gap='lg' as='div' aria-label='Nieuwsberichten'>
      {newsItems.map(item => (
        <a
          key={item.slug}
          href={`/nieuws/${item.slug}`}
          className={linkClassName}
        >
          <article className={articleListClassName}>
            <div className='flex items-center gap-2 text-sm text-gray-500 mb-2'>
              <Calendar className='h-4 w-4' aria-hidden='true' />
              {formatDate(item.datum)}
            </div>
            <h3 className='font-bold text-gray-800 mb-2 flex items-center gap-2 group-hover:text-primary transition-colors text-xl'>
              {item.titel}
            </h3>
            <p className='text-gray-600'>
              {item.samenvatting}
            </p>
            <span
              className='animated-link inline-flex items-center gap-1 mt-3 text-primary font-semibold text-sm'
              aria-hidden='true'
            >
              Lees meer
              <ArrowRight className='h-4 w-4 animated-link-arrow' aria-hidden='true' />
            </span>
          </article>
        </a>
      ))}
    </Stack>
  );

  return (
    <section className='py-16 px-6'>
      <style dangerouslySetInnerHTML={{__html: linkStyles}} />
      <Container size='md'>
        {newsItems.length > 0
          ? (layout === 'grid' ? renderGridLayout() : renderListLayout())
          : (
            <div className='text-center py-16 px-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-modal border-2 border-dashed border-gray-200'>
              <div className='w-20 h-20 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-subtle text-primary'>
                <Newspaper className='h-10 w-10' aria-hidden='true' />
              </div>
              <h3 className='text-xl font-bold text-gray-800 mb-2'>Nog geen nieuwsberichten</h3>
              <p className='text-gray-500 max-w-sm mx-auto mb-6'>
                Hier verschijnt binnenkort nieuws van de Talentenraad. Volg ons op sociale media voor updates!
              </p>
              <div className='flex items-center justify-center gap-4'>
                <a
                  href='https://facebook.com/talentenhuis'
                  target='_blank'
                  rel='noopener noreferrer'
                  className={socialLinkClassName}
                  aria-label='Facebook (opent in nieuw venster)'
                >
                  Facebook
                  <ArrowRight className='h-4 w-4' aria-hidden='true' />
                </a>
                <a
                  href='https://instagram.com/talentenhuis'
                  target='_blank'
                  rel='noopener noreferrer'
                  className={socialLinkClassName}
                  aria-label='Instagram (opent in nieuw venster)'
                >
                  Instagram
                  <ArrowRight className='h-4 w-4' aria-hidden='true' />
                </a>
              </div>
            </div>
          )}
      </Container>
    </section>
  );
}

export {NewsList};
