'use server';

import {headers} from 'next/headers';
import {NextRequest} from 'next/server';
import {redirect} from 'next/navigation';
import {createAuditContext, logAudit} from '@lib/audit';
import {annuleerDoorOuder, vindOpToken} from '@lib/bestellingen/bestellingen';
import {isTokenVorm} from '@lib/bestellingen/codes';
import {content} from '@lib/content';

/** Cancel button on the order page (after a confirmation step); works without JavaScript. */
export async function annuleer(data: FormData): Promise<void> {
  const token = data.get('token');
  if (typeof token !== 'string' || !isTokenVorm(token)) {
    redirect('/');
  }

  const order = await vindOpToken(token);
  const result = await annuleerDoorOuder(token, order ? content.getActie(order.actie) : undefined);
  if (result.status === 'niet-mogelijk') {
    redirect(`/b/${token}?annuleren=mislukt`);
  }

  const request = new NextRequest('http://localhost/b', {method: 'POST', headers: await headers()});
  await logAudit({
    actionType: 'update',
    resourceType: 'bestelling',
    resourceId: result.order.id,
    dataBefore: {status: order?.status},
    dataAfter: {status: result.status},
    metadata: {actie: 'geannuleerd door ouder', bestelling: result.order.actie},
    context: createAuditContext(request, {user: {email: 'ouder'}}),
  });
  redirect(`/b/${token}?geannuleerd=1`);
}
