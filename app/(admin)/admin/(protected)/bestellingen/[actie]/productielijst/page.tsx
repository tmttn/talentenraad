import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {BackLink} from '@features/admin/navigation';
import {requireEditorSession} from '@lib/auth/require-admin';
import {alleBestellingen} from '@lib/bestellingen/beheer';
import {productielijst, type ProductTotaal} from '@lib/bestellingen/overzicht';
import {content} from '@lib/content';
import {PrintButton} from '@features/admin/bestellingen/print-button';

export const metadata: Metadata = {title: 'Productielijst'};
export const dynamic = 'force-dynamic';

function Producten({producten}: Readonly<{producten: ProductTotaal[]}>) {
  return (
    <table className='w-full border-collapse text-base'>
      <tbody>
        {producten.map(product => (
          <tr key={product.productId} className='border-b border-gray-200 align-top'>
            <th scope='row' className='py-2 pr-3 text-left font-semibold text-gray-900'>{product.naam}</th>
            <td className='py-2 pr-3 text-right text-xl font-bold tabular-nums'>{product.totaal}</td>
            <td className='py-2 text-gray-700'>
              {product.varianten.length > 0 && `waarvan ${product.varianten.map(variant => `${variant.aantal} ${variant.label.toLowerCase()}`).join(', ')}`}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Totals per product and choice, per pickup moment, to print for the purchase. Cancelled orders do not count. */
export default async function ProductielijstPage({params}: Readonly<{params: Promise<{actie: string}>}>) {
  await requireEditorSession();
  const {actie: slug} = await params;
  const orders = await alleBestellingen(slug);
  const actie = content.getActie(slug);
  if (!actie && orders.length === 0) {
    notFound();
  }

  const lijst = productielijst(orders);

  return (
    <div className='space-y-6 max-w-3xl'>
      <div className='flex flex-wrap justify-between items-end gap-3'>
        <div>
          <BackLink href={`/admin/bestellingen/${slug}`} label={actie?.titel ?? slug} />
          <h1 className='text-2xl sm:text-3xl font-bold text-gray-800'>Productielijst {actie?.titel ?? slug}</h1>
          <p className='text-sm text-gray-600'>Alle bestellingen die niet geannuleerd zijn, betaald of niet. Stand van {new Date().toLocaleString('nl-BE', {dateStyle: 'medium', timeStyle: 'short'})}.</p>
        </div>
        <PrintButton />
      </div>

      {lijst.totaal.length === 0 && <p className='text-gray-600'>Nog geen bestellingen.</p>}
      {lijst.perMoment.map(moment => (
        <section key={moment.afhaalId} className='bg-white rounded-card border border-gray-200 p-5 space-y-3 break-inside-avoid'>
          <h2 className='font-semibold text-gray-800'>{moment.label} · {moment.bestellingen} bestelling{moment.bestellingen === 1 ? '' : 'en'}</h2>
          <Producten producten={moment.producten} />
        </section>
      ))}
      {lijst.perMoment.length > 1 && (
        <section className='bg-white rounded-card border border-gray-200 p-5 space-y-3 break-inside-avoid'>
          <h2 className='font-semibold text-gray-800'>Totaal</h2>
          <Producten producten={lijst.totaal} />
        </section>
      )}
    </div>
  );
}
