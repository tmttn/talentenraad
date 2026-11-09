import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {Check} from 'lucide-react';
import {requireEditorSession} from '@lib/auth/require-admin';
import {alleBestellingen} from '@lib/bestellingen/beheer';
import {afhaallijst, type AfhaalRij} from '@lib/bestellingen/overzicht';
import {content} from '@lib/content';
import {PrintButton} from '@features/admin/bestellingen/print-button';

export const metadata: Metadata = {title: 'Afhaallijst'};
export const dynamic = 'force-dynamic';

type PageProperties = {
  params: Promise<{actie: string}>;
  searchParams: Promise<{moment?: string}>;
};

const statusTekst = (rij: AfhaalRij) => {
  if (rij.status === 'afgehaald') {
    return `Afgehaald${rij.afgehaaldOm ? ` ${rij.afgehaaldOm}` : ''}`;
  }

  return rij.status === 'betaald' ? 'Betaald' : 'Niet betaald';
};

const filterLink = (actief: boolean) => `px-3 py-1.5 text-sm font-semibold rounded-full border ${actief ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`;

/**
 * The printed backup of the pickup app: per pickup moment every order by name, with a box to tick.
 * It lies on the pickup table, so it shows no e-mail, phone or amounts. Each moment starts a new page.
 */
export default async function AfhaallijstPage({params, searchParams}: Readonly<PageProperties>) {
  await requireEditorSession();
  const {actie: slug} = await params;
  const orders = await alleBestellingen(slug);
  const actie = content.getActie(slug);
  if (!actie && orders.length === 0) {
    notFound();
  }

  const {moment} = await searchParams;
  const alle = afhaallijst(orders);
  const lijst = moment ? alle.filter(item => item.afhaalId === moment) : alle;
  const titel = actie?.titel ?? slug;
  const stand = new Date().toLocaleString('nl-BE', {dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Brussels'});

  return (
    <div className='space-y-6 max-w-4xl'>
      <div className='flex flex-wrap justify-between items-end gap-3 print:hidden'>
        <div>
          <p className='text-sm'><Link href={`/admin/bestellingen/${slug}`} className='text-primary-text hover:underline'>{titel}</Link></p>
          <h1 className='text-2xl sm:text-3xl font-bold text-gray-800'>Afhaallijst {titel}</h1>
          <p className='text-sm text-gray-600'>De reserve als scannen niet lukt. Zonder e-mail, telefoon of bedragen: hij ligt op de afhaaltafel. Elk afhaalmoment begint op een nieuwe pagina.</p>
        </div>
        <PrintButton />
      </div>

      {alle.length > 1 && (
        <nav aria-label='Afhaalmoment' className='flex flex-wrap gap-2 print:hidden'>
          <Link href={`/admin/bestellingen/${slug}/afhaallijst`} aria-current={moment ? undefined : 'page'} className={filterLink(!moment)}>Alle momenten</Link>
          {alle.map(item => (
            <Link key={item.afhaalId} href={`/admin/bestellingen/${slug}/afhaallijst?moment=${item.afhaalId}`} aria-current={moment === item.afhaalId ? 'page' : undefined} className={filterLink(moment === item.afhaalId)}>
              {item.label.split(',')[0]}
            </Link>
          ))}
        </nav>
      )}

      {lijst.length === 0 && <p className='text-gray-600'>Nog geen bestellingen.</p>}
      {lijst.map((item, index) => (
        <section key={item.afhaalId} aria-labelledby={`moment-${item.afhaalId}`} className={`bg-white rounded-card border border-gray-200 p-5 space-y-3 print:border-0 print:p-0 print:rounded-none ${index > 0 ? 'print:break-before-page' : ''}`}>
          <div className='flex flex-wrap justify-between items-baseline gap-x-4 gap-y-1'>
            <h2 id={`moment-${item.afhaalId}`} className='text-lg font-bold text-gray-900'>{titel} · {item.label}</h2>
            <p className='text-sm text-gray-600'>{item.plaats} · {item.rijen.length} bestelling{item.rijen.length === 1 ? '' : 'en'} · stand van {stand}</p>
          </div>
          <table className='w-full table-fixed border-collapse text-[15px]'>
            <thead>
              <tr className='border-b-2 border-gray-900 text-left text-sm'>
                <th scope='col' className='py-1.5 pr-2 w-[9mm]'><span className='sr-only'>Meegegeven</span></th>
                <th scope='col' className='py-1.5 pr-3 w-[30%]'>Naam</th>
                <th scope='col' className='py-1.5 pr-3 w-[17%] whitespace-nowrap'>Nr. · code</th>
                <th scope='col' className='py-1.5 pr-3'>Producten</th>
                <th scope='col' className='py-1.5 w-[17%]'>Status</th>
              </tr>
            </thead>
            <tbody>
              {item.rijen.map(rij => (
                <tr key={rij.nummer} className='border-b border-gray-300 align-top break-inside-avoid'>
                  <td className='py-2 pr-2'>
                    <span aria-hidden='true' className='inline-flex items-center justify-center w-[6mm] h-[6mm] border-2 border-gray-900 rounded-sm'>
                      {rij.status === 'afgehaald' && <Check className='w-4 h-4' strokeWidth={3} />}
                    </span>
                  </td>
                  <td className='py-2 pr-3'>
                    <span className='font-semibold text-gray-900'>{rij.naam}</span>
                    {rij.kind && <span className='block text-sm text-gray-700'>{rij.kind}</span>}
                  </td>
                  <td className='py-2 pr-3 whitespace-nowrap tabular-nums'>{rij.nummer} · <span className='font-mono'>{rij.korteCode}</span></td>
                  <td className='py-2 pr-3'>{rij.producten}</td>
                  <td className={`py-2 whitespace-nowrap ${rij.status === 'wacht' ? 'font-bold text-red-700' : 'text-gray-700'}`}>{statusTekst(rij)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}
