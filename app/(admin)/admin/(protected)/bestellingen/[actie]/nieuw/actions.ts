'use server';

import {headers} from 'next/headers';
import {NextRequest} from 'next/server';
import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {createAuditContext, logAudit} from '@lib/audit';
import {requireEditorSession} from '@lib/auth/require-admin';
import type {BestelFouten} from '@lib/bestellingen/formulier';
import type {HandmatigState} from '@features/admin/bestellingen/handmatige-bestelling';
import {plaatsHandmatig} from '@lib/bestellingen/handmatig';
import {doorWie, kanBetalingBevestigen} from '@lib/bestellingen/rechten';
import {content} from '@lib/content';

const text = (data: FormData, key: string) => {
  const value = data.get(key);
  return typeof value === 'string' ? value : '';
};

const meldingen = {
  ongeldig: 'Er klopt nog iets niet. Kijk de rode velden na.',
  uitverkocht: 'Iets uit de bestelling is uitverkocht. Kijk de aantallen na.',
  gewijzigd: 'De actie is net aangepast. Kijk de bestelling na en bewaar opnieuw.',
  mislukt: 'Er ging iets mis bij het bewaren. Probeer het opnieuw.',
  weg: 'Deze actie bestaat niet meer.',
  bank: 'Alleen wie toegang heeft tot de bankrekening, kan een betaling bevestigen.',
};

/** An order entered by the board; on success to the order page, otherwise back to the form with what was sent. */
export async function voerBestellingIn(state: HandmatigState, data: FormData): Promise<HandmatigState> {
  const session = await requireEditorSession();
  const slug = text(data, 'actie');
  const actie = /^[a-z\d]+(?:-[a-z\d]+)*$/.test(slug) ? content.getActie(slug) : undefined;
  const waarden = Object.fromEntries([...data.entries()].filter((entry): entry is [string, string] => typeof entry[1] === 'string'));
  const fout = (melding: string, fouten?: BestelFouten): HandmatigState => ({status: 'fout', melding, fouten, waarden, poging: (state.poging ?? 0) + 1});

  if (!actie) {
    return fout(meldingen.weg);
  }

  const cash = text(data, 'cash') === 'on';
  if (cash && !kanBetalingBevestigen(session)) {
    return fout(meldingen.bank);
  }

  const door = doorWie(session);
  const result = await plaatsHandmatig(actie, data, {door, cashBetaaldDoor: cash ? door : undefined});
  if (result.status === 'ongeldig' || result.status === 'uitverkocht') {
    return fout(meldingen[result.status], result.fouten);
  }

  if (result.status !== 'besteld') {
    return fout(meldingen[result.status]);
  }

  const request = new NextRequest('http://localhost/admin/bestellingen', {method: 'POST', headers: await headers()});
  await logAudit({
    actionType: 'create',
    resourceType: 'bestelling',
    resourceId: result.id,
    dataBefore: null,
    dataAfter: {nummer: result.nummer, ingevoerd: true, cash},
    metadata: {actie: actie.slug},
    context: createAuditContext(request, session),
  });
  revalidatePath('/admin/bestellingen', 'layout');
  redirect(`/admin/bestellingen/${actie.slug}/${result.nummer}?melding=ingevoerd`);
}
