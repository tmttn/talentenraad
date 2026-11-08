'use server';

import {headers} from 'next/headers';
import {NextRequest} from 'next/server';
import {redirect} from 'next/navigation';
import {createAuditContext, logAudit} from '@lib/audit';
import {requireStaffSession} from '@lib/auth/require-admin';
import type {Session} from '@lib/auth/session';
import {geefMee, ontvangCash} from '@lib/bestellingen/afhalen';
import {isTokenVorm} from '@lib/bestellingen/codes';
import {stuurAfhaalcode} from '@lib/bestellingen/mails';
import {doorWie, kanBetalingBevestigen} from '@lib/bestellingen/rechten';

const text = (data: FormData, key: string) => {
  const value = data.get(key);
  return typeof value === 'string' ? value : '';
};

const slug = /^[a-z\d]+(?:-[a-z\d]+)*$/;

/** The scanner and hand-over addresses of the form; anything odd sends you back to the start. */
function paden(data: FormData) {
  const actie = text(data, 'actie');
  const moment = text(data, 'moment');
  const token = text(data, 'token');
  if (!slug.test(actie) || !slug.test(moment) || !isTokenVorm(token)) {
    redirect('/admin/afhalen');
  }

  const scanner = `/admin/afhalen/${actie}/${moment}`;
  return {scanner, afgifte: `${scanner}/${token}`};
}

async function audit(session: Session, resourceId: string, actie: string, dataAfter: Record<string, unknown>) {
  const request = new NextRequest('http://localhost/admin/afhalen', {method: 'POST', headers: await headers()});
  await logAudit({actionType: 'update', resourceType: 'bestelling', resourceId, dataAfter, metadata: {actie}, context: createAuditContext(request, session)});
}

/** 'Alles meegegeven': only a paid order; the second of two helpers sees who was first. */
export async function geefMeeActie(data: FormData): Promise<void> {
  const session = await requireStaffSession();
  const {scanner, afgifte} = paden(data);
  const result = await geefMee(text(data, 'id'), doorWie(session));
  if (result.status !== 'meegegeven') {
    redirect(afgifte);
  }

  await audit(session, result.order.id, 'meegegeven', {status: 'afgehaald'});
  redirect(`${scanner}?meegegeven=${result.order.nummer}`);
}

/** Cash at the table: only for members with access to the bank account, checked here too. */
export async function ontvangCashActie(data: FormData): Promise<void> {
  const session = await requireStaffSession();
  const {afgifte} = paden(data);
  if (!kanBetalingBevestigen(session)) {
    redirect(`${afgifte}?fout=geen-bank`);
  }

  const order = await ontvangCash(text(data, 'id'), doorWie(session));
  if (order) {
    await audit(session, order.id, 'betaald', {status: 'betaald', betaalwijze: 'cash'});
    stuurAfhaalcode(order.id).catch((error: unknown) => {
      console.error('Order mail failed', error instanceof Error ? error.message : 'unknown');
    });
  }

  redirect(afgifte);
}
