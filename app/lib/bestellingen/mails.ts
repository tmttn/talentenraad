import {and, eq, isNull} from 'drizzle-orm';
import {content, type Actie} from '@lib/content';
import {db, orders} from '@lib/db';
import {formatIban} from '@lib/content/iban';
import {
  afhaalcodeMail, afhaalHerinneringMail, betaalHerinneringMail, bevestigingMail, type BestelMailData, type Betaalgegevens,
} from '@lib/email/bestellingen';
import {getSiteUrl, sendMail} from '@lib/email/mailer';
import {formatDag} from './acties';
import {uitersteBetaaldatum, vindOpId, type OrderMetRegels} from './bestellingen';
import {formatKorteCode} from './codes';
import {formatEuro} from './geld';
import {formatMededeling} from './mededeling';
import {bestelUrl, qrPng} from './qr';
import {regelNaam} from './status';

function mailData(order: OrderMetRegels, actie: Actie | undefined): BestelMailData {
  return {
    titel: actie?.titel ?? order.actie,
    nummer: order.nummer,
    regels: order.regels.map(regel => ({aantal: regel.aantal, naam: regelNaam(regel), bedrag: formatEuro(regel.prijsCent * regel.aantal)})),
    totaal: formatEuro(order.totaalCent),
    afhaalLabel: order.afhaalLabel,
    afhaalPlaats: order.afhaalPlaats,
    link: bestelUrl(order.token ?? ''),
    logoUrl: `${getSiteUrl()}/Logo.png`,
    annulerenTot: actie ? formatDag(actie.bestellen.tot) : undefined,
  };
}

/** How to pay: the account of the sale, the amount, the reference and the deadline. */
function betaalgegevens(order: OrderMetRegels, actie: Actie): Betaalgegevens {
  return {
    bedrag: formatEuro(order.totaalCent),
    iban: formatIban(actie.betalen.rekening.iban),
    begunstigde: actie.betalen.rekening.begunstigde,
    mededeling: formatMededeling(order.mededeling),
    uiterlijk: formatDag(uitersteBetaaldatum(order, actie)),
    cash: actie.betalen.wijzen.includes('cash'),
  };
}

const qrBijlage = async (token: string) => ({filename: 'afhaalcode.png', content: await qrPng(bestelUrl(token)), contentType: 'image/png', cid: 'afhaalcode'});

/** Confirmation with payment instructions; records when it left. */
export async function stuurBevestiging(orderId: string): Promise<void> {
  const order = await vindOpId(orderId);
  // No token: the personal data is wiped; no e-mail: the board entered the order for a parent without one
  if (!order?.token || !order.email) {
    return;
  }

  // The sale is gone from content/ (removed after ordering): without its account there is nothing to pay into
  const actie = content.getActie(order.actie);
  if (!actie) {
    console.error('Order mail skipped: sale not found');
    return;
  }

  const mail = bevestigingMail(mailData(order, actie), betaalgegevens(order, actie));
  await sendMail({to: order.email, replyTo: content.getSite().footer.email, ...mail});
  await db.update(orders).set({bevestigingVerstuurdOp: new Date()}).where(eq(orders.id, order.id));
}

/** The pickup code with the QR code as an inline PNG; records when it left. */
export async function stuurAfhaalcode(orderId: string): Promise<void> {
  const order = await vindOpId(orderId);
  // No token: the personal data is wiped; no e-mail: the board entered the order for a parent without one
  if (!order?.token || !order.email) {
    return;
  }

  const actie = content.getActie(order.actie);
  const site = content.getSite();
  const mail = afhaalcodeMail(mailData(order, actie), formatKorteCode(order.korteCode), order.totaalCent === 0);
  await sendMail({
    to: order.email,
    replyTo: site.footer.email,
    ...mail,
    attachments: [await qrBijlage(order.token)],
  });
  await db.update(orders).set({qrVerstuurdOp: new Date()}).where(eq(orders.id, order.id));
}

/** Right after ordering: the payment instructions, or the pickup code at once for a free order. */
export async function verstuurNaBestelling(orderId: string): Promise<void> {
  const order = await vindOpId(orderId);
  if (!order) {
    return;
  }

  await (order.status === 'betaald' ? stuurAfhaalcode(orderId) : stuurBevestiging(orderId));
}

/**
 * The payment reminder, at most once: only while the order still waits for payment, and the column
 * is set only after the mail left, so a failed mail is tried again in the next round. True when sent.
 */
export async function stuurBetaalHerinnering(orderId: string, now = new Date()): Promise<boolean> {
  const order = await vindOpId(orderId);
  const actie = order ? content.getActie(order.actie) : undefined;
  if (!order?.token || !order.email || order.status !== 'wacht' || order.betaalHerinneringOp || !actie) {
    return false;
  }

  await sendMail({to: order.email, replyTo: content.getSite().footer.email, ...betaalHerinneringMail(mailData(order, actie), betaalgegevens(order, actie))});
  await db.update(orders).set({betaalHerinneringOp: now}).where(and(eq(orders.id, order.id), isNull(orders.betaalHerinneringOp)));
  return true;
}

/** The pickup reminder with the QR code, at most once, only for a paid order. True when sent. */
export async function stuurAfhaalHerinnering(orderId: string, now = new Date()): Promise<boolean> {
  const order = await vindOpId(orderId);
  const actie = order ? content.getActie(order.actie) : undefined;
  if (!order?.token || !order.email || order.status !== 'betaald' || order.afhaalHerinneringOp || !actie) {
    return false;
  }

  await sendMail({
    to: order.email,
    replyTo: content.getSite().footer.email,
    ...afhaalHerinneringMail(mailData(order, actie), formatKorteCode(order.korteCode)),
    attachments: [await qrBijlage(order.token)],
  });
  await db.update(orders).set({afhaalHerinneringOp: now}).where(and(eq(orders.id, order.id), isNull(orders.afhaalHerinneringOp)));
  return true;
}
