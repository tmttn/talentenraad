import Link from 'next/link';
import {notFound} from 'next/navigation';
import {ArrowLeft, CheckCircle2, Search} from 'lucide-react';
import {requireStaffSession} from '@lib/auth/require-admin';
import {afhaalLabel} from '@lib/bestellingen/acties';
import {formatTijd} from '@lib/bestellingen/afgifte';
import {afhaalTeller, netMeegegeven, zoekVoorAfhalen} from '@lib/bestellingen/afhalen';
import {formatKorteCode} from '@lib/bestellingen/codes';
import {statusLabels} from '@lib/bestellingen/status';
import {content} from '@lib/content';
import {getSiteUrl} from '@lib/email/mailer';
import {Scanner} from '@features/afhalen/scanner';

export const dynamic = 'force-dynamic';

type PageProperties = {
  params: Promise<{actie: string; moment: string}>;
  searchParams: Promise<{zoek?: string; meegegeven?: string}>;
};

const slug = /^[a-z\d]+(?:-[a-z\d]+)*$/;

/** Scanning: the counter, the camera, searching by name or code, and what was just handed over. */
export default async function ScannerPage({params, searchParams}: Readonly<PageProperties>) {
  await requireStaffSession();
  const {actie, moment} = await params;
  if (!slug.test(actie) || !slug.test(moment)) {
    notFound();
  }

  const {zoek = '', meegegeven} = await searchParams;
  const [teller, recent, resultaten] = await Promise.all([afhaalTeller(actie, moment), netMeegegeven(actie, moment), zoekVoorAfhalen(actie, zoek)]);
  const inhoud = content.getActie(actie);
  const item = inhoud?.afhalen.find(entry => entry.id === moment);
  const procent = teller.totaal === 0 ? 0 : Math.round((teller.afgehaald / teller.totaal) * 100);

  return (
    <>
      <header className='bg-white border-b border-gray-200 px-4 py-3.5 flex flex-col gap-2.5'>
        <div className='flex justify-between items-start gap-3'>
          <div className='flex flex-col min-w-0'>
            <h1 className='text-lg font-bold'>Afhalen</h1>
            <span className='text-sm text-gray-600'>{inhoud?.titel ?? actie}{item ? ` · ${afhaalLabel(item)}` : ''}</span>
          </div>
          <Link href='/admin/afhalen' className='shrink-0 px-3 py-2 text-sm font-semibold text-primary-text bg-brand-primary-50 rounded-button focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'>Wissel</Link>
        </div>
        <div className='flex flex-col gap-1.5'>
          <div className='flex justify-between text-sm'>
            <span className='font-semibold'>{teller.afgehaald} van {teller.totaal} afgehaald</span>
            <span className='text-gray-600'>{teller.totaal - teller.afgehaald} te gaan</span>
          </div>
          <div className='h-2 bg-gray-200 rounded-full overflow-hidden' role='progressbar' aria-label='Afgehaald' aria-valuemin={0} aria-valuemax={teller.totaal} aria-valuenow={teller.afgehaald}>
            <div className='h-full bg-primary' style={{width: `${procent}%`}} />
          </div>
        </div>
      </header>

      <main className='flex-1 p-4 flex flex-col gap-4'>
        {meegegeven && (
          <p role='status' className='flex items-center gap-2 p-3 rounded-card border border-green-200 bg-green-50 font-semibold text-green-800'>
            <CheckCircle2 className='w-5 h-5' aria-hidden='true' />
            Nr. {meegegeven} meegegeven.
          </p>
        )}

        <Scanner actie={actie} moment={moment} siteUrl={getSiteUrl()} />

        <form method='get' className='flex flex-col gap-2'>
          <label htmlFor='zoek' className='text-sm font-semibold text-gray-700'>Geen QR-code? Zoek op naam, nummer of code</label>
          <div className='flex gap-2'>
            <input id='zoek' name='zoek' type='search' defaultValue={zoek} placeholder='bv. K7P-4QX' autoComplete='off' className='flex-1 min-w-0 px-3.5 py-3 text-[17px] bg-white border border-gray-300 rounded-button focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none' />
            <button type='submit' aria-label='Zoeken' className='px-4 bg-white border border-gray-300 rounded-button hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'>
              <Search className='w-5 h-5' aria-hidden='true' />
            </button>
          </div>
        </form>

        {zoek.trim() !== '' && (
          <section aria-label='Zoekresultaten' className='flex flex-col gap-2'>
            {resultaten.length === 0 && <p className='text-gray-700'>Niets gevonden voor “{zoek}”.</p>}
            {resultaten.map(resultaat => (
              <Link
                key={resultaat.token}
                href={`/admin/afhalen/${actie}/${moment}/${resultaat.token}`}
                className='flex justify-between items-center gap-3 p-3.5 bg-white border border-gray-200 rounded-card hover:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
              >
                <span className='flex flex-col min-w-0'>
                  <span className='font-bold truncate'>{resultaat.naam}</span>
                  <span className='text-sm text-gray-600'>Nr. {resultaat.nummer} · {formatKorteCode(resultaat.korteCode)}{resultaat.afhaalId === moment ? '' : ` · ${resultaat.afhaalLabel.split(',')[0]}`}</span>
                </span>
                <span className='text-sm text-gray-700 shrink-0'>{statusLabels[resultaat.status]}</span>
              </Link>
            ))}
          </section>
        )}

        {recent.length > 0 && (
          <section aria-labelledby='recent-titel' className='flex flex-col gap-2'>
            <h2 id='recent-titel' className='text-sm font-semibold text-gray-700'>Net meegegeven</h2>
            {recent.map(order => (
              <p key={order.nummer} className='flex justify-between p-3 bg-white border border-gray-200 rounded-card text-[15px]'>
                <span>Nr. {order.nummer} · {order.stuks} {order.stuks === 1 ? 'stuk' : 'stuks'}</span>
                <span className='text-gray-600'>{formatTijd(order.afgehaaldOp)}</span>
              </p>
            ))}
          </section>
        )}

        <Link href='/admin/afhalen' className='self-start inline-flex items-center gap-1.5 text-sm font-semibold text-primary-text hover:underline'>
          <ArrowLeft className='w-4 h-4' aria-hidden='true' />
          Ander afhaalmoment
        </Link>
      </main>
    </>
  );
}
