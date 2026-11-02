import type {Metadata} from 'next';
import Image from 'next/image';
import {PageWithAnnouncements} from '@components/layout/page-with-announcements';
import {ContourCta, PageIntro} from '@components/layout/contour-parts';
import {content} from '@lib/content';
import {generateMetadata as generateSeoMetadata} from '@lib/seo';

/** Levels in order, each with its own logo color for the label. */
const niveaus = [
  {niveau: 'goud', kop: 'Goud', label: 'bg-logo-orange text-black'},
  {niveau: 'zilver', kop: 'Zilver', label: 'bg-gray-100 text-black'},
  {niveau: 'brons', kop: 'Brons', label: 'bg-[#ffedd5] text-black'},
  {niveau: 'partner', kop: 'Partners', label: 'bg-logo-green text-black'},
] as const;

export function generateMetadata(): Metadata {
  const pagina = content.getPagina('sponsors');
  return generateSeoMetadata({title: pagina.titel, description: pagina.beschrijving, url: '/sponsors'});
}

export default function Page() {
  const pagina = content.getPagina('sponsors');

  return (
    <PageWithAnnouncements>
      <PageIntro titel={pagina.hero.titel} intro={pagina.hero.ondertitel} />
      <section className='px-5 pb-[clamp(56px,6vw,80px)]'>
        <ul className='max-w-[1240px] mx-auto grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-7'>
          {niveaus.map(({niveau, kop, label}) => {
            const sponsors = pagina.sponsors.filter(sponsor => sponsor.niveau === niveau);

            return (
              <li key={niveau} className='flex flex-col gap-4 bg-white rounded-tile contour-sm shadow-hard-md p-6'>
                <h2 className='self-start'>
                  <span className={`inline-block rounded-full contour-xs px-3 py-1 font-display font-bold text-xl ${label}`}>{kop}</span>
                </h2>
                {sponsors.length === 0
                  ? <p className='leading-relaxed text-gray-700'>{pagina.legeTekst[niveau]}</p>
                  : (
                    <ul className='flex flex-wrap items-center gap-6'>
                      {sponsors.map(sponsor => {
                        const inhoud = sponsor.logo
                          ? <Image src={sponsor.logo.src} width={sponsor.logo.width} height={sponsor.logo.height} alt={sponsor.naam} className='h-16 w-auto object-contain' />
                          : <span className='font-display font-bold text-xl text-black'>{sponsor.naam}</span>;

                        return (
                          <li key={sponsor.naam}>
                            {sponsor.link
                              ? (
                                <a href={sponsor.link} target='_blank' rel='noopener noreferrer sponsored' className='block rounded-control hover:opacity-80 transition-opacity'>
                                  {inhoud}
                                  <span className='sr-only'> (opent in nieuw venster)</span>
                                </a>
                              )
                              : inhoud}
                          </li>
                        );
                      })}
                    </ul>
                  )}
              </li>
            );
          })}
        </ul>
      </section>
      <ContourCta cta={pagina.cta} />
    </PageWithAnnouncements>
  );
}
