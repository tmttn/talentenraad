/** What the hand-over screen of the pickup app says about a scanned order. No database: client-safe. */
import type {Order} from '@lib/db/schema';

export type AfgifteToestand =
  | {soort: 'klaar'}
  | {soort: 'niet-betaald'; openCent: number}
  | {soort: 'al-afgehaald'; op: Date; door: string}
  | {soort: 'geannuleerd'};

export type Afgifte = {
  toestand: AfgifteToestand;
  /** The pickup moment of the order, when it is not the one this helper is at. */
  anderMoment?: string;
  /** Only a paid order can be handed over. */
  magMeegeven: boolean;
};

type Gescand = Pick<Order, 'actie' | 'afhaalId' | 'afhaalLabel' | 'status' | 'totaalCent' | 'afgehaaldOp' | 'afgehaaldDoor'>;

function toestandVan(order: Gescand): AfgifteToestand {
  switch (order.status) {
    case 'betaald': {
      return {soort: 'klaar'};
    }

    case 'wacht': {
      return {soort: 'niet-betaald', openCent: order.totaalCent};
    }

    case 'afgehaald': {
      return {soort: 'al-afgehaald', op: order.afgehaaldOp ?? new Date(0), door: order.afgehaaldDoor ?? ''};
    }

    default: {
      // Geannuleerd, or cancelled after paying (terugbetalen)
      return {soort: 'geannuleerd'};
    }
  }
}

/** The state of a scanned order at the pickup moment `waar` (sale and moment of the helper). */
export function afgifte(order: Gescand, waar: {actie: string; moment: string}): Afgifte {
  const anderMoment = order.actie === waar.actie && order.afhaalId === waar.moment
    ? undefined
    : order.afhaalLabel.charAt(0).toLowerCase() + order.afhaalLabel.slice(1);
  const toestand = toestandVan(order);
  return {toestand, anderMoment, magMeegeven: toestand.soort === 'klaar'};
}

const tijdzone = 'Europe/Brussels';

/** `17:42`, in Belgian time whatever the server's time zone. */
export function formatTijd(date: Date): string {
  return date.toLocaleTimeString('nl-BE', {hour: '2-digit', minute: '2-digit', timeZone: tijdzone});
}

const dag = (date: Date) => date.toLocaleDateString('nl-BE', {day: 'numeric', month: 'long', timeZone: tijdzone});

/** "Al afgehaald om 17:42 door Sara"; on another day than today with the date. */
export function alAfgehaaldTekst(op: Date, door: string, now = new Date()): string {
  const wanneer = dag(op) === dag(now) ? `om ${formatTijd(op)}` : `op ${dag(op)} om ${formatTijd(op)}`;
  return `Al afgehaald ${wanneer}${door ? ` door ${door}` : ''}`;
}
