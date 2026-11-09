import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {requireEditorSession} from '@lib/auth/require-admin';
import {afhaalLabel, productVarianten, veldnaam} from '@lib/bestellingen/acties';
import {verbruikteVoorraad} from '@lib/bestellingen/plaatsen';
import {kanBetalingBevestigen} from '@lib/bestellingen/rechten';
import {content} from '@lib/content';
import {db} from '@lib/db';
import {HandmatigeBestelling} from '@features/admin/bestellingen/handmatige-bestelling';
import {voerBestellingIn} from './actions';

export const metadata: Metadata = {title: 'Bestelling invoeren'};
export const dynamic = 'force-dynamic';

type PageProperties = {params: Promise<{actie: string}>};

export default async function NieuweBestellingPage({params}: Readonly<PageProperties>) {
  const session = await requireEditorSession();
  const {actie: slug} = await params;
  const actie = /^[a-z\d]+(?:-[a-z\d]+)*$/.test(slug) ? content.getActie(slug) : undefined;
  if (!actie) {
    notFound();
  }

  const metVoorraad = actie.producten.filter(product => product.voorraad !== undefined);
  const verbruikt = verbruikteVoorraad(db, actie.slug, metVoorraad.map(product => product.id));

  return (
    <div className='space-y-6 max-w-2xl'>
      <div>
        <p className='text-sm'>
          <Link href='/admin/bestellingen' className='text-primary-text hover:underline'>Bestellingen</Link>
          {' / '}
          <Link href={`/admin/bestellingen/${actie.slug}`} className='text-primary-text hover:underline'>{actie.titel}</Link>
        </p>
        <h1 className='text-2xl sm:text-3xl font-bold text-gray-800'>Bestelling invoeren</h1>
        <p className='text-gray-600 mt-1'>
          Voor een ouder zonder e-mailadres, of een bestelling aan de schoolpoort. Dat kan ook na de bestelperiode.
          Zonder e-mail krijgt de ouder geen mails en geen QR-code: aan de afhaaltafel zoekt de helper op naam.
        </p>
      </div>

      <HandmatigeBestelling
        action={voerBestellingIn}
        magCash={kanBetalingBevestigen(session)}
        actie={{
          slug: actie.slug,
          vraagKind: actie.vraag.kind,
          afhalen: actie.afhalen.map(moment => ({id: moment.id, label: `${afhaalLabel(moment)} · ${moment.plaats}`})),
          producten: actie.producten.map(product => ({
            id: product.id,
            naam: product.naam,
            max: product.maxPerBestelling,
            over: product.voorraad === undefined ? undefined : Math.max(0, product.voorraad - (verbruikt.get(product.id) ?? 0)),
            varianten: productVarianten(product).map(variant => ({veld: veldnaam(product.id, variant.sleutel), label: variant.label, prijs: variant.prijs})),
          })),
        }}
      />
    </div>
  );
}
