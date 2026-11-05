import type {Metadata} from 'next';
import Link from 'next/link';
import {ArrowRight} from 'lucide-react';
import {requireEditorSession} from '@lib/auth/require-admin';
import {actieStatus, formatDag} from '@lib/bestellingen/acties';
import {actiesMetBestellingen} from '@lib/bestellingen/beheer';
import {content} from '@lib/content';
import {isVoorbeeldRekening} from '@lib/content/iban';
import {todayString} from '@lib/dates';
import {VoorbeeldRekeningMelding} from '@features/admin/bestellingen/parts';

export const metadata: Metadata = {title: 'Bestellingen'};
export const dynamic = 'force-dynamic';

const statusTekst = {binnenkort: 'Nog niet open', open: 'Open', gesloten: 'Gesloten'} as const;

export default async function BestellingenPage() {
  await requireEditorSession();
  const today = todayString();
  const aantallen = new Map((await actiesMetBestellingen()).map(row => [row.actie, row.aantal]));
  const acties = content.getActies();
  // Orders of a sale that is no longer in content/ stay reachable
  const losse = [...aantallen.keys()].filter(slug => !acties.some(actie => actie.slug === slug));

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl sm:text-3xl font-bold text-gray-800'>Bestellingen</h1>
        <p className='text-gray-500 mt-1'>Kies een actie om de bestellingen te bekijken.</p>
      </div>
      {isVoorbeeldRekening(content.getSite().bestellingen.rekening.iban) && <VoorbeeldRekeningMelding />}
      {acties.length === 0 && losse.length === 0 && (
        <p className='text-gray-600'>Er zijn nog geen acties. Maak er een aan bij <Link href='/admin/content/acties' className='text-primary-text hover:underline'>Content › Acties</Link>.</p>
      )}
      <ul className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
        {[...acties].reverse().map(actie => {
          const status = actieStatus(actie, today);
          return (
            <li key={actie.slug}>
              <Link href={`/admin/bestellingen/${actie.slug}`} className='block bg-white p-5 rounded-card shadow-base hover:shadow-elevated transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'>
                <h2 className='font-semibold text-gray-800'>{actie.titel}</h2>
                <p className='text-sm text-gray-500 mt-1'>
                  {statusTekst[status]} · tot en met {formatDag(actie.bestellen.tot)}
                </p>
                <p className='text-3xl font-bold text-gray-800 mt-2'>{aantallen.get(actie.slug) ?? 0}</p>
                <p className='text-sm text-primary-text mt-3 inline-flex items-center gap-1'>
                  Bestellingen bekijken <ArrowRight className='w-4 h-4' aria-hidden='true' />
                </p>
              </Link>
            </li>
          );
        })}
        {losse.map(slug => (
          <li key={slug}>
            <Link href={`/admin/bestellingen/${slug}`} className='block bg-white p-5 rounded-card shadow-base hover:shadow-elevated transition-shadow'>
              <h2 className='font-semibold text-gray-800'>{slug}</h2>
              <p className='text-sm text-gray-500 mt-1'>Niet meer in de inhoud</p>
              <p className='text-3xl font-bold text-gray-800 mt-2'>{aantallen.get(slug)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
