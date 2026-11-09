/** Reading and checking the order form; the browser runs the same checks before sending. Client-safe. */
import type {ActieFrontmatter} from '../content/schemas';
import {leesVeldnaam, productVarianten, veldnaam} from './acties';

type ActieVorm = Pick<ActieFrontmatter, 'producten' | 'afhalen' | 'vraag'>;

export type BestelRegel = {productId: string; sleutel: string; aantal: number};

export type BestelInvoer = {
  naam: string;
  email: string;
  telefoon: string;
  kindNaam: string;
  kindKlas: string;
  afhaalId: string;
  regels: BestelRegel[];
};

type Veld = 'naam' | 'email' | 'telefoon' | 'kindNaam' | 'kindKlas' | 'afhaalId' | 'producten';
export type BestelFouten = Partial<Record<Veld | `product:${string}`, string>>;

export const bestelMeldingen = {
  ongeldig: 'Er klopt nog iets niet. Kijk de rode velden na.',
  gewijzigd: 'Deze actie is net aangepast. Kijk je bestelling na en bestel opnieuw.',
  gesloten: 'De bestelperiode is voorbij. Bestellen kan niet meer.',
  uitverkocht: 'Iets uit je bestelling is net uitverkocht. Kijk je bestelling na.',
  verlopen: 'Het formulier stond te lang open. Kijk je bestelling na en bestel opnieuw.',
  mislukt: 'Er ging iets mis bij het bestellen. Probeer het later opnieuw.',
  netwerk: 'Je bestelling is niet verstuurd. Kijk je internetverbinding na en probeer het opnieuw.',
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const telefoonPattern = /^[+\d\s()./-]{6,25}$/;

type Bron = FormData | Record<string, string | undefined>;

const lees = (data: Bron, key: string): string => {
  const value = data instanceof FormData ? data.get(key) : data[key];
  return typeof value === 'string' ? value : '';
};

const sleutels = (data: Bron): string[] => (data instanceof FormData ? [...data.keys()] : Object.keys(data));

/**
 * The form as the server (or the browser) receives it. Quantity fields are `aantal:<product>` or
 * `aantal:<product>:<choices>`; an empty field is 0. `gewijzigd` means a quantity for a product or
 * choice that the sale no longer has: the sale changed while the form was open.
 */
export function leesBestelFormulier(actie: ActieVorm, data: Bron): {invoer: BestelInvoer; fouten: BestelFouten; gewijzigd: boolean} {
  const fouten: BestelFouten = {};
  const regels: BestelRegel[] = [];
  const bekend = new Set<string>();

  for (const product of actie.producten) {
    for (const variant of productVarianten(product)) {
      const naam = veldnaam(product.id, variant.sleutel);
      bekend.add(naam);
      const raw = lees(data, naam).trim();
      if (raw === '' || raw === '0') {
        continue;
      }

      if (!/^\d{1,3}$/.test(raw)) {
        fouten[`product:${product.id}`] ??= 'Vul een aantal in, bv. 2.';
        continue;
      }

      regels.push({productId: product.id, sleutel: variant.sleutel, aantal: Number(raw)});
    }
  }

  const gewijzigd = sleutels(data).some(key => {
    if (leesVeldnaam(key) === undefined || bekend.has(key)) {
      return false;
    }

    const value = lees(data, key).trim();
    return value !== '' && value !== '0';
  });

  return {
    invoer: {
      naam: lees(data, 'naam').trim(),
      email: lees(data, 'email').trim(),
      telefoon: lees(data, 'telefoon').trim(),
      kindNaam: lees(data, 'kindNaam').trim(),
      kindKlas: lees(data, 'kindKlas').trim(),
      afhaalId: lees(data, 'afhaalId').trim(),
      regels,
    },
    fouten,
    gewijzigd,
  };
}

/** Pieces per product, over all its variants. */
export function stuksPerProduct(regels: BestelRegel[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const regel of regels) {
    totals.set(regel.productId, (totals.get(regel.productId) ?? 0) + regel.aantal);
  }

  return totals;
}

/** `emailVerplicht: false` for an order the board enters: a parent without e-mail can order too, but a filled-in address must be valid. */
export function controleerBestelling(actie: ActieVorm, invoer: BestelInvoer, {emailVerplicht = true}: {emailVerplicht?: boolean} = {}): BestelFouten {
  const fouten: BestelFouten = {};

  if (invoer.naam === '') {
    fouten.naam = 'Vul je naam in.';
  } else if (invoer.naam.length < 2) {
    fouten.naam = 'Vul je volledige naam in.';
  } else if (invoer.naam.length > 100) {
    fouten.naam = 'Je naam is te lang: hoogstens 100 tekens.';
  }

  if (invoer.email === '') {
    if (emailVerplicht) {
      fouten.email = 'Vul je e-mailadres in, bv. naam@voorbeeld.be';
    }
  } else if (!emailPattern.test(invoer.email) || invoer.email.length > 200) {
    fouten.email = 'Vul een volledig e-mailadres in, bv. naam@voorbeeld.be';
  }

  if (invoer.telefoon !== '' && !telefoonPattern.test(invoer.telefoon)) {
    fouten.telefoon = 'Vul een geldig telefoonnummer in, of laat het leeg.';
  }

  if (actie.vraag.kind) {
    if (invoer.kindNaam === '') {
      fouten.kindNaam = 'Vul de naam van je kind in.';
    } else if (invoer.kindNaam.length > 100) {
      fouten.kindNaam = 'De naam is te lang: hoogstens 100 tekens.';
    }

    if (invoer.kindKlas === '') {
      fouten.kindKlas = 'Vul de klas van je kind in.';
    } else if (invoer.kindKlas.length > 40) {
      fouten.kindKlas = 'De klas is te lang: hoogstens 40 tekens.';
    }
  }

  if (!actie.afhalen.some(moment => moment.id === invoer.afhaalId)) {
    fouten.afhaalId = 'Kies wanneer je afhaalt.';
  }

  const stuks = stuksPerProduct(invoer.regels);
  if (stuks.size === 0) {
    fouten.producten = 'Kies minstens één product.';
  }

  for (const product of actie.producten) {
    const aantal = stuks.get(product.id) ?? 0;
    if (aantal > product.maxPerBestelling) {
      fouten[`product:${product.id}`] = `Maximaal ${product.maxPerBestelling} ${product.naam} per bestelling.`;
    }
  }

  return fouten;
}
