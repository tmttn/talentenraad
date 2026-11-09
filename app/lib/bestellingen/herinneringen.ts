/**
 * Reminder mails that leave by themselves: pay before the deadline, and pick up tomorrow. A task
 * every hour picks the orders that are due and sends between 9 and 20 o'clock, Belgian time.
 */
import {and, eq, isNotNull, isNull} from 'drizzle-orm';
import {content} from '@lib/content';
import {db, orders} from '@lib/db';
import {todayString} from '@lib/dates';
import {plusDagen} from './acties';
import {uitersteBetaaldatum} from './bestellingen';
import {stuurAfhaalHerinnering, stuurBetaalHerinnering} from './mails';

/** Mails leave from 9:00 up to 20:00 (Belgian time): nobody gets one in the middle of the night. */
export const verzendUren = {van: 9, tot: 20} as const;

const uurFormaat = new Intl.DateTimeFormat('nl-BE', {hour: 'numeric', hourCycle: 'h23', timeZone: 'Europe/Brussels'});

export function magNuVersturen(now: Date): boolean {
  const uur = Number(uurFormaat.format(now));
  return uur >= verzendUren.van && uur < verzendUren.tot;
}

/**
 * The orders due for a reminder today, without sending anything.
 * - Pay: still waiting, ordered before today, and today is the day before the deadline or the
 *   deadline itself (when the server did not run the day before).
 * - Pick up: paid, today is the day before the pickup moment, and the pickup code did not leave today.
 * A sale that is gone from content/ and a wiped order (no token) get nothing.
 */
export async function teHerinneren(now = new Date()): Promise<{betalen: string[]; afhalen: string[]}> {
  const today = todayString(now);
  const morgen = plusDagen(today, 1);

  const wachtend = await db.select({id: orders.id, actie: orders.actie, aangemaaktOp: orders.aangemaaktOp}).from(orders)
    .where(and(eq(orders.status, 'wacht'), isNull(orders.betaalHerinneringOp), isNotNull(orders.token)));
  const betalen = wachtend.filter(order => {
    const actie = content.getActie(order.actie);
    if (!actie || todayString(order.aangemaaktOp) >= today) {
      return false;
    }

    const deadline = uitersteBetaaldatum(order, actie);
    return today >= plusDagen(deadline, -1) && today <= deadline;
  }).map(order => order.id);

  const betaald = await db.select({id: orders.id, actie: orders.actie, qrVerstuurdOp: orders.qrVerstuurdOp}).from(orders)
    .where(and(eq(orders.status, 'betaald'), isNull(orders.afhaalHerinneringOp), isNotNull(orders.token), eq(orders.afhaalDatum, morgen)));
  const afhalen = betaald
    .filter(order => content.getActie(order.actie) && (!order.qrVerstuurdOp || todayString(order.qrVerstuurdOp) < today))
    .map(order => order.id);

  return {betalen, afhalen};
}

/** One round: sends what is due, one mail at a time. A failed mail is logged and tried again next round. */
export async function stuurHerinneringen(now = new Date()): Promise<{betalen: number; afhalen: number}> {
  const verstuurd = {betalen: 0, afhalen: 0};
  if (!magNuVersturen(now)) {
    return verstuurd;
  }

  const due = await teHerinneren(now);
  const rondes: Array<[keyof typeof verstuurd, string[], (id: string, now: Date) => Promise<boolean>]> = [
    ['betalen', due.betalen, stuurBetaalHerinnering],
    ['afhalen', due.afhalen, stuurAfhaalHerinnering],
  ];
  for (const [soort, ids, stuur] of rondes) {
    for (const id of ids) {
      try {
        // One at a time: a small SMTP server should not get dozens of connections at once
        if (await stuur(id, now)) {
          verstuurd[soort]++;
        }
      } catch (error) {
        console.error(`[bestellingen] herinnering (${soort}) mislukt`, error instanceof Error ? error.message : 'unknown');
      }
    }
  }

  return verstuurd;
}

const uurMs = 60 * 60 * 1000;
let timer: NodeJS.Timeout | undefined;
let bezig = false;

async function run(): Promise<void> {
  // A slow round never overlaps the next one: no reminder goes out twice
  if (bezig) {
    return;
  }

  bezig = true;
  try {
    const {betalen, afhalen} = await stuurHerinneringen();
    if (betalen + afhalen > 0) {
      console.info(`[bestellingen] herinneringen verstuurd: ${betalen} betalen, ${afhalen} afhalen`);
    }
  } catch (error) {
    console.error('[bestellingen] herinneringen mislukt', error instanceof Error ? error.message : 'unknown');
  } finally {
    bezig = false;
  }
}

/** Runs now and every hour; registers the interval only once. */
export function startHerinneringen(): void {
  if (timer) {
    return;
  }

  timer = setInterval(() => {
    void run();
  }, uurMs);
  timer.unref();
  void run();
}
