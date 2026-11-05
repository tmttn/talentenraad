import {Card} from '@components/ui';
import {contourTitle} from '@components/layout/contour-parts';
import {actieStatus, formatDag, type ActieStatus} from '@lib/bestellingen/acties';
import {formatEuro} from '@lib/bestellingen/geld';
import type {Actie} from '@lib/content';

const statusTekst = (actie: Actie, status: ActieStatus) => {
  if (status === 'open') {
    return `Bestellen tot en met ${formatDag(actie.bestellen.tot)}`;
  }

  return status === 'binnenkort' ? `Bestellen vanaf ${formatDag(actie.bestellen.van)}` : 'Afgelopen';
};

const vanafPrijs = (actie: Actie) => {
  const prijzen = actie.producten.map(product => product.prijs);
  const laagste = Math.min(...prijzen);
  return prijzen.every(prijs => prijs === laagste) ? formatEuro(laagste) : `vanaf ${formatEuro(laagste)}`;
};

/** A sale as a contour card with an orange header: when you can order, and from what price. */
export function ActieKaart({actie, today}: Readonly<{actie: Actie; today: string}>) {
  const status = actieStatus(actie, today);
  return (
    <Card variant='contour' padding='none' href={`/acties/${actie.slug}`} hover className='flex flex-col'>
      <span className={`px-5 py-3.5 border-b-(length:--contour-width-sm) border-ink font-bold ${status === 'open' ? 'bg-logo-orange text-black' : 'bg-gray-100 text-gray-900'}`}>
        {statusTekst(actie, status)}
      </span>
      <span className='flex flex-col gap-2 p-5'>
        <span className='font-display font-bold text-2xl leading-tight text-black'>{actie.titel}</span>
        <span className='leading-relaxed text-gray-700'>{actie.samenvatting}</span>
        <span className='text-[15px] font-bold text-primary-text'>{status === 'open' ? `Bestel nu · ${vanafPrijs(actie)}` : 'Bekijk de actie'}</span>
      </span>
    </Card>
  );
}

/** "Nu te bestellen" on the homepage and the calendar, only while a sale is open. */
export function OpenActies({acties, today, className = ''}: Readonly<{acties: Actie[]; today: string; className?: string}>) {
  const open = acties.filter(actie => actieStatus(actie, today) === 'open');
  if (open.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby='open-acties-titel' className={`px-5 ${className}`}>
      <div className='max-w-[1240px] mx-auto flex flex-col gap-6'>
        <h2 id='open-acties-titel' className={contourTitle}>Nu te bestellen</h2>
        <ul className='grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-7'>
          {open.map(actie => (
            <li key={actie.slug} className='flex'>
              <ActieKaart actie={actie} today={today} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
