import {and, asc, eq, inArray} from 'drizzle-orm';
import {db, orderLines, orders, type Order, type OrderLine, type OrderStatus} from '@lib/db';
import {todayString} from '@lib/dates';
import {actieStatus, plusDagen} from './acties';
import {isTokenVorm} from './codes';

export type OrderMetRegels = Order & {regels: OrderLine[]};

/** The order with its lines, ordered as they were ordered. */
export async function vindBestelling(where: ReturnType<typeof eq>): Promise<OrderMetRegels | undefined> {
  return db.query.orders.findFirst({
    where,
    with: {regels: {orderBy: [asc(orderLines.volgorde)]}},
  });
}

export async function vindOpToken(token: string): Promise<OrderMetRegels | undefined> {
  return isTokenVorm(token) ? vindBestelling(eq(orders.token, token)) : undefined;
}

export async function vindOpId(id: string): Promise<OrderMetRegels | undefined> {
  return vindBestelling(eq(orders.id, id));
}

/** The last day to pay: the day of ordering plus the sale's number of days. */
export function uitersteBetaaldatum(order: Pick<Order, 'aangemaaktOp'>, actie: {betalen: {binnenDagen: number}}): string {
  return plusDagen(todayString(order.aangemaaktOp), actie.betalen.binnenDagen);
}

/** A parent may cancel a waiting or paid order while the ordering period is still open. */
export function kanOuderAnnuleren(order: Pick<Order, 'status'>, actie: {bestellen: {van: string; tot: string}} | undefined, now = new Date()): boolean {
  return actie !== undefined
    && (order.status === 'wacht' || order.status === 'betaald')
    && actieStatus(actie, todayString(now)) === 'open';
}

/**
 * Cancels on behalf of the parent. A paid order goes on the list to pay back. One conditional
 * update, so a payment confirmed at the same moment is never lost.
 */
export async function annuleerDoorOuder(
  token: string,
  actie: {bestellen: {van: string; tot: string}} | undefined,
  now = new Date(),
): Promise<{status: 'geannuleerd' | 'terugbetalen'; order: Order} | {status: 'niet-mogelijk'}> {
  const order = await vindOpToken(token);
  if (!order || !kanOuderAnnuleren(order, actie, now)) {
    return {status: 'niet-mogelijk'};
  }

  const nieuw: OrderStatus = order.status === 'betaald' ? 'terugbetalen' : 'geannuleerd';
  const [updated] = await db.update(orders)
    .set({status: nieuw, geannuleerdOp: now, geannuleerdDoor: 'ouder', annuleerReden: 'Geannuleerd door de ouder'})
    .where(and(eq(orders.id, order.id), inArray(orders.status, [order.status])))
    .returning();
  return updated ? {status: nieuw as 'geannuleerd' | 'terugbetalen', order: updated} : {status: 'niet-mogelijk'};
}
