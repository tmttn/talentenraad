import type {Order, OrderLine, OrderStatus} from '@lib/db/schema';
import {formatEuro} from '@lib/bestellingen/geld';
import {regelNaam, statusVoorOuder} from '@lib/bestellingen/status';
import {cashTekst} from '@lib/email/bestellingen';

type Properties = {
  order: Pick<Order, 'nummer' | 'status' | 'totaalCent' | 'afhaalLabel' | 'afhaalPlaats' | 'afgehaaldOp'> & {regels: OrderLine[]};
  titel: string;
  /** Shown while the order waits for payment. */
  betalen?: {iban: string; begunstigde: string; mededeling: string; uiterlijk: string; cash: boolean};
  /** Shown once paid: the QR code as SVG markup (made on the server) and the short code. */
  qr?: {svg: string; korteCode: string};
};

/** Status colors pair a color with the words, never color alone. */
const pillStyles: Record<OrderStatus, string> = {
  wacht: 'bg-logo-orange text-black',
  betaald: 'bg-logo-green text-black',
  afgehaald: 'bg-gray-100 text-gray-900',
  geannuleerd: 'bg-gray-100 text-gray-900',
  terugbetalen: 'bg-red-50 text-red-700',
};

export function StatusPil({status}: Readonly<{status: OrderStatus}>) {
  return (
    <span className={`inline-block self-start text-sm font-bold border-(length:--contour-width-xs) border-ink rounded-full px-3.5 py-1 ${pillStyles[status]}`}>
      {statusVoorOuder[status]}
    </span>
  );
}

/** The parent's view of an order (mockup "Bestelpagina ouder"): status, how to pay or the QR code, pickup and lines. */
export function Bestelstatus({order, titel, betalen, qr}: Readonly<Properties>) {
  const totaalLabel = order.status === 'wacht' ? 'Totaal' : (order.status === 'geannuleerd' || order.status === 'terugbetalen' ? 'Totaal' : 'Totaal, betaald');

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-2.5'>
        <span className='text-sm font-bold text-gray-600'>{titel} · bestelling nr. {order.nummer}</span>
        <h1 className='font-display font-extrabold text-black text-[clamp(40px,5vw,52px)] leading-none tracking-[-0.02em]'>Je bestelling</h1>
        <StatusPil status={order.status} />
      </div>

      {betalen && (
        <div className='bg-logo-orange rounded-tile contour-sm p-5 flex flex-col gap-3 text-black'>
          <h2 className='font-display font-extrabold text-xl'>Betaal uiterlijk {betalen.uiterlijk}</h2>
          {/* On a phone each label sits above its value, so the account and reference stay on one line */}
          <dl className='grid grid-cols-1 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-x-3 sm:gap-y-1.5 text-base'>
            <dt className='text-sm sm:text-base'>Bedrag</dt><dd className='font-bold mb-2 sm:mb-0'>{formatEuro(order.totaalCent)}</dd>
            <dt className='text-sm sm:text-base'>Rekening</dt><dd className='font-bold whitespace-nowrap mb-2 sm:mb-0'>{betalen.iban}</dd>
            <dt className='text-sm sm:text-base'>Op naam van</dt><dd className='font-bold mb-2 sm:mb-0'>{betalen.begunstigde}</dd>
            <dt className='text-sm sm:text-base'>Mededeling</dt><dd className='font-bold font-mono text-[17px] whitespace-nowrap'>{betalen.mededeling}</dd>
          </dl>
          <p className='text-sm leading-normal'>Gebruik precies deze mededeling, dan vinden we je betaling meteen terug. Zodra je betaling binnen is, krijg je je afhaalcode per mail en staat ze hier.</p>
          {betalen.cash && <p className='text-sm leading-normal'>{cashTekst}</p>}
        </div>
      )}

      {qr && (
        <div className='flex flex-col items-center gap-3'>
          <div className='p-3.5 bg-white rounded-tile contour shadow-hard-lg'>
            <div className='w-60 h-60 [&>svg]:w-full [&>svg]:h-full' dangerouslySetInnerHTML={{__html: qr.svg}} />
          </div>
          <div className='text-center flex flex-col gap-0.5'>
            <span className='text-[13px] text-gray-600'>Code als scannen niet lukt</span>
            <span className='font-mono text-[28px] font-extrabold tracking-[0.08em] text-black'>{qr.korteCode}</span>
          </div>
        </div>
      )}

      {order.status === 'afgehaald' && order.afgehaaldOp && (
        <p className='text-gray-700'>
          Afgehaald op {order.afgehaaldOp.toLocaleDateString('nl-BE', {weekday: 'long', day: 'numeric', month: 'long'})} om {order.afgehaaldOp.toLocaleTimeString('nl-BE', {hour: '2-digit', minute: '2-digit'})}. Smakelijk!
        </p>
      )}

      {order.status !== 'geannuleerd' && order.status !== 'terugbetalen' && (
        <div className='bg-brand-primary-50 rounded-tile contour-sm p-5 flex flex-col gap-1.5'>
          <span className='font-display font-bold text-[22px] text-black'>{order.afhaalLabel}</span>
          <span className='text-base text-gray-700'>{order.afhaalPlaats}</span>
        </div>
      )}

      <div className='flex flex-col gap-2.5 text-base'>
        {order.regels.map(regel => (
          <p key={regel.id} className='flex justify-between gap-3'>
            <span>{regel.aantal} × {regelNaam(regel)}</span>
            <span className='font-bold whitespace-nowrap'>{formatEuro(regel.aantal * regel.prijsCent)}</span>
          </p>
        ))}
        <p className='flex justify-between gap-3 pt-2.5 border-t-2 border-ink text-lg'>
          <span className='font-bold'>{totaalLabel}</span>
          <span className='font-extrabold'>{formatEuro(order.totaalCent)}</span>
        </p>
      </div>
    </div>
  );
}
