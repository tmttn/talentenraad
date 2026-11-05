import type {Metadata} from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {notFound, permanentRedirect} from 'next/navigation';
import {connection} from 'next/server';
import {ArrowLeft} from 'lucide-react';
import {SpeechBubble} from '@components/ui';
import {PageWithAnnouncements} from '@components/layout/page-with-announcements';
import {LogoStripe} from '@components/layout/contour-parts';
import {BestelFormulier} from '@features/bestellen/bestel-formulier';
import {afhaalLabel, formatDag, kanBestellen, type GeslotenReden} from '@lib/bestellingen/acties';
import {formatEuro} from '@lib/bestellingen/geld';
import {bestelFormPurpose, verbruikteVoorraad} from '@lib/bestellingen/plaatsen';
import {content} from '@lib/content';
import {todayString} from '@lib/dates';
import {db} from '@lib/db';
import {issueFormToken} from '@lib/form-timing';
import {generateMetadata as generateSeoMetadata} from '@lib/seo';

type PageProperties = {
  params: Promise<{slug: string}>;
};

export async function generateMetadata({params}: PageProperties): Promise<Metadata> {
  const {slug} = await params;
  const actie = content.getActie(slug);
  if (!actie) {
    return {title: 'Actie niet gevonden'};
  }

  return generateSeoMetadata({title: actie.titel, description: actie.samenvatting, url: `/acties/${actie.slug}`, image: actie.afbeelding?.src});
}

const pill = 'text-sm font-bold text-black border-(length:--contour-width-xs) border-ink rounded-full px-3 py-1';

const geslotenTekst = (reden: GeslotenReden, van: string): {titel: string; tekst: string} => {
  switch (reden) {
    case 'binnenkort': {
      return {titel: `Bestellen kan vanaf ${formatDag(van)}`, tekst: 'Kom dan terug: het formulier staat hier vanaf die dag.'};
    }

    case 'gesloten': {
      return {titel: 'De bestelperiode is voorbij', tekst: 'Bestellen kan niet meer. Heb je al besteld? Je bestelling vind je via de link in je mail.'};
    }

    default: {
      return {titel: 'Bestellen kan binnenkort', tekst: 'We leggen de laatste hand aan deze actie.'};
    }
  }
};

export default async function ActiePage({params}: Readonly<PageProperties>) {
  // Stock, the period and the form token are per request
  await connection();
  const {slug} = await params;
  const actie = content.getActie(slug);
  if (!actie) {
    notFound();
  }

  if (actie.slug !== slug) {
    permanentRedirect(`/acties/${actie.slug}`);
  }

  const {rekening} = content.getSite().bestellingen;
  const open = kanBestellen(actie, rekening.iban, todayString());
  const metVoorraad = actie.producten.filter(product => product.voorraad !== undefined);
  const verbruikt = verbruikteVoorraad(db, actie.slug, metVoorraad.map(product => product.id));
  const over = Object.fromEntries(metVoorraad.map(product => [product.id, Math.max(0, product.voorraad! - (verbruikt.get(product.id) ?? 0))]));
  const plaatsen = [...new Set(actie.afhalen.map(moment => moment.plaats))];

  return (
    <PageWithAnnouncements>
      <section className='px-5 pt-[clamp(32px,4vw,48px)] pb-[clamp(24px,3vw,40px)]'>
        <div className='max-w-[1240px] mx-auto flex flex-col gap-4'>
          <Link href='/acties' className='self-start inline-flex items-center gap-2 font-bold text-primary-text underline-offset-4 hover:underline'>
            <ArrowLeft className='h-[18px] w-[18px]' strokeWidth={2.5} aria-hidden='true' />
            Alle acties
          </Link>
          <LogoStripe />
          <h1 lang='nl' className='font-display font-extrabold text-black text-[clamp(40px,5vw,66px)] leading-[0.98] tracking-[-0.02em] hyphens-auto break-words'>{actie.titel}</h1>
          <p className='max-w-[620px] text-gray-700 text-[clamp(17px,1.4vw,19px)] leading-relaxed'>{actie.samenvatting}</p>
          <div className='flex flex-wrap gap-2.5 pt-1'>
            <span className={`${pill} bg-logo-orange`}>Bestellen tot en met {formatDag(actie.bestellen.tot)}</span>
            {plaatsen.length === 1 && <span className={`${pill} bg-white`}>Afhalen: {plaatsen[0]}</span>}
          </div>
        </div>
      </section>

      <section className='px-5 pb-[clamp(64px,7vw,96px)]'>
        <div className='max-w-[1240px] mx-auto flex flex-col gap-10'>
          {open.open
            ? (
              <BestelFormulier
                actie={{
                  slug: actie.slug,
                  producten: actie.producten,
                  afhalen: actie.afhalen,
                  vraag: actie.vraag,
                  wijzen: actie.betalen.wijzen,
                  afhaalLabels: Object.fromEntries(actie.afhalen.map(moment => [moment.id, afhaalLabel(moment)])),
                }}
                over={over}
                formToken={issueFormToken(bestelFormPurpose)}
              />
            )
            : (
              <div className='flex flex-wrap gap-[clamp(28px,4vw,48px)] items-start'>
                <ul className='flex-[999_1_560px] min-w-0 flex flex-col gap-4'>
                  {actie.producten.map(product => (
                    <li key={product.id} className='flex flex-wrap items-baseline justify-between gap-3 bg-white rounded-tile contour-sm px-[22px] py-5'>
                      <span className='flex flex-col gap-1'>
                        <span className='font-display font-bold text-2xl text-black'>{product.naam}</span>
                        {product.info && <span className='text-[15px] text-gray-600'>{product.info}</span>}
                      </span>
                      <span className='text-xl font-extrabold text-black'>{formatEuro(product.prijs)}</span>
                    </li>
                  ))}
                </ul>
                <div className='flex-[1_1_360px] min-w-0'>
                  <SpeechBubble size='md' tone='orange'>
                    <div role='status' className='flex flex-col gap-2'>
                      <h2 className='font-display font-extrabold text-2xl text-black'>{geslotenTekst(open.reden, actie.bestellen.van).titel}</h2>
                      <p className='text-[17px] text-black'>{geslotenTekst(open.reden, actie.bestellen.van).tekst}</p>
                    </div>
                  </SpeechBubble>
                </div>
              </div>
            )}

          {(actie.html.trim() || actie.afbeelding) && (
            <div className='flex flex-wrap gap-[clamp(28px,4vw,48px)] items-start'>
              {actie.html.trim() && (
                <div
                  className='flex-[999_1_560px] min-w-0 max-w-[720px] prose prose-lg prose-p:text-gray-700 prose-headings:font-display prose-headings:text-black prose-a:text-primary-text'
                  dangerouslySetInnerHTML={{__html: actie.html}}
                />
              )}
              {actie.afbeelding && (
                <div className='flex-[1_1_360px] min-w-0 rounded-tile contour-sm overflow-hidden bg-gray-50'>
                  <Image
                    src={actie.afbeelding.src}
                    width={actie.afbeelding.width}
                    height={actie.afbeelding.height}
                    alt={`Affiche van ${actie.titel}`}
                    sizes='(min-width: 1240px) 420px, 100vw'
                    className='w-full h-auto object-contain'
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </PageWithAnnouncements>
  );
}
