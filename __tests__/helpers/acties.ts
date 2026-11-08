import type {Actie} from '@lib/content';
import {actieSchema} from '@lib/content/schemas';

/** A sale as the content reader returns it, for tests. Prices in cents. */
export function testActie(overrides: Record<string, unknown> = {}, slug = 'pizzaverkoop'): Actie {
  const data = actieSchema.parse({
    titel: 'Pizzaverkoop',
    samenvatting: 'Bestel je pizza.',
    bestellen: {van: '2027-01-04', tot: '2027-01-17'},
    betalen: {wijzen: ['overschrijving', 'cash'], binnenDagen: 5, rekening: {iban: 'BE68 5390 0754 7034', begunstigde: 'Talentenraad Het Talentenhuis'}},
    afhalen: [
      {id: 'vrijdag', datum: '2027-01-22', uur: '17:00 - 19:00', plaats: 'Refter'},
      {id: 'zaterdag', datum: '2027-01-23', uur: '10:00 - 12:00', plaats: 'Refter'},
    ],
    producten: [
      {id: 'margherita', naam: 'Margherita', prijs: 1000, voorraad: 3},
      {id: 'mand', naam: 'Ontbijtmand', prijs: 2500, maxPerBestelling: 4, opties: [{id: 'brood', naam: 'Brood', keuzes: [{naam: 'Wit'}, {naam: 'Glutenvrij', meerprijs: 200}]}]},
      {id: 'inschrijving', naam: 'Inschrijving', prijs: 0},
    ],
    ...overrides,
  });
  return {...data, afbeelding: undefined, slug, html: ''} as Actie;
}
