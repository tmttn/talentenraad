import type {Actie} from '@lib/content';
import {controleerBestelling, leesBestelFormulier, type BestelFouten} from './formulier';
import {verstuurNaBestelling} from './mails';
import {bewaarBestelling} from './plaatsen';

export type HandmatigResultaat =
  | {status: 'besteld'; id: string; nummer: number}
  | {status: 'ongeldig'; fouten: BestelFouten}
  | {status: 'gewijzigd'}
  | {status: 'uitverkocht'; fouten: BestelFouten}
  | {status: 'mislukt'};

type Bron = FormData | Record<string, string | undefined>;

const lees = (data: Bron, key: string): string => {
  const value = data instanceof FormData ? data.get(key) : data[key];
  return typeof value === 'string' ? value : '';
};

/**
 * An order the board enters for a parent without e-mail, or one taken at the school gate. The same
 * checks as online (stock in the same transaction, maximum per order, child and class), but without
 * the ordering period and the spam checks: only staff gets here, and a late order can still go in.
 * Without e-mail no mail ever leaves; with e-mail the parent gets the same mails as online.
 * `cashBetaaldDoor` only for someone with access to the bank account: the caller checks that.
 */
export async function plaatsHandmatig(
  actie: Actie,
  data: Bron,
  {door, cashBetaaldDoor}: {door: string; cashBetaaldDoor?: string},
  now = new Date(),
): Promise<HandmatigResultaat> {
  const {invoer, fouten: leesFouten, gewijzigd} = leesBestelFormulier(actie, data);
  if (gewijzigd) {
    return {status: 'gewijzigd'};
  }

  const fouten = {...controleerBestelling(actie, invoer, {emailVerplicht: false}), ...leesFouten};
  if (Object.keys(fouten).length > 0) {
    return {status: 'ongeldig', fouten};
  }

  const bewaard = bewaarBestelling(actie, invoer, now, {ingevoerdDoor: door, cashBetaaldDoor, notitie: lees(data, 'notitie')});
  if (bewaard.status !== 'bewaard') {
    return bewaard;
  }

  if (invoer.email !== '') {
    verstuurNaBestelling(bewaard.id).catch((error: unknown) => {
      console.error('Order mail failed', error instanceof Error ? error.message : 'unknown');
    });
  }

  return {status: 'besteld', id: bewaard.id, nummer: bewaard.nummer};
}
