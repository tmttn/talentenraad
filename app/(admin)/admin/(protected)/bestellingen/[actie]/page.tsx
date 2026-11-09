import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {ClipboardList, Download, ListChecks} from 'lucide-react';
import {requireEditorSession} from '@lib/auth/require-admin';
import {actieStatus, formatDag} from '@lib/bestellingen/acties';
import {tellers, zoekBestellingen} from '@lib/bestellingen/beheer';
import {formatKorteCode} from '@lib/bestellingen/codes';
import {formatMededeling} from '@lib/bestellingen/mededeling';
import {kanBetalingBevestigen} from '@lib/bestellingen/rechten';
import {regelNaam, statusLabels} from '@lib/bestellingen/status';
import {content} from '@lib/content';
import {isVoorbeeldRekening} from '@lib/content/iban';
import {todayString} from '@lib/dates';
import {orderStatuses} from '@lib/db/schema';
import {BestellingenTabel} from '@features/admin/bestellingen/bestellingen-tabel';
import {Melding, TellerGrid, VoorbeeldRekeningMelding} from '@features/admin/bestellingen/parts';
import {betaaldActie} from '../actions';

export const metadata: Metadata = {title: 'Bestellingen'};
export const dynamic = 'force-dynamic';

type PageProperties = {
  params: Promise<{actie: string}>;
  searchParams: Promise<{zoek?: string; status?: string; moment?: string; melding?: string}>;
};

const control = 'rounded-input border border-gray-300 bg-white px-3 py-2.5 text-base focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none';
const secondary = 'inline-flex items-center gap-2 px-3.5 py-2.5 text-[15px] font-semibold text-gray-700 bg-white border border-gray-300 rounded-button hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary';

export default async function ActieBestellingenPage({params, searchParams}: Readonly<PageProperties>) {
  const session = await requireEditorSession();
  const {actie: slug} = await params;
  if (!/^[a-z\d]+(?:-[a-z\d]+)*$/.test(slug)) {
    notFound();
  }

  const {zoek, status, moment, melding} = await searchParams;
  const actie = content.getActie(slug);
  const [telling, orders] = await Promise.all([tellers(slug), zoekBestellingen(slug, {zoek, status, afhaalId: moment})]);
  if (!actie && telling.bestellingen + telling.terugTeBetalen === 0 && orders.length === 0) {
    notFound();
  }

  const momenten = actie?.afhalen ?? [];

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap justify-between items-end gap-4'>
        <div>
          <p className='text-sm'><Link href='/admin/bestellingen' className='text-primary-text hover:underline'>Bestellingen</Link></p>
          <h1 className='text-2xl sm:text-3xl font-bold text-gray-800'>{actie?.titel ?? slug}</h1>
          {actie && (
            <p className='text-sm text-gray-600'>
              {actieStatus(actie, todayString()) === 'gesloten' ? 'Gesloten' : 'Open'} tot en met {formatDag(actie.bestellen.tot)} · {momenten.length} afhaalmoment{momenten.length === 1 ? '' : 'en'}
            </p>
          )}
        </div>
        <div className='flex flex-wrap gap-2'>
          <Link href={`/admin/bestellingen/${slug}/productielijst`} className={secondary}>
            <ListChecks className='w-4 h-4' aria-hidden='true' />
            Productielijst
          </Link>
          <Link href={`/admin/bestellingen/${slug}/afhaallijst`} className={secondary}>
            <ClipboardList className='w-4 h-4' aria-hidden='true' />
            Afhaallijst
          </Link>
          <a href={`/api/admin/bestellingen/${slug}/export`} className={secondary}>
            <Download className='w-4 h-4' aria-hidden='true' />
            Export CSV
          </a>
        </div>
      </div>

      {actie && isVoorbeeldRekening(actie.betalen.rekening.iban) && <VoorbeeldRekeningMelding slug={actie.slug} />}
      <Melding code={melding} />
      <TellerGrid tellers={telling} />

      <form method='get' className='flex flex-wrap gap-3 items-end'>
        <div className='flex-[1_1_280px] flex flex-col gap-1.5'>
          <label htmlFor='zoek' className='text-sm font-semibold text-gray-700'>Zoeken</label>
          <input id='zoek' name='zoek' type='search' defaultValue={zoek} placeholder='Naam, nummer, code of mededeling' className={control} />
        </div>
        <div className='flex flex-col gap-1.5'>
          <label htmlFor='status' className='text-sm font-semibold text-gray-700'>Status</label>
          <select id='status' name='status' defaultValue={status ?? ''} className={control}>
            <option value=''>Alle</option>
            {orderStatuses.map(value => <option key={value} value={value}>{statusLabels[value]}</option>)}
          </select>
        </div>
        {momenten.length > 1 && (
          <div className='flex flex-col gap-1.5'>
            <label htmlFor='moment' className='text-sm font-semibold text-gray-700'>Afhaalmoment</label>
            <select id='moment' name='moment' defaultValue={moment ?? ''} className={control}>
              <option value=''>Alle</option>
              {momenten.map(item => <option key={item.id} value={item.id}>{formatDag(item.datum)}</option>)}
            </select>
          </div>
        )}
        <button type='submit' className={secondary}>Toon</button>
      </form>

      <BestellingenTabel
        actie={slug}
        kanBetalen={kanBetalingBevestigen(session)}
        action={betaaldActie}
        rijen={orders.map(order => ({
          id: order.id,
          nummer: order.nummer,
          naam: order.naam,
          inhoud: order.regels.map(regel => `${regel.aantal} × ${regelNaam(regel)}`).join(', '),
          totaalCent: order.totaalCent,
          moment: order.afhaalLabel.split(',')[0],
          mededeling: formatMededeling(order.mededeling),
          korteCode: formatKorteCode(order.korteCode),
          status: order.status,
        }))}
      />
    </div>
  );
}
