/** Pure helpers for a sale (actie): status, pickup labels and product variants. Client-safe. */
import type {Afhaalmoment, Product} from '../content/schemas';
import {isVoorbeeldRekening} from '../content/iban';

export type ActieStatus = 'binnenkort' | 'open' | 'gesloten';

type Periode = {bestellen: {van: string; tot: string}};

/** From `van` up to and including `tot` (dates as YYYY-MM-DD, compared with today's local date). */
export function actieStatus(actie: Periode, today: string): ActieStatus {
  if (today < actie.bestellen.van) {
    return 'binnenkort';
  }

  return today > actie.bestellen.tot ? 'gesloten' : 'open';
}

const parse = (datum: string) => {
  const [year, month, day] = datum.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
};

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** `2027-01-22` → `vrijdag 22 januari`. */
export function formatDag(datum: string): string {
  return parse(datum).toLocaleDateString('nl-BE', {weekday: 'long', day: 'numeric', month: 'long'});
}

/** `2027-01-22` → `vrijdag`. */
export function weekdag(datum: string): string {
  return parse(datum).toLocaleDateString('nl-BE', {weekday: 'long'});
}

/** `Vrijdag 22 januari, 17:00 - 19:00`. */
export function afhaalLabel(moment: Pick<Afhaalmoment, 'datum' | 'uur'>): string {
  return `${capitalize(formatDag(moment.datum))}, ${moment.uur}`;
}

/** The date `days` after `datum`, as YYYY-MM-DD. */
export function plusDagen(datum: string, days: number): string {
  const date = parse(datum);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export type GekozenKeuze = {optie: string; keuze: string};

export type Variant = {
  /** The choice names, each URI-encoded, joined with `/`; empty for a product without options. */
  sleutel: string;
  keuzes: GekozenKeuze[];
  /** Price per piece in cents, surcharges included. */
  prijs: number;
  /** `Wit` or `Groot, glutenvrij`; empty without options. */
  label: string;
};

/** Every combination of choices of a product, in the order of the options and choices. */
export function productVarianten(product: Pick<Product, 'prijs' | 'opties'>): Variant[] {
  let varianten: Variant[] = [{sleutel: '', keuzes: [], prijs: product.prijs, label: ''}];
  for (const optie of product.opties) {
    varianten = varianten.flatMap(variant => optie.keuzes.map(keuze => ({
      sleutel: variant.sleutel === '' ? encodeURIComponent(keuze.naam) : `${variant.sleutel}/${encodeURIComponent(keuze.naam)}`,
      keuzes: [...variant.keuzes, {optie: optie.naam, keuze: keuze.naam}],
      prijs: variant.prijs + keuze.meerprijs,
      label: variant.label === '' ? keuze.naam : `${variant.label}, ${keuze.naam.toLowerCase()}`,
    })));
  }

  return varianten;
}

const veldPrefix = 'aantal:';

/** Name of the quantity field of one variant in the order form. */
export function veldnaam(productId: string, sleutel: string): string {
  return sleutel === '' ? `${veldPrefix}${productId}` : `${veldPrefix}${productId}:${sleutel}`;
}

/** The reverse of `veldnaam`; undefined for any other field. */
export function leesVeldnaam(name: string): {productId: string; sleutel: string} | undefined {
  if (!name.startsWith(veldPrefix)) {
    return undefined;
  }

  const rest = name.slice(veldPrefix.length);
  const colon = rest.indexOf(':');
  return colon === -1 ? {productId: rest, sleutel: ''} : {productId: rest.slice(0, colon), sleutel: rest.slice(colon + 1)};
}

export type GeslotenReden = 'binnenkort' | 'gesloten' | 'voorbeeldrekening' | 'concept';

/**
 * Whether parents can order now. In production a draft sale never opens, and no sale opens while
 * site.yaml still holds the example account number: parents would pay into the wrong account.
 */
export function kanBestellen(
  actie: Periode & {concept: boolean},
  iban: string,
  today: string,
  production = process.env.NODE_ENV === 'production',
): {open: true} | {open: false; reden: GeslotenReden} {
  const status = actieStatus(actie, today);
  if (status !== 'open') {
    return {open: false, reden: status};
  }

  if (production && actie.concept) {
    return {open: false, reden: 'concept'};
  }

  if (production && isVoorbeeldRekening(iban)) {
    return {open: false, reden: 'voorbeeldrekening'};
  }

  return {open: true};
}
