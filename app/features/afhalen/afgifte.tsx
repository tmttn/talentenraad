import Link from 'next/link';
import {
  ArrowLeft, Ban, CalendarClock, Check, CircleAlert, Wallet,
} from 'lucide-react';
import {afgifte, alAfgehaaldTekst} from '@lib/bestellingen/afgifte';
import type {OrderMetRegels} from '@lib/bestellingen/bestellingen';
import {formatKorteCode} from '@lib/bestellingen/codes';
import {formatEuro} from '@lib/bestellingen/geld';
import {AfgifteLijst} from './afgifte-lijst';

type Properties = {
  order: OrderMetRegels;
  /** The sale and pickup moment this helper is at. */
  waar: {actie: string; moment: string};
  teller: {afgehaald: number; totaal: number};
  /** Only members with access to the bank account get 'Cash ontvangen'; the server action checks again. */
  magCash: boolean;
  fout?: string;
  /** For admins and editors: the order in the order management, and the page as the parent sees it. */
  beheerHref?: string;
  ouderHref?: string;
  now?: Date;
  geefMeeAction: (data: FormData) => Promise<void>;
  cashAction: (data: FormData) => Promise<void>;
};

const alarm = 'flex flex-col gap-2 p-[18px] rounded-card border-2 border-red-700 bg-red-50 text-red-900';
const knop = 'flex w-full items-center justify-center gap-2 min-h-14 px-4 text-[19px] font-bold rounded-button focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2';

/**
 * The hand-over screen after a scan: is it paid, for this moment, not handed over yet; then the
 * products, large, and 'Alles meegegeven'. Shows only what a helper may see: name (and child),
 * products, note and the open amount of this order. Never e-mail or phone.
 */
export function Afgifte({
  order, waar, teller, magCash, fout, beheerHref, ouderHref, now = new Date(), geefMeeAction, cashAction,
}: Readonly<Properties>) {
  const {toestand, anderMoment, magMeegeven} = afgifte(order, waar);
  const scanner = `/admin/afhalen/${waar.actie}/${waar.moment}`;
  const regels = order.regels.map(regel => ({
    id: regel.id, aantal: regel.aantal, naam: regel.naam, keuzes: regel.keuzes.map(keuze => keuze.keuze).join(', '),
  }));
  const verborgen = (
    <>
      <input type='hidden' name='id' value={order.id} />
      <input type='hidden' name='actie' value={waar.actie} />
      <input type='hidden' name='moment' value={waar.moment} />
      <input type='hidden' name='token' value={order.token ?? ''} />
    </>
  );
  const kind = [order.kindNaam, order.kindKlas].filter(Boolean).join(' · ');

  return (
    <>
      <header className='bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-2.5'>
        <Link href={scanner} className='inline-flex items-center gap-1.5 px-2.5 py-2 font-semibold text-primary-text rounded-button hover:bg-brand-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'>
          <ArrowLeft className='w-[18px] h-[18px]' aria-hidden='true' />
          Scannen
        </Link>
        <span className='ml-auto text-sm text-gray-600'>{teller.afgehaald} van {teller.totaal}</span>
      </header>

      <main className='flex-1 p-4 flex flex-col gap-4'>
        {fout === 'geen-bank' && (
          <p role='alert' className='p-3.5 rounded-card border border-red-200 bg-red-50 font-semibold text-red-800'>
            Alleen wie toegang heeft tot de bankrekening kan cash ontvangen.
          </p>
        )}

        {toestand.soort === 'klaar' && (
          <p role='status' className='flex items-center gap-2.5 px-3.5 py-3 rounded-card border border-green-200 bg-green-50 font-bold text-green-800'>
            <Check className='w-[22px] h-[22px] shrink-0' aria-hidden='true' />
            {anderMoment ? 'Betaald' : 'Betaald · juist afhaalmoment'}
          </p>
        )}

        {toestand.soort === 'niet-betaald' && (
          <div role='alert' className={alarm}>
            <span className='flex items-center gap-2.5 text-[22px] font-extrabold'>
              <CircleAlert className='w-[26px] h-[26px] shrink-0' aria-hidden='true' />
              Nog niet betaald
            </span>
            <span className='text-[17px] font-bold'>Open bedrag: {formatEuro(toestand.openCent)}</span>
            <span className='leading-normal'>
              {magCash
                ? 'Betaalt de ouder nu cash? Ontvang het bedrag en tik op de knop; daarna kun je meegeven.'
                : 'Geef niets mee. Verwijs de ouder naar wie de betalingen beheert; zodra die de betaling bevestigt, kun je opnieuw scannen.'}
            </span>
          </div>
        )}

        {toestand.soort === 'al-afgehaald' && (
          <div role='alert' className={alarm}>
            <span className='flex items-center gap-2.5 text-[22px] font-extrabold'>
              <CircleAlert className='w-[26px] h-[26px] shrink-0' aria-hidden='true' />
              {alAfgehaaldTekst(toestand.op, toestand.door, now)}
            </span>
            <span className='leading-normal'>Geef niets meer mee. Klopt er iets niet? Vraag het aan wie de bestellingen beheert.</span>
          </div>
        )}

        {toestand.soort === 'geannuleerd' && (
          <div role='alert' className={alarm}>
            <span className='flex items-center gap-2.5 text-[22px] font-extrabold'>
              <Ban className='w-[26px] h-[26px] shrink-0' aria-hidden='true' />
              Geannuleerd
            </span>
            <span className='leading-normal'>Deze bestelling is geannuleerd. Geef niets mee.</span>
          </div>
        )}

        {anderMoment && (
          <div role='alert' className='flex flex-col gap-1 p-3.5 rounded-card border-2 border-amber-500 bg-amber-50 text-amber-900'>
            <span className='flex items-center gap-2.5 text-lg font-extrabold'>
              <CalendarClock className='w-6 h-6 shrink-0' aria-hidden='true' />
              Ander afhaalmoment: {anderMoment}
            </span>
            {magMeegeven && <span className='leading-normal'>Meegeven kan, als het voor jullie in orde is.</span>}
          </div>
        )}

        <div className='flex flex-col gap-0.5'>
          <h1 className='text-[26px] font-extrabold leading-tight break-words'>{order.naam}</h1>
          {kind && <span className='text-[15px] text-gray-700'>Kind: {kind}</span>}
          <span className='text-[15px] text-gray-600'>Bestelling nr. {order.nummer} · {formatKorteCode(order.korteCode)}</span>
        </div>

        <AfgifteLijst regels={regels} gedimd={!magMeegeven} />

        {order.notitie && (
          <div className='flex flex-col gap-1.5'>
            <span className='text-sm font-semibold text-gray-700'>Notitie</span>
            <p className='px-3.5 py-3 rounded-button border border-amber-200 bg-amber-50 text-amber-900 whitespace-pre-line'>{order.notitie}</p>
          </div>
        )}

        {(beheerHref ?? ouderHref) && (
          <div className='flex flex-wrap gap-x-5 gap-y-2'>
            {beheerHref && <Link href={beheerHref} className='text-sm font-semibold text-primary-text hover:underline'>Bestelling in het beheer</Link>}
            {ouderHref && <Link href={ouderHref} className='text-sm font-semibold text-primary-text hover:underline'>Zoals de ouder het ziet</Link>}
          </div>
        )}
      </main>

      <footer className='sticky bottom-0 p-4 bg-white border-t border-gray-200 flex flex-col gap-3'>
        {toestand.soort === 'niet-betaald' && magCash && (
          <form action={cashAction}>
            {verborgen}
            <button type='submit' className={`${knop} text-gray-900 bg-white border border-gray-300 hover:bg-gray-50`}>
              <Wallet className='w-5 h-5' aria-hidden='true' />
              {formatEuro(toestand.openCent)} cash ontvangen
            </button>
          </form>
        )}
        {magMeegeven
          ? (
            <form action={geefMeeAction}>
              {verborgen}
              <button type='submit' className={`${knop} text-white bg-primary hover:bg-primary-hover`}>Alles meegegeven</button>
            </form>
          )
          : (
            <Link href={scanner} className={`${knop} text-gray-900 bg-white border border-gray-300 hover:bg-gray-50`}>Volgende scannen</Link>
          )}
      </footer>
    </>
  );
}
