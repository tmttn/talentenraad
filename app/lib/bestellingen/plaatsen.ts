import {
  and, eq, inArray, max, notInArray, sql,
} from 'drizzle-orm';
import {db, orderLines, orders} from '@lib/db';
import type {Actie} from '@lib/content';
import {todayString} from '@lib/dates';
import {checkFormToken} from '@lib/form-timing';
import {createPersistentRateLimiter} from '@lib/persistent-rate-limit';
import {formRateLimit} from '@lib/rate-limit';
import {afhaalLabel, kanBestellen, productVarianten, type GeslotenReden} from './acties';
import {nieuweKorteCode, nieuwToken} from './codes';
import {
  controleerBestelling, leesBestelFormulier, stuksPerProduct, type BestelFouten,
} from './formulier';
import {mededelingVoor} from './mededeling';
import {verstuurNaBestelling} from './mails';

export const bestelFormPurpose = 'bestellen';

export type PlaatsResultaat =
  | {status: 'besteld'; token: string; nummer: number}
  | {status: 'spam'}
  | {status: 'ongeldig'; fouten: BestelFouten}
  | {status: 'gewijzigd'}
  | {status: 'gesloten'; reden: GeslotenReden}
  | {status: 'uitverkocht'; fouten: BestelFouten}
  | {status: 'beperkt'}
  | {status: 'verlopen'}
  | {status: 'mislukt'};

export type PlaatsInvoer = {
  data: FormData | Record<string, string | undefined>;
  /** Honeypot: hidden from people, filled in by bots. */
  website?: string;
  /** Signed "shown at" token from the page (see form-timing). */
  formToken?: string;
};

const rateLimiter = createPersistentRateLimiter({scope: bestelFormPurpose, ...formRateLimit});

/** Statuses whose pieces no longer count against the stock. */
export const vrijgegeven = ['geannuleerd', 'terugbetalen'] as const;

class Uitverkocht extends Error {
  constructor(readonly fouten: BestelFouten) {
    super('uitverkocht');
  }
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** Pieces of each product already ordered for a sale, over the orders that are not cancelled. */
export function verbruikteVoorraad(tx: Tx | typeof db, actie: string, productIds: string[]): Map<string, number> {
  if (productIds.length === 0) {
    return new Map();
  }

  const rows = tx.select({productId: orderLines.productId, aantal: sql<number>`sum(${orderLines.aantal})`})
    .from(orderLines)
    .innerJoin(orders, eq(orders.id, orderLines.orderId))
    .where(and(eq(orders.actie, actie), notInArray(orders.status, [...vrijgegeven]), inArray(orderLines.productId, productIds)))
    .groupBy(orderLines.productId)
    .all();
  return new Map(rows.map(row => [row.productId, Number(row.aantal)]));
}

/**
 * Handles one order: spam checks, validation, and then stock, numbers and the insert in one
 * BEGIN IMMEDIATE transaction, so two parents can never both buy the last piece. Spam gets the
 * same calm answer as a real order would, without a row. The mail goes out in the background.
 */
export async function plaatsBestelling(
  actie: Actie,
  input: PlaatsInvoer,
  clientIp: string,
  now = new Date(),
): Promise<PlaatsResultaat> {
  if (typeof input.website === 'string' && input.website.trim() !== '') {
    console.warn('spam: honeypot');
    return {status: 'spam'};
  }

  if (!rateLimiter.check(clientIp, now.getTime())) {
    return {status: 'beperkt'};
  }

  const open = kanBestellen(actie, todayString(now));
  if (!open.open) {
    return {status: 'gesloten', reden: open.reden};
  }

  const {invoer, fouten: leesFouten, gewijzigd} = leesBestelFormulier(actie, input.data);
  if (gewijzigd) {
    return {status: 'gewijzigd'};
  }

  const fouten = {...controleerBestelling(actie, invoer), ...leesFouten};
  if (Object.keys(fouten).length > 0) {
    return {status: 'ongeldig', fouten};
  }

  // After validation, so a person who sends an incomplete form quickly still sees what is missing
  const timing = checkFormToken(bestelFormPurpose, input.formToken, now.getTime());
  if (timing === 'too-fast' || timing === 'invalid') {
    console.warn(`spam: form timing (${timing})`);
    return {status: 'spam'};
  }

  if (timing === 'expired') {
    return {status: 'verlopen'};
  }

  const moment = actie.afhalen.find(item => item.id === invoer.afhaalId)!;
  const regels = invoer.regels.map((regel, volgorde) => {
    const product = actie.producten.find(item => item.id === regel.productId)!;
    const variant = productVarianten(product).find(item => item.sleutel === regel.sleutel)!;
    return {
      volgorde, productId: product.id, naam: product.naam, keuzes: variant.keuzes, prijsCent: variant.prijs, aantal: regel.aantal,
    };
  });
  const totaalCent = regels.reduce((total, regel) => total + (regel.prijsCent * regel.aantal), 0);
  const gratis = totaalCent === 0;
  const token = nieuwToken();

  let id: string;
  let nummer: number;
  try {
    ({id, nummer} = db.transaction(tx => {
      const gevraagd = stuksPerProduct(invoer.regels);
      const metVoorraad = actie.producten.filter(product => product.voorraad !== undefined && gevraagd.has(product.id));
      const verbruikt = verbruikteVoorraad(tx, actie.slug, metVoorraad.map(product => product.id));
      const tekort: BestelFouten = {};
      for (const product of metVoorraad) {
        const over = Math.max(0, product.voorraad! - (verbruikt.get(product.id) ?? 0));
        if (gevraagd.get(product.id)! > over) {
          tekort[`product:${product.id}`] = over === 0 ? `${product.naam} is uitverkocht.` : `Nog ${over} ${product.naam} over.`;
        }
      }

      if (Object.keys(tekort).length > 0) {
        throw new Uitverkocht(tekort);
      }

      const [{laatste}] = tx.select({laatste: max(orders.nummer)}).from(orders).where(eq(orders.actie, actie.slug)).all();
      const [{hoogste}] = tx.select({hoogste: max(orders.volgnummer)}).from(orders).all();
      const volgnummer = (hoogste ?? 0) + 1;
      let korteCode = nieuweKorteCode();
      for (let poging = 0; tx.select({id: orders.id}).from(orders).where(and(eq(orders.actie, actie.slug), eq(orders.korteCode, korteCode))).get() && poging < 20; poging++) {
        korteCode = nieuweKorteCode();
      }

      const [order] = tx.insert(orders).values({
        actie: actie.slug,
        nummer: (laatste ?? 0) + 1,
        volgnummer,
        mededeling: mededelingVoor(volgnummer),
        token,
        korteCode,
        naam: invoer.naam,
        email: invoer.email,
        telefoon: invoer.telefoon || null,
        kindNaam: actie.vraag.kind ? invoer.kindNaam : null,
        kindKlas: actie.vraag.kind ? invoer.kindKlas : null,
        afhaalId: moment.id,
        afhaalDatum: moment.datum,
        afhaalLabel: afhaalLabel(moment),
        afhaalPlaats: moment.plaats,
        totaalCent,
        // A free order is confirmed at once and gets its QR code straight away
        status: gratis ? 'betaald' : 'wacht',
        betaaldOp: gratis ? now : null,
        aangemaaktOp: now,
      }).returning({id: orders.id, nummer: orders.nummer}).all();
      tx.insert(orderLines).values(regels.map(regel => ({...regel, orderId: order.id}))).run();
      return order;
    }, {behavior: 'immediate'}));
  } catch (error) {
    if (error instanceof Uitverkocht) {
      return {status: 'uitverkocht', fouten: error.fouten};
    }

    console.error('Order failed', error instanceof Error ? error.message : 'unknown');
    return {status: 'mislukt'};
  }

  // Mail in the background: a failing mail never loses the order; the order page shows the same
  verstuurNaBestelling(id).catch((error: unknown) => {
    console.error('Order mail failed', error instanceof Error ? error.message : 'unknown');
  });

  return {status: 'besteld', token, nummer};
}
