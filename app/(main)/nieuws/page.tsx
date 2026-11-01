import type {Metadata} from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {ArrowRight} from 'lucide-react';
import {PageWithAnnouncements} from '@components/layout/page-with-announcements';
import {ContourCta, PageIntro} from '@components/layout/contour-parts';
import {formatLongDate} from '@features/activities/activity-card';
import {content, type NieuwsItem} from '@lib/content';
import {generateMetadata as generateSeoMetadata} from '@lib/seo';

export function generateMetadata(): Metadata {
  const pagina = content.getPagina('nieuws');
  return generateSeoMetadata({title: pagina.titel, description: pagina.beschrijving, url: '/nieuws'});
}

function LatestNews({item}: Readonly<{item: NieuwsItem}>) {
  return (
    <Link
      href={`/nieuws/${item.slug}`}
      className='group flex flex-wrap bg-white rounded-panel contour shadow-hard-lg overflow-hidden transition hover:-translate-x-0.5 hover:-translate-y-0.5'
    >
      {item.afbeelding && (
        <span className='relative flex-[1_1_480px] min-w-0 min-h-[clamp(220px,28vw,400px)] bg-gray-100'>
          <Image src={item.afbeelding.src} alt='' fill sizes='(min-width: 1240px) 620px, 100vw' className='object-cover' />
        </span>
      )}
      <span className='flex-[1_1_420px] min-w-0 p-[clamp(24px,3vw,44px)] flex flex-col justify-center gap-4'>
        <span className='flex flex-wrap items-center gap-2.5'>
          <span className='rounded-full contour-xs bg-logo-orange px-2.5 py-0.5 text-[13px] font-bold text-black'>Nieuwste</span>
          <span className='text-sm font-bold text-secondary-hover'>{formatLongDate(item.datum)}</span>
        </span>
        <span className='font-display font-extrabold text-black text-[clamp(30px,3.2vw,44px)] leading-[1.02] tracking-[-0.02em]'>{item.titel}</span>
        <span className='text-[17px] leading-relaxed text-gray-700'>{item.samenvatting}</span>
        <span className='inline-flex items-center gap-2 font-bold text-primary-text'>
          Lees verder
          <ArrowRight className='h-[18px] w-[18px] transition-transform group-hover:translate-x-1' strokeWidth={2.5} aria-hidden='true' />
        </span>
      </span>
    </Link>
  );
}

export default function Page() {
  const pagina = content.getPagina('nieuws');
  const [nieuwste, ...eerder] = [...content.getNieuws()].sort((a, b) => b.datum.localeCompare(a.datum));

  return (
    <PageWithAnnouncements>
      <PageIntro titel={pagina.hero.titel} intro={pagina.hero.ondertitel} />
      {nieuwste
        ? (
          <section className='px-5 pb-[clamp(56px,6vw,80px)]'>
            <div className='max-w-[1240px] mx-auto'>
              <LatestNews item={nieuwste} />
            </div>
          </section>
        )
        : (
          <section className='px-5 pb-[clamp(56px,6vw,80px)]'>
            <p className='max-w-[1240px] mx-auto rounded-tile contour-sm p-6 text-[17px] text-gray-700'>Er is nog geen nieuws.</p>
          </section>
        )}
      {eerder.length > 0 && (
        <section className='px-5 pb-[clamp(56px,6vw,80px)]'>
          <div className='max-w-[1240px] mx-auto'>
            <h2 className='mb-5 font-display font-extrabold text-black text-[clamp(28px,2.8vw,36px)] tracking-[-0.02em]'>Eerder</h2>
            <ul className='border-b-(length:--contour-width-sm) border-ink'>
              {eerder.map(item => (
                <li key={item.slug} className='border-t-(length:--contour-width-sm) border-ink'>
                  <Link href={`/nieuws/${item.slug}`} className='group flex flex-wrap items-baseline gap-x-8 gap-y-2 py-[22px]'>
                    <span className='flex-[0_0_180px] text-[15px] font-bold text-secondary-hover'>{formatLongDate(item.datum)}</span>
                    <span className='flex-[1_1_420px] min-w-0 flex flex-col gap-1.5'>
                      <span className='font-display font-bold text-2xl leading-[1.15] text-black group-hover:underline underline-offset-4'>{item.titel}</span>
                      <span className='leading-relaxed text-gray-700'>{item.samenvatting}</span>
                    </span>
                    <ArrowRight className='h-[22px] w-[22px] text-primary-text transition-transform group-hover:translate-x-1' strokeWidth={2.5} aria-hidden='true' />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      <ContourCta cta={pagina.cta} />
    </PageWithAnnouncements>
  );
}
