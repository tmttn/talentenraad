import {AlertTriangle} from 'lucide-react';
import type {OrderStatus} from '@lib/db/schema';
import {formatEuro} from '@lib/bestellingen/geld';
import type {Tellers} from '@lib/bestellingen/beheer';
import {statusLabels} from '@lib/bestellingen/status';

/** Soft admin style: color and words together, never color alone. */
const statusStyles: Record<OrderStatus, string> = {
  wacht: 'bg-amber-100 text-amber-900',
  betaald: 'bg-green-100 text-green-800',
  afgehaald: 'bg-gray-100 text-gray-700',
  geannuleerd: 'bg-gray-100 text-gray-700',
  terugbetalen: 'bg-red-100 text-red-900',
};

export function StatusBadge({status}: Readonly<{status: OrderStatus}>) {
  return <span className={`inline-block px-2.5 py-0.5 text-[13px] font-semibold rounded-full whitespace-nowrap ${statusStyles[status]}`}>{statusLabels[status]}</span>;
}

export function TellerGrid({tellers}: Readonly<{tellers: Tellers}>) {
  const items = [
    {label: 'Bestellingen', waarde: String(tellers.bestellingen)},
    {label: 'Betaald', waarde: String(tellers.betaald)},
    {label: 'Nog te ontvangen', waarde: formatEuro(tellers.teOntvangenCent)},
    {label: 'Afgehaald', waarde: String(tellers.afgehaald)},
    ...(tellers.terugTeBetalen > 0 ? [{label: 'Terug te betalen', waarde: `${tellers.terugTeBetalen} · ${formatEuro(tellers.terugTeBetalenCent)}`}] : []),
  ];
  return (
    <dl className='grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4'>
      {items.map(item => (
        <div key={item.label} className='bg-white rounded-card border border-gray-200 p-4 flex flex-col gap-1'>
          <dt className='text-sm text-gray-600'>{item.label}</dt>
          <dd className='text-2xl font-bold text-gray-900'>{item.waarde}</dd>
        </div>
      ))}
    </dl>
  );
}

export function VoorbeeldRekeningMelding() {
  return (
    <p role='alert' className='flex items-start gap-2 rounded-button border border-amber-300 bg-amber-50 p-3 text-amber-900'>
      <AlertTriangle className='w-5 h-5 shrink-0 mt-0.5' aria-hidden='true' />
      <span>
        In <code>content/site.yaml</code> staat nog het voorbeeldrekeningnummer. Zolang dat zo is, kan geen actie open op de site.
        Vraag de beheerder om het echte rekeningnummer in te vullen.
      </span>
    </p>
  );
}

const meldingen: Record<string, {tekst: string; fout?: boolean}> = {
  'geen-bank': {tekst: 'Alleen wie toegang heeft tot de bankrekening, kan betalingen bevestigen.', fout: true},
  'niet-mogelijk': {tekst: 'Dat kan niet meer: de bestelling is intussen veranderd. Kijk de status na.', fout: true},
  'mail-mislukt': {tekst: 'De mail kon niet verstuurd worden. Probeer het later opnieuw.', fout: true},
  geannuleerd: {tekst: 'Geannuleerd.'},
  terugbetaald: {tekst: 'Gemarkeerd als terugbetaald.'},
  notitie: {tekst: 'Notitie opgeslagen.'},
  mail: {tekst: 'Mail opnieuw verstuurd.'},
};

/** The message after a form on an order page (`?melding=`). */
export function Melding({code}: Readonly<{code?: string}>) {
  if (!code) {
    return null;
  }

  const betaald = /^betaald-(\d+)$/.exec(code);
  const melding = betaald
    ? {tekst: betaald[1] === '0' ? 'Geen bestelling gewijzigd: alleen bestellingen die op betaling wachten, kunnen betaald worden.' : `${betaald[1]} bestelling(en) gemarkeerd als betaald. De QR-code vertrekt per mail.`, fout: betaald[1] === '0'}
    : meldingen[code];
  if (!melding) {
    return null;
  }

  return (
    <p role={melding.fout ? 'alert' : 'status'} className={`rounded-button border p-3 ${melding.fout ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-800'}`}>
      {melding.tekst}
    </p>
  );
}
