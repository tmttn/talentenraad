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
const {plusMaanden, wisVerlopen} = await import('@lib/bestellingen/bewaartermijn');
const testDb = test.current as unknown as ReturnType<typeof createTestDb>;

beforeEach(() => {
  testDb.reset();
});

afterAll(() => {
  testDb.close();
});

describe('bewaartermijn', () => {
  it('adds months, clamped to the end of a short month', () => {
    expect(plusMaanden('2027-01-22', 3)).toBe('2027-04-22');
    expect(plusMaanden('2026-11-30', 3)).toBe('2027-02-28');
    expect(plusMaanden('2027-10-15', 3)).toBe('2028-01-15');
  });

  it('wipes personal data three months after the last pickup moment of a sale, keeps the rest', async () => {
    const [oud] = await testDb.db.insert(orders).values(testOrder({actie: 'oud', afhaalDatum: '2027-01-22', telefoon: '0470', notitie: 'x', status: 'afgehaald'})).returning();
    await testDb.db.insert(orders).values(testOrder({actie: 'oud', afhaalDatum: '2027-01-23'}));
    await testDb.db.insert(orderLines).values(testRegel(oud.id));
    await testDb.db.insert(orders).values(testOrder({actie: 'recent', afhaalDatum: '2027-03-01'}));

    expect(await wisVerlopen(new Date('2027-04-22T10:00:00'))).toBe(0);
    expect(await wisVerlopen(new Date('2027-04-23T10:00:00'))).toBe(2);
    expect(await wisVerlopen(new Date('2027-04-24T10:00:00'))).toBe(0);

    const [row] = (await testDb.db.select().from(orders)).filter(order => order.id === oud.id);
    expect(row).toMatchObject({naam: '(gewist)', email: '', telefoon: null, notitie: null, token: null, status: 'afgehaald', totaalCent: 1000});
    expect(row.gewistOp).toEqual(new Date('2027-04-23T10:00:00'));
    expect(await testDb.db.select().from(orderLines)).toHaveLength(1);
    expect((await testDb.db.select().from(orders)).find(order => order.actie === 'recent')?.naam).not.toBe('(gewist)');
  });
});
