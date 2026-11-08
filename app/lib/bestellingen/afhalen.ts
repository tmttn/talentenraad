import {
  and, desc, eq, gte, isNotNull, sql,
} from 'drizzle-orm';
import {db, orderLines, orders, type Order} from '@lib/db';
import {plusDagen} from './acties';
import {zoekVoorwaarde, markeerBetaald} from './beheer';

/** "38 van 52": picked up out of the orders of a pickup moment that are not cancelled. */
export async function afhaalTeller(actie: string, afhaalId: string): Promise<{afgehaald: number; totaal: number}> {
  const [row] = await db.select({
    totaal: sql<number>`sum(case when ${orders.status} in ('wacht', 'betaald', 'afgehaald') then 1 else 0 end)`,
    afgehaald: sql<number>`sum(case when ${orders.status} = 'afgehaald' then 1 else 0 end)`,
  }).from(orders).where(and(eq(orders.actie, actie), eq(orders.afhaalId, afhaalId)));
  return {afgehaald: Number(row?.afgehaald ?? 0), totaal: Number(row?.totaal ?? 0)};
}

export type Afhaalmoment = {actie: string; afhaalId: string; label: string; plaats: string; datum: string; totaal: number; afgehaald: number};

/** Pickup moments with orders, from a week ago on, soonest first: the start screen of the app. */
export async function afhaalmomenten(today: string): Promise<Afhaalmoment[]> {
  const rows = await db.select({
    actie: orders.actie,
    afhaalId: orders.afhaalId,
    label: sql<string>`max(${orders.afhaalLabel})`,
    plaats: sql<string>`max(${orders.afhaalPlaats})`,
    datum: sql<string>`max(${orders.afhaalDatum})`,
    totaal: sql<number>`sum(case when ${orders.status} in ('wacht', 'betaald', 'afgehaald') then 1 else 0 end)`,
    afgehaald: sql<number>`sum(case when ${orders.status} = 'afgehaald' then 1 else 0 end)`,
  }).from(orders)
    .where(and(isNotNull(orders.token), gte(orders.afhaalDatum, plusDagen(today, -7))))
    .groupBy(orders.actie, orders.afhaalId);
  return rows
    .map(row => ({...row, totaal: Number(row.totaal), afgehaald: Number(row.afgehaald)}))
    .sort((a, b) => a.datum.localeCompare(b.datum) || a.label.localeCompare(b.label));
}

/** The last orders handed over at a moment, newest first. */
export async function netMeegegeven(actie: string, afhaalId: string, limit = 5): Promise<Array<{nummer: number; stuks: number; afgehaaldOp: Date}>> {
  // A join, not a correlated subquery: in a single-table select Drizzle drops the table names in
  // sql`` fields, and `order_id = id` would then compare with order_lines.id
  const rows = await db.select({
    nummer: orders.nummer,
    afgehaaldOp: orders.afgehaaldOp,
    stuks: sql<number>`coalesce(sum(${orderLines.aantal}), 0)`,
  }).from(orders)
    .leftJoin(orderLines, eq(orderLines.orderId, orders.id))
    .where(and(eq(orders.actie, actie), eq(orders.afhaalId, afhaalId), eq(orders.status, 'afgehaald')))
    .groupBy(orders.id)
    .orderBy(desc(orders.afgehaaldOp))
    .limit(limit);
  return rows.map(row => ({nummer: row.nummer, stuks: Number(row.stuks), afgehaaldOp: row.afgehaaldOp!}));
}

export type AfgifteResultaat =
  | {status: 'meegegeven'; order: Order}
  | {status: 'al-afgehaald'; op: Date; door: string}
  | {status: 'niet-betaald'; openCent: number}
  | {status: 'geannuleerd'}
  | {status: 'onbekend'};

/**
 * Hands an order over: one conditional update (only while paid), so when two helpers scan the
 * same order, the second one sees when and by whom it was already handed over.
 */
export async function geefMee(orderId: string, door: string, now = new Date()): Promise<AfgifteResultaat> {
  const order = db.transaction(tx => {
    const [updated] = tx.update(orders)
      .set({status: 'afgehaald', afgehaaldOp: now, afgehaaldDoor: door})
      .where(and(eq(orders.id, orderId), eq(orders.status, 'betaald')))
      .returning()
      .all();
    if (updated) {
      tx.update(orderLines).set({meegegeven: true}).where(eq(orderLines.orderId, orderId)).run();
    }

    return updated;
  }, {behavior: 'immediate'});
  if (order) {
    return {status: 'meegegeven', order};
  }

  const [huidig] = await db.select().from(orders).where(eq(orders.id, orderId));
  if (!huidig) {
    return {status: 'onbekend'};
  }

  if (huidig.status === 'afgehaald') {
    return {status: 'al-afgehaald', op: huidig.afgehaaldOp!, door: huidig.afgehaaldDoor ?? ''};
  }

  return huidig.status === 'wacht' ? {status: 'niet-betaald', openCent: huidig.totaalCent} : {status: 'geannuleerd'};
}

/** Cash at the pickup table: only for a waiting order; the caller checks the bank access flag. */
export async function ontvangCash(orderId: string, door: string, now = new Date()): Promise<Order | undefined> {
  const [order] = await markeerBetaald([orderId], 'cash', door, now);
  return order;
}

export type ZoekResultaat = {token: string; nummer: number; naam: string; korteCode: string; status: Order['status']; afhaalId: string; afhaalLabel: string};

/** Search without a QR code: name, number or short code. Only what a helper may see: no e-mail, phone or amounts. */
export async function zoekVoorAfhalen(actie: string, tekst: string): Promise<ZoekResultaat[]> {
  if (tekst.trim() === '') {
    return [];
  }

  const rows = await db.select({
    token: orders.token,
    nummer: orders.nummer,
    naam: orders.naam,
    korteCode: orders.korteCode,
    status: orders.status,
    afhaalId: orders.afhaalId,
    afhaalLabel: orders.afhaalLabel,
  }).from(orders)
    .where(and(eq(orders.actie, actie), isNotNull(orders.token), zoekVoorwaarde(tekst, {email: false})))
    .orderBy(orders.naam)
    .limit(20);
  return rows.filter((row): row is ZoekResultaat => row.token !== null);
}

