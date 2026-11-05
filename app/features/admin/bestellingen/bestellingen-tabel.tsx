'use client';

import {useState} from 'react';
import Link from 'next/link';
import {CheckCircle2} from 'lucide-react';
import type {OrderStatus} from '@lib/db/schema';
import {formatEuro} from '@lib/bestellingen/geld';
import {StatusBadge} from './parts';

export type TabelRij = {
  id: string;
  nummer: number;
  naam: string;
  inhoud: string;
  totaalCent: number;
  moment: string;
  mededeling: string;
  korteCode: string;
  status: OrderStatus;
};

type Properties = {
  actie: string;
  rijen: TabelRij[];
  /** Only with access to the bank account: selection and the 'Betaald' button. */
  kanBetalen: boolean;
  action: (data: FormData) => Promise<void>;
};

const cell = 'px-3 py-3 border-b border-gray-100 align-top';

/**
 * The orders of one sale. With access to the bank account, waiting orders can be selected and
 * marked as paid together; the checkboxes are real form fields, so this also works without JavaScript.
 */
export function BestellingenTabel({actie, rijen, kanBetalen, action}: Readonly<Properties>) {
  const [gekozen, setGekozen] = useState<Set<string>>(new Set());
  const kiesbaar = rijen.filter(rij => rij.status === 'wacht');
  const totaal = rijen.filter(rij => gekozen.has(rij.id)).reduce((sum, rij) => sum + rij.totaalCent, 0);
  const allesGekozen = kiesbaar.length > 0 && kiesbaar.every(rij => gekozen.has(rij.id));

  const toggle = (id: string) => {
    setGekozen(previous => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  if (rijen.length === 0) {
    return <p className='text-gray-600'>Geen bestellingen gevonden.</p>;
  }

  return (
    <form action={action} className='space-y-4'>
      <input type='hidden' name='terug' value={`/admin/bestellingen/${actie}`} />
      {kanBetalen && (
        <div className='flex flex-wrap items-center justify-between gap-3 rounded-card border border-pink-200 bg-brand-primary-50 px-4 py-3'>
          <span className='font-semibold text-primary-text' aria-live='polite'>
            {gekozen.size === 0 ? 'Kies de bestellingen waarvan de betaling binnen is.' : `${gekozen.size} geselecteerd · ${formatEuro(totaal)}`}
          </span>
          <div className='flex flex-wrap items-center gap-2'>
            <label htmlFor='betaalwijze' className='text-sm font-medium text-gray-700'>Betaald met</label>
            <select id='betaalwijze' name='wijze' defaultValue='overschrijving' className='rounded-input border border-gray-300 bg-white px-2 py-2 text-sm'>
              <option value='overschrijving'>Overschrijving</option>
              <option value='cash'>Cash</option>
            </select>
            <button
              type='submit'
              className='inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-semibold rounded-button hover:bg-primary-hover disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
            >
              <CheckCircle2 className='w-4 h-4' aria-hidden='true' />
              Markeer als betaald en stuur QR-code
            </button>
          </div>
        </div>
      )}

      <div className='bg-white rounded-card border border-gray-200 overflow-x-auto'>
        <table className='w-full min-w-[900px] border-collapse text-[15px]'>
          <thead>
            <tr className='text-left text-[13px] uppercase tracking-wide text-gray-600'>
              {kanBetalen && (
                <th scope='col' className='px-3 py-3 border-b border-gray-200 w-10'>
                  <input
                    type='checkbox'
                    aria-label='Alle bestellingen die op betaling wachten selecteren'
                    checked={allesGekozen}
                    disabled={kiesbaar.length === 0}
                    onChange={() => {
                      setGekozen(allesGekozen ? new Set() : new Set(kiesbaar.map(rij => rij.id)));
                    }}
                    className='w-4 h-4 accent-primary'
                  />
                </th>
              )}
              <th scope='col' className='px-3 py-3 border-b border-gray-200'>Nr.</th>
              <th scope='col' className='px-3 py-3 border-b border-gray-200'>Naam</th>
              <th scope='col' className='px-3 py-3 border-b border-gray-200'>Bestelling</th>
              <th scope='col' className='px-3 py-3 border-b border-gray-200 text-right'>Bedrag</th>
              <th scope='col' className='px-3 py-3 border-b border-gray-200'>Afhalen</th>
              <th scope='col' className='px-3 py-3 border-b border-gray-200'>Mededeling</th>
              <th scope='col' className='px-3 py-3 border-b border-gray-200'>Status</th>
            </tr>
          </thead>
          <tbody>
            {rijen.map(rij => (
              <tr key={rij.id} className={gekozen.has(rij.id) ? 'bg-brand-primary-50' : 'bg-white'}>
                {kanBetalen && (
                  <td className={cell}>
                    {rij.status === 'wacht' && (
                      <input
                        type='checkbox'
                        name='id'
                        value={rij.id}
                        aria-label={`Selecteer nr. ${rij.nummer}`}
                        checked={gekozen.has(rij.id)}
                        onChange={() => {
                          toggle(rij.id);
                        }}
                        className='w-4 h-4 accent-primary'
                      />
                    )}
                  </td>
                )}
                <td className={`${cell} font-semibold`}>
                  <Link href={`/admin/bestellingen/${actie}/${rij.nummer}`} className='text-primary-text hover:underline'>{rij.nummer}</Link>
                </td>
                <td className={cell}>{rij.naam}</td>
                <td className={`${cell} text-gray-700`}>{rij.inhoud}</td>
                <td className={`${cell} text-right font-semibold whitespace-nowrap`}>{formatEuro(rij.totaalCent)}</td>
                <td className={cell}>{rij.moment}</td>
                <td className={`${cell} font-mono text-[13px] text-gray-700 whitespace-nowrap`}>{rij.mededeling}</td>
                <td className={cell}><StatusBadge status={rij.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </form>
  );
}
