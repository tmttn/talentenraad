// @vitest-environment node
import {
  afterAll, beforeEach, describe, expect, it, vi,
} from 'vitest';
import type {createTestDb} from '../../helpers/db';
import {testActie} from '../../helpers/acties';

const test = vi.hoisted(() => ({current: undefined as undefined | {db: unknown}}));
const verstuurNaBestelling = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

vi.stubEnv('AUTH_SECRET', 'x'.repeat(40));
vi.mock('@lib/bestellingen/mails', () => ({verstuurNaBestelling}));
vi.mock('@lib/db', async () => {
  const schema = await import('../../../app/lib/db/schema');
  const {createTestDb} = await import('../../helpers/db');
  const created = createTestDb();
  test.current = created;
  return {...schema, db: created.db};
});

const {orders} = await import('@lib/db/schema');
const {plaatsHandmatig} = await import('@lib/bestellingen/handmatig');
const testDb = test.current as unknown as ReturnType<typeof createTestDb>;

// After the ordering period (4–17 January): a late order at the school gate
const now = new Date('2027-01-20T16:00:00');

const voerIn = (velden: Record<string, string>, extra: {cashBetaaldDoor?: string} = {}, actie = testActie()) =>
  plaatsHandmatig(actie, {naam: 'Oma Jeanne', afhaalId: 'vrijdag', ...velden}, {door: 'Sara', ...extra}, now);

afterAll(() => {
  testDb.close();
});

describe('plaatsHandmatig', () => {
  beforeEach(() => {
    testDb.reset();
    verstuurNaBestelling.mockClear();
  });

  it('stores an order without e-mail, after the ordering period, and sends nothing', async () => {
    const result = await voerIn({'aantal:margherita': '2', notitie: '  Betaalt bij het afhalen  '});
    expect(result).toMatchObject({status: 'besteld', nummer: 1});

    const [order] = await testDb.db.select().from(orders);
    expect(order).toMatchObject({
      naam: 'Oma Jeanne', email: '', status: 'wacht', totaalCent: 2000, ingevoerdDoor: 'Sara', notitie: 'Betaalt bij het afhalen', betaalwijze: null,
    });
    expect(order.token).toMatch(/^[\w-]{22}$/);
    expect(verstuurNaBestelling).not.toHaveBeenCalled();
  });

  it('sends the usual mails when an e-mail address is filled in', async () => {
    const result = await voerIn({'aantal:margherita': '1', email: 'ouder@example.com'});
    expect(result.status).toBe('besteld');
    const [order] = await testDb.db.select().from(orders);
    expect(verstuurNaBestelling).toHaveBeenCalledWith(order.id);
  });

  it('marks the order as paid in cash by whoever took the money', async () => {
    await voerIn({'aantal:margherita': '1'}, {cashBetaaldDoor: 'Sara'});
    const [order] = await testDb.db.select().from(orders);
    expect(order).toMatchObject({status: 'betaald', betaalwijze: 'cash', betaalbron: 'manueel', betaaldDoor: 'Sara'});
    expect(order.betaaldOp).toEqual(now);
  });

  it('gives a free order no payment method, cash or not', async () => {
    await voerIn({'aantal:inschrijving': '1'}, {cashBetaaldDoor: 'Sara'});
    const [order] = await testDb.db.select().from(orders);
    expect(order).toMatchObject({status: 'betaald', betaalwijze: null, betaaldDoor: null});
  });

  it('checks the same things as online, except that e-mail is optional', async () => {
    expect(await voerIn({'aantal:margherita': '1', email: 'geen-adres'})).toEqual({
      status: 'ongeldig', fouten: {email: 'Vul een volledig e-mailadres in, bv. naam@voorbeeld.be'},
    });
    expect(await voerIn({'aantal:mand:Wit': '5'})).toEqual({
      status: 'ongeldig', fouten: {'product:mand': 'Maximaal 4 Ontbijtmand per bestelling.'},
    });
    expect(await voerIn({naam: '', 'aantal:margherita': '1'})).toMatchObject({status: 'ongeldig', fouten: {naam: 'Vul je naam in.'}});
    expect(await voerIn({'aantal:hawaii': '1'})).toEqual({status: 'gewijzigd'});
    expect(await testDb.db.select().from(orders)).toEqual([]);
  });

  it('respects the stock shared with online orders', async () => {
    expect((await voerIn({'aantal:margherita': '3'})).status).toBe('besteld');
    expect(await voerIn({'aantal:margherita': '1'})).toEqual({status: 'uitverkocht', fouten: {'product:margherita': 'Margherita is uitverkocht.'}});
  });

  it('asks for the child when the sale does', async () => {
    const actie = testActie({vraag: {kind: true}});
    expect(await voerIn({'aantal:margherita': '1'}, {}, actie)).toMatchObject({status: 'ongeldig', fouten: {kindNaam: 'Vul de naam van je kind in.'}});
    expect((await voerIn({'aantal:margherita': '1', kindNaam: 'Lena', kindKlas: '3B'}, {}, actie)).status).toBe('besteld');
  });
});
