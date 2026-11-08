import {notFound} from 'next/navigation';
import {requireStaffSession} from '@lib/auth/require-admin';
import {afhaalTeller} from '@lib/bestellingen/afhalen';
import {vindOpToken} from '@lib/bestellingen/bestellingen';
import {isTokenVorm} from '@lib/bestellingen/codes';
import {kanBeheren, kanBetalingBevestigen} from '@lib/bestellingen/rechten';
import {Afgifte} from '@features/afhalen/afgifte';
import {geefMeeActie, ontvangCashActie} from '../../../actions';

export const dynamic = 'force-dynamic';

type PageProperties = {
  params: Promise<{actie: string; moment: string; token: string}>;
  searchParams: Promise<{fout?: string}>;
};

const slug = /^[a-z\d]+(?:-[a-z\d]+)*$/;

/** After a scan (or a search): the order, its warnings and 'Alles meegegeven'. */
export default async function AfgiftePage({params, searchParams}: Readonly<PageProperties>) {
  const session = await requireStaffSession();
  const {actie, moment, token} = await params;
  if (!slug.test(actie) || !slug.test(moment) || !isTokenVorm(token)) {
    notFound();
  }

  const order = await vindOpToken(token);
  if (!order) {
    notFound();
  }

  const {fout} = await searchParams;
  const teller = await afhaalTeller(actie, moment);

  return (
    <Afgifte
      order={order}
      waar={{actie, moment}}
      teller={teller}
      magCash={kanBetalingBevestigen(session)}
      fout={fout}
      beheerHref={kanBeheren(session) ? `/admin/bestellingen/${order.actie}/${order.nummer}` : undefined}
      ouderHref={kanBeheren(session) ? `/b/${token}?ouder=1` : undefined}
      geefMeeAction={geefMeeActie}
      cashAction={ontvangCashActie}
    />
  );
}
