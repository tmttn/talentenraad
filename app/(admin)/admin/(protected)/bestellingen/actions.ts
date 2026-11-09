'use server';

import {headers} from 'next/headers';
import {NextRequest} from 'next/server';
import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {createAuditContext, logAudit} from '@lib/audit';
import {requireEditorSession} from '@lib/auth/require-admin';
import type {Session} from '@lib/auth/session';
import {annuleer, markeerBetaald, markeerTerugbetaald, zetNotitie} from '@lib/bestellingen/beheer';
import {vindOpId} from '@lib/bestellingen/bestellingen';
import {stuurAfhaalcode, stuurBevestiging} from '@lib/bestellingen/mails';
import {doorWie, kanBetalingBevestigen} from '@lib/bestellingen/rechten';

const text = (data: FormData, key: string) => {
  const value = data.get(key);
  return typeof value === 'string' ? value : '';
};

/** Back to the page the form came from; only order pages in the admin. */
const terug = (data: FormData, melding: string) => {
  const pad = text(data, 'terug');
  const veilig = /^\/admin\/bestellingen(?:\/[a-z\d-]+(?:\/\d+)?)?$/.test(pad) ? pad : '/admin/bestellingen';
  return `${veilig}?melding=${melding}`;
};

async function audit(session: Session, resourceId: string, actie: string, dataBefore: Record<string, unknown> | null, dataAfter: Record<string, unknown> | null) {
  const request = new NextRequest('http://localhost/admin/bestellingen', {method: 'POST', headers: await headers()});
  await logAudit({actionType: 'update', resourceType: 'bestelling', resourceId, dataBefore, dataAfter, metadata: {actie}, context: createAuditContext(request, session)});
}

const mailInAchtergrond = (send: Promise<void>) => {
  send.catch((error: unknown) => {
    console.error('Order mail failed', error instanceof Error ? error.message : 'unknown');
  });
};

/** 'Betaald' for one order or a selection; the QR mail leaves for each order that changed. */
export async function betaaldActie(data: FormData): Promise<void> {
  const session = await requireEditorSession();
  if (!kanBetalingBevestigen(session)) {
    redirect(terug(data, 'geen-bank'));
  }

  const ids = data.getAll('id').filter((id): id is string => typeof id === 'string');
  const wijze = text(data, 'wijze') === 'cash' ? 'cash' : 'overschrijving';
  const gewijzigd = await markeerBetaald(ids, wijze, doorWie(session));
  for (const order of gewijzigd) {
    // eslint-disable-next-line no-await-in-loop
    await audit(session, order.id, 'betaald', {status: 'wacht'}, {status: 'betaald', betaalwijze: wijze});
    mailInAchtergrond(stuurAfhaalcode(order.id));
  }

  revalidatePath('/admin/bestellingen', 'layout');
  redirect(terug(data, `betaald-${gewijzigd.length}`));
}

export async function annuleerActie(data: FormData): Promise<void> {
  const session = await requireEditorSession();
  const id = text(data, 'id');
  const voor = await vindOpId(id);
  const order = await annuleer(id, text(data, 'reden'), doorWie(session));
  if (!order) {
    redirect(terug(data, 'niet-mogelijk'));
  }

  await audit(session, id, 'geannuleerd', {status: voor?.status}, {status: order.status, reden: order.annuleerReden});
  revalidatePath('/admin/bestellingen', 'layout');
  redirect(terug(data, 'geannuleerd'));
}

export async function terugbetaaldActie(data: FormData): Promise<void> {
  const session = await requireEditorSession();
  if (!kanBetalingBevestigen(session)) {
    redirect(terug(data, 'geen-bank'));
  }

  const id = text(data, 'id');
  const order = await markeerTerugbetaald(id, doorWie(session));
  if (!order) {
    redirect(terug(data, 'niet-mogelijk'));
  }

  await audit(session, id, 'terugbetaald', {status: 'terugbetalen'}, {status: order.status});
  revalidatePath('/admin/bestellingen', 'layout');
  redirect(terug(data, 'terugbetaald'));
}

export async function notitieActie(data: FormData): Promise<void> {
  const session = await requireEditorSession();
  const id = text(data, 'id');
  const order = await zetNotitie(id, text(data, 'notitie'));
  if (!order) {
    redirect(terug(data, 'niet-mogelijk'));
  }

  await audit(session, id, 'notitie', null, {notitie: order.notitie});
  revalidatePath('/admin/bestellingen', 'layout');
  redirect(terug(data, 'notitie'));
}

/** Sends the confirmation or the pickup code again, e.g. when a parent cannot find it. */
export async function mailActie(data: FormData): Promise<void> {
  const session = await requireEditorSession();
  const id = text(data, 'id');
  const order = await vindOpId(id);
  const soort = text(data, 'soort');
  const kan = order?.token && order.email && (soort === 'afhaalcode' ? order.status === 'betaald' : order.status === 'wacht');
  if (!kan) {
    redirect(terug(data, 'niet-mogelijk'));
  }

  try {
    await (soort === 'afhaalcode' ? stuurAfhaalcode(id) : stuurBevestiging(id));
  } catch (error) {
    console.error('Order mail failed', error instanceof Error ? error.message : 'unknown');
    redirect(terug(data, 'mail-mislukt'));
  }

  await audit(session, id, `mail ${soort}`, null, null);
  redirect(terug(data, 'mail'));
}
