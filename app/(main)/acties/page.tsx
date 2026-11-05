import type {Metadata} from 'next';
import Link from 'next/link';
import {PageWithAnnouncements} from '@components/layout/page-with-announcements';
import {PageIntro} from '@components/layout/contour-parts';
import {ActieKaart} from '@features/bestellen/actie-kaart';
import {actieStatus} from '@lib/bestellingen/acties';
import {content} from '@lib/content';
import {todayString} from '@lib/dates';
import {generateMetadata as generateSeoMetadata} from '@lib/seo';

export const metadata: Metadata = generateSeoMetadata({
  title: 'Acties',
  description: 'Bestel online bij de acties van de Talentenraad: de opbrengst gaat naar activiteiten voor alle kinderen.',
  url: '/acties',
});

export default function ActiesPage() {
  const today = todayString();
  const acties = content.getActies();
  const lopend = acties.filter(actie => actieStatus(actie, today) !== 'gesloten');
  const afgelopen = acties.filter(actie => actieStatus(actie, today) === 'gesloten').reverse().slice(0, 6);

  return (
    <PageWithAnnouncements>
      <PageIntro titel='Acties' intro='Bestel online en haal je bestelling op aan school. De opbrengst gaat naar activiteiten voor alle kinderen.' />
      <section className='px-5 pb-[clamp(64px,7vw,96px)]'>
        <div className='max-w-[1240px] mx-auto flex flex-col gap-10'>
          {lopend.length === 0
            ? <p className='text-lg text-gray-700'>Er loopt nu geen actie. Volg de <Link href='/kalender' className='font-bold text-primary-text underline underline-offset-2'>kalender</Link> voor wat er komt.</p>
            : (
              <ul className='grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-7'>
                {lopend.map(actie => <li key={actie.slug} className='flex'><ActieKaart actie={actie} today={today} /></li>)}
              </ul>
            )}
          {afgelopen.length > 0 && (
            <div className='flex flex-col gap-5'>
              <h2 className='font-display font-extrabold text-black text-3xl'>Eerder</h2>
              <ul className='grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-6'>
                {afgelopen.map(actie => <li key={actie.slug} className='flex'><ActieKaart actie={actie} today={today} /></li>)}
              </ul>
            </div>
          )}
        </div>
      </section>
    </PageWithAnnouncements>
  );
}
