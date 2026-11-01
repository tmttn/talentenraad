import type {Metadata} from 'next';
import {Card} from '@components/ui';
import {PageWithAnnouncements} from '@components/layout/page-with-announcements';
import {ContourCta, contourTitle} from '@components/layout/contour-parts';
import {formatLongDate} from '@features/activities/activity-card';
import {CalendarList} from '@features/activities/calendar-list';
import {content} from '@lib/content';
import {todayString} from '@lib/dates';
import {generateMetadata as generateSeoMetadata} from '@lib/seo';

export function generateMetadata(): Metadata {
  const pagina = content.getPagina('kalender');
  return generateSeoMetadata({title: pagina.titel, description: pagina.beschrijving, url: '/kalender'});
}

export default function Page() {
  const pagina = content.getPagina('kalender');
  const today = todayString();
  const activiteiten = content.getActiviteiten();
  const komend = activiteiten
    .filter(activiteit => activiteit.datum >= today)
    .sort((a, b) => a.datum.localeCompare(b.datum))
    .map(({slug, titel, datum, tijd, locatie, categorie, samenvatting}) => ({
      slug, titel, datum, tijd, locatie, categorie, samenvatting,
    }));
  const voorbij = activiteiten
    .filter(activiteit => activiteit.datum < today)
    .sort((a, b) => b.datum.localeCompare(a.datum))
    .slice(0, 12);

  return (
    <PageWithAnnouncements>
      <CalendarList titel={pagina.hero.titel} intro={pagina.hero.ondertitel} items={komend} thisYear={Number(today.slice(0, 4))} />
      {voorbij.length > 0 && (
        <section className='bg-gray-50 border-t-(length:--contour-width-sm) border-ink px-5 py-[clamp(56px,6vw,80px)]'>
          <div className='max-w-[1240px] mx-auto flex flex-col gap-7'>
            <div className='flex flex-wrap justify-between items-end gap-3'>
              <h2 className={contourTitle}>{pagina.archief.titel}</h2>
              <p className='text-gray-600'>{pagina.archief.ondertitel}</p>
            </div>
            <ul className='grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-6'>
              {voorbij.map(activiteit => (
                <li key={activiteit.slug} className='flex'>
                  <Card variant='contour-flat' padding='none' href={`/activiteiten/${activiteit.slug}`} className='flex-1 flex flex-col gap-1.5 p-5'>
                    <span className='text-sm font-bold text-gray-600'>{formatLongDate(activiteit.datum)}</span>
                    <span className='font-display font-bold text-[22px] leading-tight text-black'>{activiteit.titel}</span>
                    <span className='text-[15px] font-semibold text-primary-text'>{activiteit.afbeelding ? 'Bekijk foto\'s' : 'Lees meer'}</span>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      <div className='pt-[clamp(56px,6vw,80px)]'>
        <ContourCta cta={pagina.cta} />
      </div>
    </PageWithAnnouncements>
  );
}
