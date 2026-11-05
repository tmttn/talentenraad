import {csvCel, naarCsv, productielijst} from '@lib/bestellingen/overzicht';
import type {OrderMetRegels} from '@lib/bestellingen/bestellingen';
import type {OrderLine} from '@lib/db/schema';

const regel = (productId: string, naam: string, aantal: number, keuze?: string): OrderLine => ({
  id: `${productId}-${keuze ?? ''}-${aantal}`, orderId: 'o', volgorde: 0, productId, naam, aantal, prijsCent: 1000, meegegeven: false,
  keuzes: keuze ? [{optie: 'Brood', keuze}] : [],
});

const order = (overrides: Partial<OrderMetRegels>): OrderMetRegels => ({
  id: 'o', actie: 'a', nummer: 1, volgnummer: 1, mededeling: '000000000101', token: 't', korteCode: 'K7P4QX', naam: 'Ouder', email: 'o@example.com',
  telefoon: null, kindNaam: null, kindKlas: null, afhaalId: 'vrijdag', afhaalDatum: '2027-01-22', afhaalLabel: 'Vrijdag 22 januari, 17:00 - 19:00',
  afhaalPlaats: 'Refter', totaalCent: 1000, status: 'wacht', betaalwijze: null, betaalbron: null, betaaldOp: null, betaaldDoor: null, afgehaaldOp: null,
  afgehaaldDoor: null, geannuleerdOp: null, geannuleerdDoor: null, annuleerReden: null, terugbetaaldOp: null, terugbetaaldDoor: null, notitie: null,
  bevestigingVerstuurdOp: null, qrVerstuurdOp: null, gewistOp: null, aangemaaktOp: new Date('2027-01-10T10:00:00'), regels: [], ...overrides,
});

describe('productielijst', () => {
  it('totals per moment and per choice, without cancelled orders', () => {
    const lijst = productielijst([
      order({regels: [regel('mand', 'Mand', 2, 'Wit'), regel('mand', 'Mand', 1, 'Glutenvrij')]}),
      order({afhaalId: 'zaterdag', afhaalDatum: '2027-01-23', afhaalLabel: 'Zaterdag', regels: [regel('mand', 'Mand', 3, 'Wit')]}),
      order({status: 'geannuleerd', regels: [regel('mand', 'Mand', 9, 'Wit')]}),
      order({status: 'afgehaald', regels: [regel('cava', 'Cava', 1)]}),
    ]);

    expect(lijst.perMoment.map(moment => [moment.afhaalId, moment.bestellingen])).toEqual([['vrijdag', 2], ['zaterdag', 1]]);
    expect(lijst.perMoment[0].producten).toEqual([
      {productId: 'mand', naam: 'Mand', totaal: 3, varianten: [{label: 'Wit', aantal: 2}, {label: 'Glutenvrij', aantal: 1}]},
      {productId: 'cava', naam: 'Cava', totaal: 1, varianten: []},
    ]);
    expect(lijst.totaal[0]).toEqual({productId: 'mand', naam: 'Mand', totaal: 6, varianten: [{label: 'Wit', aantal: 5}, {label: 'Glutenvrij', aantal: 1}]});
  });
});

describe('CSV', () => {
  it('neutralizes formulas and quotes', () => {
    expect(csvCel('=SUM(A1)')).toBe('"\'=SUM(A1)"');
    expect(csvCel('-1')).toBe('"\'-1"');
    expect(csvCel('O\'Brien "jr"')).toBe('"O\'Brien ""jr"""');
    expect(csvCel(null)).toBe('""');
    expect(csvCel(14)).toBe('"14"');
  });

  it('writes a semicolon file with a BOM and Belgian amounts', () => {
    const csv = naarCsv([order({naam: '@ouder', totaalCent: 3250, regels: [regel('mand', 'Mand', 2, 'Wit')]})]);
    expect(csv.startsWith('﻿"Nr.";"Status"')).toBe(true);
    expect(csv).toContain('"1";"Wacht op betaling";"\'@ouder"');
    expect(csv).toContain('"2 × Mand (wit)";"32,50"');
    expect(csv).toContain('"000/0000/00101";"K7P-4QX"');
    expect(csv.split('\r\n')).toHaveLength(3);
  });
});
