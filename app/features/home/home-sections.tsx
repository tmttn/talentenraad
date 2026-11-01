import Image from 'next/image';
import Link from 'next/link';
import {Card} from '@components/ui';
import type {Activiteit, NieuwsItem, Teamlid} from '@lib/content';
import {parseLocalDate} from '@lib/dates';
import {contourTitle as sectionTitle, LogoStripe} from '@components/layout/contour-parts';
import {TeamAvatar} from '@features/team/team-avatar';

const linkClass = 'font-bold text-primary-text underline';

/** Mission quote with the three logo colors as a small stripe above it. */
function HomeQuote({citaat, bijschriftHtml}: Readonly<{citaat: string; bijschriftHtml: string}>) {
  return (
    <section className='mt-[clamp(64px,7vw,96px)] bg-gray-50 px-5 py-[clamp(64px,8vw,112px)]'>
      <figure className='max-w-[900px] mx-auto flex flex-col gap-[22px] items-start'>
        <LogoStripe />
        <blockquote className='font-display font-bold text-gray-900 text-[clamp(28px,3vw,40px)] leading-tight tracking-[-0.01em]'>
          {citaat}
        </blockquote>
        <figcaption className='text-[17px] leading-relaxed text-gray-600' dangerouslySetInnerHTML={{__html: bijschriftHtml}} />
      </figure>
    </section>
  );
}

const formatLongDate = (datum: string) => parseLocalDate(datum)
  .toLocaleDateString('nl-BE', {day: 'numeric', month: 'long', year: 'numeric'});

function NewsCard({item}: Readonly<{item: NieuwsItem}>) {
  return (
    <Card variant='contour' padding='none' href={`/nieuws/${item.slug}`} hover className='flex flex-col'>
      {item.afbeelding && (
        <Image
          src={item.afbeelding.src}
          width={item.afbeelding.width}
          height={item.afbeelding.height}
          alt=''
          className='h-60 w-full object-cover border-b-(length:--contour-width-sm) border-ink'
        />
      )}
      <span className='flex flex-col gap-2 p-6'>
        <span className='text-sm font-bold text-secondary-hover'>{formatLongDate(item.datum)}</span>
        <span className='font-display font-bold text-[26px] leading-[1.15] text-black'>{item.titel}</span>
        <span className='leading-relaxed text-gray-700'>{item.samenvatting}</span>
      </span>
    </Card>
  );
}

function TeamPreview({leden}: Readonly<{leden: Teamlid[]}>) {
  return (
    <div className='flex-[1_1_360px] min-w-0 flex flex-col gap-5'>
      <h2 className={sectionTitle}>Wie we zijn</h2>
      <p className='text-[17px] leading-relaxed text-gray-700'>
        Een groep ouders van het Talentenhuis. Elke ouder kan lid worden, en helpende handen zijn altijd welkom.
      </p>
      {leden.length > 0 && (
        <ul className='flex flex-wrap gap-4 sm:gap-5'>
          {leden.map((lid, index) => (
            <li key={lid.slug} className='flex flex-col items-center gap-2 w-[104px] text-center'>
              <TeamAvatar lid={lid} index={index} />
              <span className='font-bold text-[15px] text-gray-900'>{lid.naam}</span>
              <span className='text-[13px] text-gray-600'>{lid.rol}</span>
            </li>
          ))}
        </ul>
      )}
      <Link href='/over-ons' className={linkClass}>Maak kennis met het team</Link>
    </div>
  );
}

/** Latest news item next to a short team introduction. */
function HomeNewsAndTeam({nieuws, team}: Readonly<{nieuws?: NieuwsItem; team: Teamlid[]}>) {
  return (
    <section className='px-5 py-[clamp(64px,7vw,96px)]'>
      <div className='max-w-[1240px] mx-auto flex flex-wrap gap-12'>
        {nieuws && (
          <div className='flex-[1_1_520px] min-w-0 flex flex-col gap-6'>
            <div className='flex flex-wrap items-end justify-between gap-3'>
              <h2 className={sectionTitle}>Nieuws</h2>
              <Link href='/nieuws' className={linkClass}>Alle berichten</Link>
            </div>
            <NewsCard item={nieuws} />
          </div>
        )}
        <TeamPreview leden={team} />
      </div>
    </section>
  );
}

/** Photo wall of past activities that have a picture; the first one is large. */
function HomePhotoWall({activiteiten}: Readonly<{activiteiten: Activiteit[]}>) {
  const metFoto = activiteiten.filter(activiteit => activiteit.afbeelding).slice(0, 5);
  if (metFoto.length === 0) {
    return null;
  }

  return (
    <section className='px-5 pb-[clamp(64px,7vw,96px)]'>
      <div className='max-w-[1240px] mx-auto flex flex-col gap-7'>
        <div className='flex flex-wrap justify-between items-end gap-3'>
          <h2 className={sectionTitle}>Zo was het</h2>
          <p className='text-gray-600'>Foto&apos;s van onze laatste activiteiten</p>
        </div>
        <ul className='grid grid-cols-[repeat(auto-fit,minmax(min(100%,150px),1fr))] auto-rows-[clamp(140px,14vw,200px)] gap-4'>
          {metFoto.map((activiteit, index) => (
            <li key={activiteit.slug} className={index === 0 ? 'col-span-2 row-span-2' : ''}>
              <Link
                href={`/activiteiten/${activiteit.slug}`}
                className='relative block h-full rounded-tile contour-sm overflow-hidden bg-gray-100'
              >
                <Image
                  src={activiteit.afbeelding!.src}
                  alt=''
                  fill
                  sizes={index === 0 ? '(min-width: 1240px) 620px, 100vw' : '(min-width: 1240px) 310px, 50vw'}
                  className='object-cover'
                />
                <span className='absolute left-3 bottom-3 right-3 w-fit rounded-full bg-white contour-xs px-3 py-1 text-sm font-bold text-black'>
                  {activiteit.titel}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export {HomeQuote, HomeNewsAndTeam, HomePhotoWall};
