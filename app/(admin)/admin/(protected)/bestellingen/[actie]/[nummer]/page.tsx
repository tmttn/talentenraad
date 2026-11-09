import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {requireEditorSession} from '@lib/auth/require-admin';
import {vindOpNummer} from '@lib/bestellingen/beheer';
import {formatKorteCode} from '@lib/bestellingen/codes';
import {formatEuro} from '@lib/bestellingen/geld';
import {formatMededeling} from '@lib/bestellingen/mededeling';
import {kanBetalingBevestigen} from '@lib/bestellingen/rechten';
import {regelNaam} from '@lib/bestellingen/status';
import {content} from '@lib/content';
import {Melding, StatusBadge} from '@features/admin/bestellingen/parts';
import {primaryButton, secondaryButton, dangerOutlineButton} from '@features/admin/content-editor/styles';
import {annuleerActie, betaaldActie, mailActie, notitieActie, terugbetaaldActie} from '../../actions';

export const metadata: Metadata = {title: 'Bestelling'};
export const dynamic = 'force-dynamic';

type PageProperties = {
  params: Promise<{actie: string; nummer: string}>;
  searchParams: Promise<{melding?: string}>;
};

const tijd = (date: Date | null) => (date ? date.toLocaleString('nl-BE', {dateStyle: 'medium', timeStyle: 'short'}) : undefined);
const control = 'w-full rounded-input border border-gray-300 bg-white px-3 py-2.5 text-base focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none';

export default async function BestellingDetailPage({params, searchParams}: Readonly<PageProperties>) {
  const session = await requireEditorSession();
  const {actie: slug, nummer} = await params;
  if (!/^\d{1,6}$/.test(nummer)) {
    notFound();
  }

  const order = await vindOpNummer(slug, Number(nummer));
  if (!order) {
    notFound();
  }

  const {melding} = await searchParams;
  const actie = content.getActie(slug);
  const bank = kanBetalingBevestigen(session);
  const terug = `/admin/bestellingen/${slug}/${order.nummer}`;
  const gewist = order.gewistOp !== null;

  const gegevens: Array<[string, string | undefined | null]> = [
    ['Naam', order.naam],
    ['E-mail', order.email || undefined],
    ['Telefoon', order.telefoon],
    ['Kind', order.kindNaam ? `${order.kindNaam}${order.kindKlas ? `, ${order.kindKlas}` : ''}` : undefined],
    ['Afhalen', `${order.afhaalLabel} · ${order.afhaalPlaats}`],
    ['Mededeling', formatMededeling(order.mededeling)],
    ['Korte code', formatKorteCode(order.korteCode)],
    ['Besteld op', tijd(order.aangemaaktOp)],
    ['Ingevoerd door', order.ingevoerdDoor],
    // Only a waiting order with an address still gets one: paid at once (free, or cash the board took) goes straight to the pickup code
    ['Bevestiging verstuurd', tijd(order.bevestigingVerstuurdOp) ?? (order.status === 'wacht' && order.email ? 'Nog niet' : undefined)],
    ['Betaalherinnering verstuurd', tijd(order.betaalHerinneringOp)],
    ['Betaald', order.betaaldOp ? `${tijd(order.betaaldOp)}${order.betaalwijze ? ` · ${order.betaalwijze}` : ''}${order.betaaldDoor ? ` · ${order.betaaldDoor}` : ''}` : undefined],
    ['Afhaalcode verstuurd', tijd(order.qrVerstuurdOp)],
    ['Afhaalherinnering verstuurd', tijd(order.afhaalHerinneringOp)],
    ['Afgehaald', order.afgehaaldOp ? `${tijd(order.afgehaaldOp)} · ${order.afgehaaldDoor ?? ''}` : undefined],
    ['Geannuleerd', order.geannuleerdOp ? `${tijd(order.geannuleerdOp)} · ${order.geannuleerdDoor ?? ''} · ${order.annuleerReden ?? ''}` : undefined],
    ['Terugbetaald', order.terugbetaaldOp ? `${tijd(order.terugbetaaldOp)} · ${order.terugbetaaldDoor ?? ''}` : undefined],
    ['Gewist', tijd(order.gewistOp)],
  ];

  return (
    <div className='space-y-6 max-w-4xl'>
      <div>
        <p className='text-sm'>
          <Link href='/admin/bestellingen' className='text-primary-text hover:underline'>Bestellingen</Link>
          {' › '}
          <Link href={`/admin/bestellingen/${slug}`} className='text-primary-text hover:underline'>{actie?.titel ?? slug}</Link>
        </p>
        <h1 className='text-2xl sm:text-3xl font-bold text-gray-800 flex flex-wrap items-center gap-3'>
          Bestelling nr. {order.nummer}
          <StatusBadge status={order.status} />
        </h1>
      </div>

      <Melding code={melding} />

      <div className='grid gap-6 lg:grid-cols-2'>
        <section className='bg-white rounded-card shadow-base p-5 space-y-4' aria-labelledby='bestelling-titel'>
          <h2 id='bestelling-titel' className='font-semibold text-gray-800'>Bestelling</h2>
          <ul className='space-y-1.5'>
            {order.regels.map(regel => (
              <li key={regel.id} className='flex justify-between gap-3'>
                <span>{regel.aantal} × {regelNaam(regel)}</span>
                <span className='font-semibold whitespace-nowrap'>{formatEuro(regel.aantal * regel.prijsCent)}</span>
              </li>
            ))}
            <li className='flex justify-between gap-3 pt-2 border-t border-gray-200 font-bold'>
              <span>Totaal</span>
              <span>{formatEuro(order.totaalCent)}</span>
            </li>
          </ul>
          <dl className='grid grid-cols-[minmax(0,10rem)_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-[15px]'>
            {gegevens.filter(([, waarde]) => waarde).map(([label, waarde]) => (
              <div key={label} className='contents'>
                <dt className='text-gray-600'>{label}</dt>
                <dd className='text-gray-900 break-words'>{waarde}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className='space-y-6'>
          {order.status === 'wacht' && bank && (
            <form action={betaaldActie} className='bg-white rounded-card shadow-base p-5 space-y-3'>
              <h2 className='font-semibold text-gray-800'>Betaling ontvangen</h2>
              <input type='hidden' name='id' value={order.id} />
              <input type='hidden' name='terug' value={terug} />
              <label htmlFor='wijze' className='block text-sm font-medium text-gray-700'>Betaald met</label>
              <select id='wijze' name='wijze' defaultValue='overschrijving' className={control}>
                <option value='overschrijving'>Overschrijving</option>
                <option value='cash'>Cash</option>
              </select>
              <button type='submit' className={primaryButton}>Markeer als betaald en stuur QR-code</button>
            </form>
          )}
          {order.status === 'wacht' && !bank && (
            <p className='rounded-button border border-gray-200 bg-gray-50 p-3 text-gray-700'>
              Alleen wie toegang heeft tot de bankrekening, kan deze betaling bevestigen.
            </p>
          )}

          {order.status === 'terugbetalen' && bank && (
            <form action={terugbetaaldActie} className='bg-white rounded-card shadow-base p-5 space-y-3'>
              <h2 className='font-semibold text-gray-800'>Terugbetalen</h2>
              <p className='text-gray-700'>Stort {formatEuro(order.totaalCent)} terug{order.betaalwijze === 'cash' ? ' (betaald met cash)' : ''} en vink het hier af.</p>
              <input type='hidden' name='id' value={order.id} />
              <input type='hidden' name='terug' value={terug} />
              <button type='submit' className={primaryButton}>Markeer als terugbetaald</button>
            </form>
          )}

          {!gewist && (
            <form action={notitieActie} className='bg-white rounded-card shadow-base p-5 space-y-3'>
              <label htmlFor='notitie' className='block font-semibold text-gray-800'>Notitie</label>
              <p className='text-sm text-gray-500'>Voor uitzonderingen, bv. haalt ook op voor nr. 15. Helpers zien dit bij het afhalen.</p>
              <input type='hidden' name='id' value={order.id} />
              <input type='hidden' name='terug' value={terug} />
              <textarea id='notitie' name='notitie' rows={3} maxLength={500} defaultValue={order.notitie ?? ''} className={control} />
              <button type='submit' className={secondaryButton}>Notitie opslaan</button>
            </form>
          )}

          {order.token && order.email && (order.status === 'wacht' || order.status === 'betaald') && (
            <form action={mailActie} className='bg-white rounded-card shadow-base p-5 space-y-3'>
              <h2 className='font-semibold text-gray-800'>Mail opnieuw sturen</h2>
              <input type='hidden' name='id' value={order.id} />
              <input type='hidden' name='terug' value={terug} />
              <input type='hidden' name='soort' value={order.status === 'betaald' ? 'afhaalcode' : 'bevestiging'} />
              <p className='text-gray-700'>{order.status === 'betaald' ? 'De mail met de QR-code' : 'De bevestiging met de betaalgegevens'} gaat opnieuw naar {order.email}.</p>
              <button type='submit' className={secondaryButton}>Mail opnieuw sturen</button>
            </form>
          )}

          {(order.status === 'wacht' || order.status === 'betaald') && (
            <form action={annuleerActie} className='bg-white rounded-card shadow-base p-5 space-y-3'>
              <h2 className='font-semibold text-gray-800'>Annuleren</h2>
              {order.status === 'betaald' && <p className='text-gray-700'>Er is al betaald: de bestelling komt op de lijst om terug te betalen.</p>}
              <input type='hidden' name='id' value={order.id} />
              <input type='hidden' name='terug' value={terug} />
              <label htmlFor='reden' className='block text-sm font-medium text-gray-700'>Reden</label>
              <input id='reden' name='reden' type='text' required maxLength={300} placeholder='Bijvoorbeeld: niet betaald voor de deadline' className={control} />
              <button type='submit' className={dangerOutlineButton}>Bestelling annuleren</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
