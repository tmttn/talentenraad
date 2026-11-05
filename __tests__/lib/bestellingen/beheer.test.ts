// @vitest-environment node
import {
  afterAll, beforeEach, describe, expect, it, vi,
} from 'vitest';
import type {createTestDb} from '../../helpers/db';
import {testOrder, testRegel} from '../../helpers/orders';

const test = vi.hoisted(() => ({current: undefined as undefined | {db: unknown}}));

vi.mock('@lib/db', async () => {
  const schema = await import('../../../app/lib/db/schema');
  const {createTestDb} = await import('../../helpers/db');
  const created = createTestDb();
  test.current = created;
  return {...schema, db: created.db};
});

const {orders, orderLines} = await import('@lib/db/schema');
const beheer = await import('@lib/bestellingen/beheer');
const testDb = test.current as unknown as ReturnType<typeof createTestDb>;

async function maak(overrides: Parameters<typeof testOrder>[0] = {}) {
  const [order] = await testDb.db.insert(orders).values(testOrder(overrides)).returning();
  await testDb.db.insert(orderLines).values(testRegel(order.id));
  return order;
}

beforeEach(() => {
  testDb.reset();
});

afterAll(() => {
  testDb.close();
});

describe('tellers', () => {
  it('counts orders, payments, money to receive and pickups; cancelled ones do not count', async () => {
    await maak({status: 'wacht', totaalCent: 3200});
    await maak({status: 'wacht', totaalCent: 1000});
    await maak({status: 'betaald'});
    await maak({status: 'afgehaald'});
    await maak({status: 'geannuleerd'});
    await maak({status: 'terugbetalen', totaalCent: 1200});
    await maak({actie: 'andere', status: 'wacht'});

    expect(await beheer.tellers('pizzaverkoop')).toEqual({
      bestellingen: 4, betaald: 2, teOntvangenCent: 4200, afgehaald: 1, terugTeBetalen: 1, terugTeBetalenCent: 1200,
    });
    expect(await beheer.actiesMetBestellingen()).toEqual(expect.arrayContaining([{actie: 'pizzaverkoop', aantal: 4}, {actie: 'andere', aantal: 1}]));
  });
});

describe('zoekBestellingen', () => {
  it('finds by name, e-mail, number, short code and payment reference', async () => {
    const a = await maak({naam: 'Sara Peeters', korteCode: 'K7P4QX', mededeling: '000000001414', nummer: 14});
    await maak({naam: 'Jan Janssens'});
    const ids = async (zoek: string) => (await beheer.zoekBestellingen('pizzaverkoop', {zoek})).map(order => order.id);

    expect(await ids('sara')).toEqual([a.id]);
    expect(await ids('PEETERS')).toEqual([a.id]);
    expect(await ids('14')).toEqual([a.id]);
    expect(await ids('k7p-4qx')).toEqual([a.id]);
    expect(await ids('+++000/0000/01414+++')).toEqual([a.id]);
    expect(await ids('100%')).toEqual([]);
  });

  it('filters on status and pickup moment, newest first, with lines', async () => {
    await maak({status: 'betaald', afhaalId: 'zaterdag'});
    const b = await maak({status: 'wacht', afhaalId: 'zaterdag'});
    await maak({status: 'wacht', afhaalId: 'vrijdag'});
    const result = await beheer.zoekBestellingen('pizzaverkoop', {status: 'wacht', afhaalId: 'zaterdag'});
    expect(result.map(order => order.id)).toEqual([b.id]);
    expect(result[0].regels).toHaveLength(1);
    expect((await beheer.zoekBestellingen('pizzaverkoop', {status: 'onzin'})).length).toBe(3);
  });
});

describe('status changes', () => {
  it('marks only waiting orders as paid', async () => {
    const wacht = await maak();
    const geannuleerd = await maak({status: 'geannuleerd'});
    const now = new Date('2027-01-12T09:00:00');
    const gewijzigd = await beheer.markeerBetaald([wacht.id, geannuleerd.id], 'cash', 'Sara', now);
    expect(gewijzigd.map(order => order.id)).toEqual([wacht.id]);
    expect(gewijzigd[0]).toMatchObject({status: 'betaald', betaalwijze: 'cash', betaalbron: 'manueel', betaaldDoor: 'Sara', betaaldOp: now});
    expect(await beheer.markeerBetaald([wacht.id], 'overschrijving', 'Jan')).toEqual([]);
    expect(await beheer.markeerBetaald([], 'cash', 'Jan')).toEqual([]);
  });

  it('cancels: waiting becomes cancelled, paid goes on the list to pay back, picked up stays', async () => {
    const wacht = await maak();
    const betaald = await maak({status: 'betaald'});
    const afgehaald = await maak({status: 'afgehaald'});
    expect(await beheer.annuleer(wacht.id, ' Te laat betaald ', 'Sara')).toMatchObject({status: 'geannuleerd', annuleerReden: 'Te laat betaald', geannuleerdDoor: 'Sara'});
    expect(await beheer.annuleer(betaald.id, '', 'Sara')).toMatchObject({status: 'terugbetalen', annuleerReden: 'Geannuleerd door het bestuur'});
    expect(await beheer.annuleer(afgehaald.id, 'x', 'Sara')).toBeUndefined();

    expect(await beheer.markeerTerugbetaald(wacht.id, 'Jan')).toBeUndefined();
    expect(await beheer.markeerTerugbetaald(betaald.id, 'Jan')).toMatchObject({status: 'geannuleerd', terugbetaaldDoor: 'Jan'});
  });

  it('keeps a note, empty clears it, a wiped order takes none', async () => {
    const order = await maak();
    expect((await beheer.zetNotitie(order.id, ' Haalt ook op voor nr. 15 '))?.notitie).toBe('Haalt ook op voor nr. 15');
    expect((await beheer.zetNotitie(order.id, '  '))?.notitie).toBeNull();
    const gewist = await maak({gewistOp: new Date()});
    expect(await beheer.zetNotitie(gewist.id, 'x')).toBeUndefined();
  });

  it('finds an order by number with its lines', async () => {
    await maak({nummer: 7});
    expect((await beheer.vindOpNummer('pizzaverkoop', 7))?.regels).toHaveLength(1);
    expect(await beheer.vindOpNummer('pizzaverkoop', 8)).toBeUndefined();
    expect((await beheer.alleBestellingen('pizzaverkoop')).length).toBe(1);
  });
});
