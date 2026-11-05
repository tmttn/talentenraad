import {and, eq, isNull, max} from 'drizzle-orm';
import {db, orders} from '@lib/db';
import {todayString} from '@lib/dates';

/** Months after the last pickup moment of a sale before the personal data of its orders is wiped. */
export const bewaarMaanden = 3;

/** The date `maanden` months after `datum` (YYYY-MM-DD), clamped to the end of a shorter month. */
export function plusMaanden(datum: string, maanden: number): string {
  const [year, month, day] = datum.split('-').map(Number);
  const target = new Date(year, month - 1 + maanden, 1, 12);
  const last = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(day, last));
  return todayString(target);
}

/**
 * Wipes name, e-mail, phone, child, class, note and token of every order of a sale whose last
 * pickup moment lies more than three months back. Number, products, amounts and dates stay for
 * the accounts. Returns how many orders were wiped.
 */
export async function wisVerlopen(now = new Date()): Promise<number> {
  const today = todayString(now);
  const acties = await db.select({actie: orders.actie, laatste: max(orders.afhaalDatum)})
    .from(orders)
    .where(isNull(orders.gewistOp))
    .groupBy(orders.actie);

  let gewist = 0;
  for (const {actie, laatste} of acties) {
    if (!laatste || plusMaanden(laatste, bewaarMaanden) > today) {
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    const rows = await db.update(orders)
      .set({naam: '(gewist)', email: '', telefoon: null, kindNaam: null, kindKlas: null, notitie: null, token: null, gewistOp: now})
      .where(and(eq(orders.actie, actie), isNull(orders.gewistOp)))
      .returning({id: orders.id});
    gewist += rows.length;
  }

  return gewist;
}

const dayMs = 24 * 60 * 60 * 1000;
let timer: NodeJS.Timeout | undefined;

async function run(): Promise<void> {
  try {
    const gewist = await wisVerlopen();
    if (gewist > 0) {
      console.info(`[bestellingen] persoonsgegevens van ${gewist} bestelling(en) gewist`);
    }
  } catch (error) {
    console.error('[bestellingen] wissen mislukt', error instanceof Error ? error.message : 'unknown');
  }
}

/** Runs now and every 24 hours; registers the interval only once. */
export function startBewaartermijn(): void {
  if (timer) {
    return;
  }

  timer = setInterval(() => {
    void run();
  }, dayMs);
  timer.unref();
  void run();
}
