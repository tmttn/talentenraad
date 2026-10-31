import type {Metadata} from 'next';
import Image from 'next/image';
import {PageWithAnnouncements} from '@components/layout/page-with-announcements';
import {PageHero, PageUnifiedCta} from '@components/layout/page-parts';
import {Section} from '@components/section';
import {content} from '@lib/content';
import {generateMetadata as generateSeoMetadata} from '@lib/seo';

const niveaus = [
  {niveau: 'goud', kop: 'Gouden Sponsors', background: 'white'},
  {niveau: 'zilver', kop: 'Zilveren Sponsors', background: 'light'},
  {niveau: 'brons', kop: 'Bronzen Sponsors', background: 'white'},
  {niveau: 'partner', kop: 'Partners', background: 'light'},
] as const;

export function generateMetadata(): Metadata {
  const pagina = content.getPagina('sponsors');
  return generateSeoMetadata({title: pagina.titel, description: pagina.beschrijving, url: '/sponsors'});
}

export default function Page() {
  const pagina = content.getPagina('sponsors');

  return (
    <PageWithAnnouncements>
      <PageHero size='small' titel={pagina.hero.titel} ondertitel={pagina.hero.ondertitel} />
      {niveaus.map(({niveau, kop, background}) => {
        const sponsors = pagina.sponsors.filter(sponsor => sponsor.niveau === niveau);

        return (
          <Section key={niveau} background={background} size='large'>
            <h2 className='text-[1.75rem] font-semibold text-gray-800 text-center mb-4'>{kop}</h2>
            {sponsors.length === 0
              ? <p className='text-gray-500 text-center'>{pagina.legeTekst[niveau]}</p>
              : (
                <ul className='flex flex-wrap items-center justify-center gap-8'>
                  {sponsors.map(sponsor => {
                    const inhoud = sponsor.logo
                      ? <Image src={sponsor.logo.src} width={sponsor.logo.width} height={sponsor.logo.height} alt={sponsor.naam} className='h-16 w-auto object-contain' />
                      : <span className='text-lg font-medium text-gray-800'>{sponsor.naam}</span>;

                    return (
                      <li key={sponsor.naam}>
                        {sponsor.link
                          ? <a href={sponsor.link} target='_blank' rel='noopener noreferrer sponsored' className='block hover:opacity-80 transition-opacity'>{inhoud}</a>
                          : inhoud}
                      </li>
                    );
                  })}
                </ul>
              )}
          </Section>
        );
      })}
      <PageUnifiedCta variant='full' cta={pagina.cta} />
    </PageWithAnnouncements>
  );
}
