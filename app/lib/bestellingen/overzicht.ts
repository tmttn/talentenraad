/** Production list and CSV export of a sale's orders. Pure functions over the orders. */
import type {OrderMetRegels} from './bestellingen';
import {formatKorteCode} from './codes';
import {formatMededeling} from './mededeling';
import {regelNaam, statusLabels} from './status';

type Variant = {label: string; aantal: number};
export type ProductTotaal = {productId: string; naam: string; totaal: number; varianten: Variant[]};
export type Productielijst = {
  perMoment: Array<{afhaalId: string; label: string; bestellingen: number; producten: ProductTotaal[]}>;
  totaal: ProductTotaal[];
};

const telt = (order: OrderMetRegels) => order.status === 'wacht' || order.status === 'betaald' || order.status === 'afgehaald';

function optellen(orders: OrderMetRegels[]): ProductTotaal[] {
  const producten = new Map<string, ProductTotaal>();
  for (const order of orders) {
    for (const regel of order.regels) {
      const product = producten.get(regel.productId) ?? {productId: regel.productId, naam: regel.naam, totaal: 0, varianten: []};
      product.totaal += regel.aantal;
      if (regel.keuzes.length > 0) {
        const label = regel.keuzes.map(keuze => keuze.keuze).join(', ');
        const variant = product.varianten.find(item => item.label === label);
        if (variant) {
          variant.aantal += regel.aantal;
        } else {
          product.varianten.push({label, aantal: regel.aantal});
        }
      }

      producten.set(regel.productId, product);
    }
  }

  return [...producten.values()];
}

/** Totals per product and choice, per pickup moment and overall ("84 manden, waarvan 9 glutenvrij"); cancelled orders do not count. */
export function productielijst(orders: OrderMetRegels[]): Productielijst {
  const tellend = orders.filter(telt);
  const momenten = new Map<string, {label: string; datum: string; orders: OrderMetRegels[]}>();
  for (const order of tellend) {
    const moment = momenten.get(order.afhaalId) ?? {label: order.afhaalLabel, datum: order.afhaalDatum, orders: []};
    moment.orders.push(order);
    momenten.set(order.afhaalId, moment);
  }

  return {
    perMoment: [...momenten.entries()]
      .sort(([, a], [, b]) => a.datum.localeCompare(b.datum))
      .map(([afhaalId, moment]) => ({afhaalId, label: moment.label, bestellingen: moment.orders.length, producten: optellen(moment.orders)})),
    totaal: optellen(tellend),
  };
}

/** A cell for Excel: quoted, and a leading = + - @ is neutralized so it is never run as a formula. */
export function csvCel(value: string | number | null | undefined): string {
  let text = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(text)) {
    text = `'${text}`;
  }

  return `"${text.replaceAll('"', '""')}"`;
}

const bedrag = (cent: number) => (cent / 100).toFixed(2).replace('.', ',');
const datumTijd = (date: Date | null) => (date ? date.toLocaleString('nl-BE', {dateStyle: 'short', timeStyle: 'short'}) : '');

/** All orders as CSV for the accounts: semicolons and decimal commas for Excel in Belgium, with a BOM for UTF-8. */
export function naarCsv(orders: OrderMetRegels[]): string {
  const kop = ['Nr.', 'Status', 'Naam', 'E-mail', 'Telefoon', 'Kind', 'Klas', 'Bestelling', 'Bedrag', 'Afhalen', 'Mededeling', 'Korte code', 'Betaalwijze', 'Betaald op', 'Afgehaald op', 'Geannuleerd op', 'Reden', 'Terugbetaald op', 'Notitie', 'Besteld op'];
  const rijen = orders.map(order => [
    order.nummer,
    statusLabels[order.status],
    order.naam,
    order.email,
    order.telefoon,
    order.kindNaam,
    order.kindKlas,
    order.regels.map(regel => `${regel.aantal} × ${regelNaam(regel)}`).join(', '),
    bedrag(order.totaalCent),
    order.afhaalLabel,
    // Without the plus signs: a cell starting with + would be read as a formula
    formatMededeling(order.mededeling).replaceAll('+', ''),
    formatKorteCode(order.korteCode),
    order.betaalwijze,
    datumTijd(order.betaaldOp),
    datumTijd(order.afgehaaldOp),
    datumTijd(order.geannuleerdOp),
    order.annuleerReden,
    datumTijd(order.terugbetaaldOp),
    order.notitie,
    datumTijd(order.aangemaaktOp),
  ]);
  return `﻿${[kop, ...rijen].map(rij => rij.map(csvCel).join(';')).join('\r\n')}\r\n`;
}
