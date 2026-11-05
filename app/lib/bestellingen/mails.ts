import {eq} from 'drizzle-orm';
import {content, type Actie} from '@lib/content';
import {db, orders} from '@lib/db';
import {formatIban} from '@lib/content/iban';
import {afhaalcodeMail, bevestigingMail, type BestelMailData} from '@lib/email/bestellingen';
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

/** Confirmation with payment instructions; records when it left. */
export async function stuurBevestiging(orderId: string): Promise<void> {
  const order = await vindOpId(orderId);
  if (!order?.token) {
    return;
  }

  const actie = content.getActie(order.actie);
  const site = content.getSite();
  const {rekening} = site.bestellingen;
  const mail = bevestigingMail(mailData(order, actie), {
    bedrag: formatEuro(order.totaalCent),
    iban: formatIban(rekening.iban),
    begunstigde: rekening.begunstigde,
    mededeling: formatMededeling(order.mededeling),
    uiterlijk: formatDag(uitersteBetaaldatum(order, actie ?? {betalen: {binnenDagen: 5}})),
    cash: actie?.betalen.wijzen.includes('cash') ?? false,
  });
  await sendMail({to: order.email, replyTo: site.footer.email, ...mail});
  await db.update(orders).set({bevestigingVerstuurdOp: new Date()}).where(eq(orders.id, order.id));
}

/** The pickup code with the QR code as an inline PNG; records when it left. */
export async function stuurAfhaalcode(orderId: string): Promise<void> {
  const order = await vindOpId(orderId);
  if (!order?.token) {
    return;
  }

  const actie = content.getActie(order.actie);
  const site = content.getSite();
  const mail = afhaalcodeMail(mailData(order, actie), formatKorteCode(order.korteCode), order.totaalCent === 0);
  await sendMail({
    to: order.email,
    replyTo: site.footer.email,
    ...mail,
    attachments: [{filename: 'afhaalcode.png', content: await qrPng(bestelUrl(order.token)), contentType: 'image/png', cid: 'afhaalcode'}],
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
