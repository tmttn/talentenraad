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
const {eq} = await import('drizzle-orm');
const afhalen = await import('@lib/bestellingen/afhalen');
const testDb = test.current as unknown as ReturnType<typeof createTestDb>;

async function maak(overrides: Parameters<typeof testOrder>[0] = {}) {
  const [order] = await testDb.db.insert(orders).values(testOrder(overrides)).returning();
  await testDb.db.insert(orderLines).values([testRegel(order.id, {aantal: 2}), testRegel(order.id, {volgorde: 1, productId: 'vegetariana', naam: 'Vegetariana'})]);
  return order;
}

const huidig = async (id: string) => {
  const [order] = await testDb.db.select().from(orders).where(eq(orders.id, id));
  return order;
};

beforeEach(() => {
  testDb.reset();
});

afterAll(() => {
  testDb.close();
});

describe('afhaalTeller', () => {
  it('counts picked up out of the orders of the moment; cancelled ones do not count', async () => {
    await maak({status: 'afgehaald'});
    await maak({status: 'betaald'});
    await maak({status: 'wacht'});
    await maak({status: 'geannuleerd'});
    await maak({status: 'terugbetalen'});
    await maak({status: 'afgehaald', afhaalId: 'zaterdag'});
    await maak({status: 'afgehaald', actie: 'andere'});

    expect(await afhalen.afhaalTeller('pizzaverkoop', 'vrijdag')).toEqual({afgehaald: 1, totaal: 3});
    expect(await afhalen.afhaalTeller('pizzaverkoop', 'niemand')).toEqual({afgehaald: 0, totaal: 0});
  });
});

describe('geefMee', () => {
  it('hands a paid order over and ticks all its lines', async () => {
    const order = await maak({status: 'betaald'});
    const now = new Date('2027-01-22T17:42:00');

    const result = await afhalen.geefMee(order.id, 'Sara', now);

    expect(result).toMatchObject({status: 'meegegeven', order: {id: order.id, status: 'afgehaald', afgehaaldDoor: 'Sara'}});
    expect((await huidig(order.id)).afgehaaldOp).toEqual(now);
    const regels = await testDb.db.select().from(orderLines).where(eq(orderLines.orderId, order.id));
    expect(regels.map(regel => regel.meegegeven)).toEqual([true, true]);
  });

  it('tells the second of two helpers when and by whom it was handed over, and changes nothing', async () => {
    const order = await maak({status: 'betaald'});
    const eerst = new Date('2027-01-22T17:42:00');
    await afhalen.geefMee(order.id, 'Sara', eerst);

    const result = await afhalen.geefMee(order.id, 'Jan', new Date('2027-01-22T17:43:00'));

    expect(result).toEqual({status: 'al-afgehaald', op: eerst, door: 'Sara'});
    expect(await huidig(order.id)).toMatchObject({afgehaaldDoor: 'Sara', afgehaaldOp: eerst});
  });

  it('refuses an unpaid order with the open amount, and changes nothing', async () => {
    const order = await maak({status: 'wacht', totaalCent: 3200});

    expect(await afhalen.geefMee(order.id, 'Sara')).toEqual({status: 'niet-betaald', openCent: 3200});
    expect((await huidig(order.id)).status).toBe('wacht');
    const regels = await testDb.db.select().from(orderLines).where(eq(orderLines.orderId, order.id));
    expect(regels.every(regel => !regel.meegegeven)).toBe(true);
  });

  it('refuses a cancelled order, also one to pay back', async () => {
    const a = await maak({status: 'geannuleerd'});
    const b = await maak({status: 'terugbetalen'});

    expect(await afhalen.geefMee(a.id, 'Sara')).toEqual({status: 'geannuleerd'});
    expect(await afhalen.geefMee(b.id, 'Sara')).toEqual({status: 'geannuleerd'});
    expect((await huidig(b.id)).status).toBe('terugbetalen');
  });

  it('knows no order with an unknown id', async () => {
    expect(await afhalen.geefMee('bestaat-niet', 'Sara')).toEqual({status: 'onbekend'});
  });
});

describe('ontvangCash', () => {
  it('marks a waiting order paid in cash, and leaves a paid one alone', async () => {
    const wacht = await maak({status: 'wacht'});
    const betaald = await maak({status: 'betaald', betaalwijze: 'overschrijving'});

    expect(await afhalen.ontvangCash(wacht.id, 'Tom')).toMatchObject({status: 'betaald', betaalwijze: 'cash', betaaldDoor: 'Tom'});
    expect(await afhalen.ontvangCash(betaald.id, 'Tom')).toBeUndefined();
    expect((await huidig(betaald.id)).betaalwijze).toBe('overschrijving');
  });
});

describe('zoekVoorAfhalen', () => {
  it('finds by name, number and short code, without e-mail, phone or amounts', async () => {
    const a = await maak({naam: 'Sara Peeters', email: 'sara@example.com', telefoon: '0470 00 00 00', korteCode: 'K7P4QX', nummer: 14});
    await maak({naam: 'Jan Janssens'});

    const [gevonden] = await afhalen.zoekVoorAfhalen('pizzaverkoop', 'peeters');
    expect(gevonden).toEqual({
      token: a.token, nummer: 14, naam: 'Sara Peeters', korteCode: 'K7P4QX', status: 'wacht', afhaalId: 'vrijdag', afhaalLabel: a.afhaalLabel,
    });
    expect((await afhalen.zoekVoorAfhalen('pizzaverkoop', 'k7p-4qx')).map(row => row.nummer)).toEqual([14]);
    expect((await afhalen.zoekVoorAfhalen('pizzaverkoop', '14')).map(row => row.nummer)).toEqual([14]);
  });

  it('does not search on e-mail, nor in other sales, nor wiped orders', async () => {
    await maak({naam: 'Sara Peeters', email: 'geheim@example.com'});
    await maak({naam: 'Sara Andere', actie: 'andere'});
    await maak({naam: 'Sara Gewist', token: null});

    expect(await afhalen.zoekVoorAfhalen('pizzaverkoop', 'geheim')).toEqual([]);
    expect((await afhalen.zoekVoorAfhalen('pizzaverkoop', 'sara')).map(row => row.naam)).toEqual(['Sara Peeters']);
    expect(await afhalen.zoekVoorAfhalen('pizzaverkoop', '  ')).toEqual([]);
  });
});

describe('afhaalmomenten', () => {
  it('lists moments with orders from a week ago on, soonest first, with their counters', async () => {
    await maak({afhaalId: 'zaterdag', afhaalDatum: '2027-01-23', afhaalLabel: 'Zaterdag 23 januari', status: 'betaald'});
    await maak({afhaalId: 'vrijdag', afhaalDatum: '2027-01-22', status: 'afgehaald'});
    await maak({afhaalId: 'vrijdag', afhaalDatum: '2027-01-22', status: 'geannuleerd'});
    await maak({afhaalId: 'oud', afhaalDatum: '2027-01-10', status: 'afgehaald'});

    const momenten = await afhalen.afhaalmomenten('2027-01-22');

    expect(momenten.map(moment => [moment.afhaalId, moment.afgehaald, moment.totaal])).toEqual([['vrijdag', 1, 1], ['zaterdag', 0, 1]]);
  });
});

describe('netMeegegeven', () => {
  it('lists the last orders handed over at a moment, newest first, with their pieces', async () => {
    const a = await maak({status: 'betaald', nummer: 1001});
    const b = await maak({status: 'betaald', nummer: 1002});
    await afhalen.geefMee(a.id, 'Sara', new Date('2027-01-22T17:40:00'));
    await afhalen.geefMee(b.id, 'Sara', new Date('2027-01-22T17:42:00'));

    expect(await afhalen.netMeegegeven('pizzaverkoop', 'vrijdag')).toEqual([
      {nummer: 1002, stuks: 3, afgehaaldOp: new Date('2027-01-22T17:42:00')},
      {nummer: 1001, stuks: 3, afgehaaldOp: new Date('2027-01-22T17:40:00')},
    ]);
  });
});
