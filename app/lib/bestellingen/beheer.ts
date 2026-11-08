import {
  and, asc, count, desc, eq, inArray, isNull, or, sql, sum,
} from 'drizzle-orm';
import {db, orderLines, orders, type Order, type OrderStatus} from '@lib/db';
import type {OrderMetRegels} from './bestellingen';
import {korteCodeTekens, normaliseerKorteCode} from './codes';
import {mededelingCijfers} from './mededeling';

export type Tellers = {
  /** Orders that are not cancelled. */
  bestellingen: number;
  /** Paid or picked up. */
  betaald: number;
  teOntvangenCent: number;
  afgehaald: number;
  terugTeBetalen: number;
  terugTeBetalenCent: number;
};

export async function tellers(actie: string): Promise<Tellers> {
  const rows = await db.select({status: orders.status, aantal: count(), bedrag: sum(orders.totaalCent)})
    .from(orders)
    .where(eq(orders.actie, actie))
    .groupBy(orders.status);
  const per = (status: OrderStatus) => rows.find(row => row.status === status);
  const aantal = (status: OrderStatus) => per(status)?.aantal ?? 0;
  const bedrag = (status: OrderStatus) => Number(per(status)?.bedrag ?? 0);
  return {
    bestellingen: aantal('wacht') + aantal('betaald') + aantal('afgehaald'),
    betaald: aantal('betaald') + aantal('afgehaald'),
    teOntvangenCent: bedrag('wacht'),
    afgehaald: aantal('afgehaald'),
    terugTeBetalen: aantal('terugbetalen'),
    terugTeBetalenCent: bedrag('terugbetalen'),
  };
}

/** Every sale that has orders, with the number of orders that are not cancelled. */
export async function actiesMetBestellingen(): Promise<Array<{actie: string; aantal: number}>> {
  const rows = await db.select({
    actie: orders.actie,
    aantal: sql<number>`sum(case when ${orders.status} in ('wacht', 'betaald', 'afgehaald') then 1 else 0 end)`,
  }).from(orders).groupBy(orders.actie);
  return rows.map(row => ({actie: row.actie, aantal: Number(row.aantal)}));
}

export type Filter = {status?: string; afhaalId?: string; zoek?: string};

const isStatus = (value: string | undefined): value is OrderStatus =>
  ['wacht', 'betaald', 'afgehaald', 'geannuleerd', 'terugbetalen'].includes(value ?? '');

/**
 * The condition for a search: order number, short code, payment reference, or a piece of the name or
 * e-mail. The pickup app searches without e-mail (`email: false`): a helper never sees addresses.
 */
export function zoekVoorwaarde(zoek: string, {email = true}: {email?: boolean} = {}) {
  const tekst = zoek.trim();
  const cijfers = mededelingCijfers(tekst);
  if (cijfers) {
    return eq(orders.mededeling, cijfers);
  }

  if (/^\d{1,6}$/.test(tekst)) {
    return eq(orders.nummer, Number(tekst));
  }

  const code = normaliseerKorteCode(tekst);
  const pattern = `%${tekst.toLowerCase().replaceAll(/[%_\\]/g, character => `\\${character}`)}%`;
  const naam = sql`lower(${orders.naam}) like ${pattern} escape '\\'`;
  const opNaam = email ? or(naam, sql`lower(${orders.email}) like ${pattern} escape '\\'`) : naam;
  return code.length === 6 && [...code].every(character => korteCodeTekens.includes(character))
    ? or(eq(orders.korteCode, code), opNaam)
    : opNaam;
}

export async function zoekBestellingen(actie: string, filter: Filter = {}): Promise<OrderMetRegels[]> {
  const voorwaarden = [eq(orders.actie, actie)];
  if (isStatus(filter.status)) {
    voorwaarden.push(eq(orders.status, filter.status));
  }

  if (filter.afhaalId) {
    voorwaarden.push(eq(orders.afhaalId, filter.afhaalId));
  }

  if (filter.zoek?.trim()) {
    voorwaarden.push(zoekVoorwaarde(filter.zoek)!);
  }

  return db.query.orders.findMany({
    where: and(...voorwaarden),
    orderBy: [desc(orders.nummer)],
    with: {regels: {orderBy: [asc(orderLines.volgorde)]}},
  });
}

export async function vindOpNummer(actie: string, nummer: number): Promise<OrderMetRegels | undefined> {
  return db.query.orders.findFirst({
    where: and(eq(orders.actie, actie), eq(orders.nummer, nummer)),
    with: {regels: {orderBy: [asc(orderLines.volgorde)]}},
  });
}

/**
 * Marks waiting orders as paid. Only orders that still wait change (one conditional update), so a
 * cancelled order or one somebody else just confirmed is left alone. Returns the changed orders.
 */
export async function markeerBetaald(ids: string[], wijze: 'overschrijving' | 'cash', door: string, now = new Date()): Promise<Order[]> {
  if (ids.length === 0) {
    return [];
  }

  return db.update(orders)
    .set({status: 'betaald', betaalwijze: wijze, betaalbron: 'manueel', betaaldOp: now, betaaldDoor: door})
    .where(and(inArray(orders.id, ids), eq(orders.status, 'wacht')))
    .returning();
}

/** Cancels by the board, with a reason. A paid order goes on the list to pay back. */
export async function annuleer(id: string, reden: string, door: string, now = new Date()): Promise<Order | undefined> {
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order || (order.status !== 'wacht' && order.status !== 'betaald')) {
    return undefined;
  }

  const [updated] = await db.update(orders)
    .set({
      status: order.status === 'betaald' ? 'terugbetalen' : 'geannuleerd',
      geannuleerdOp: now,
      geannuleerdDoor: door,
      annuleerReden: reden.trim().slice(0, 300) || 'Geannuleerd door het bestuur',
    })
    .where(and(eq(orders.id, id), eq(orders.status, order.status)))
    .returning();
  return updated;
}

/** The money went back: the order stays cancelled, with the date of the refund. */
export async function markeerTerugbetaald(id: string, door: string, now = new Date()): Promise<Order | undefined> {
  const [updated] = await db.update(orders)
    .set({status: 'geannuleerd', terugbetaaldOp: now, terugbetaaldDoor: door})
    .where(and(eq(orders.id, id), eq(orders.status, 'terugbetalen')))
    .returning();
  return updated;
}

export async function zetNotitie(id: string, tekst: string): Promise<Order | undefined> {
  const notitie = tekst.trim().slice(0, 500);
  const [updated] = await db.update(orders)
    .set({notitie: notitie === '' ? null : notitie})
    .where(and(eq(orders.id, id), isNull(orders.gewistOp)))
    .returning();
  return updated;
}

/** Orders of a sale for the export and the production list, oldest first. */
export async function alleBestellingen(actie: string): Promise<OrderMetRegels[]> {
  return db.query.orders.findMany({
    where: eq(orders.actie, actie),
    orderBy: [asc(orders.nummer)],
    with: {regels: {orderBy: [asc(orderLines.volgorde)]}},
  });
}
