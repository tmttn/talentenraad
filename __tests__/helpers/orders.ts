import type {NewOrder, NewOrderLine} from '@lib/db/schema';

let teller = 0;
const tekens = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** A unique short code per number, in the alphabet of real codes. */
const korteCode = (n: number) => Array.from({length: 6}, (_, i) => tekens[Math.floor(n / (32 ** (5 - i))) % 32]).join('');

/** An order row for tests; every call gets its own number, reference, token and code. */
export function testOrder(overrides: Partial<NewOrder> = {}): NewOrder {
  teller++;
  return {
    actie: 'pizzaverkoop',
    nummer: teller,
    volgnummer: teller,
    mededeling: String(teller).padStart(12, '0'),
    token: `token${String(teller).padStart(17, '0')}`,
    korteCode: korteCode(teller),
    naam: `Ouder ${teller}`,
    email: `ouder${teller}@example.com`,
    afhaalId: 'vrijdag',
    afhaalDatum: '2027-01-22',
    afhaalLabel: 'Vrijdag 22 januari, 17:00 - 19:00',
    afhaalPlaats: 'Refter',
    totaalCent: 1000,
    status: 'wacht',
    aangemaaktOp: new Date('2027-01-10T10:00:00'),
    ...overrides,
  };
}

export function testRegel(orderId: string, overrides: Partial<NewOrderLine> = {}): NewOrderLine {
  return {orderId, volgorde: 0, productId: 'margherita', naam: 'Margherita', keuzes: [], prijsCent: 1000, aantal: 1, ...overrides};
}
