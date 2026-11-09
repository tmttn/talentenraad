// @vitest-environment node
import {
  afterAll, beforeEach, describe, expect, it, vi,
} from 'vitest';
import type {createTestDb} from '../../helpers/db';
import {testActie} from '../../helpers/acties';

const test = vi.hoisted(() => ({current: undefined as undefined | {db: unknown}}));
const sendMail = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

vi.stubEnv('AUTH_SECRET', 'x'.repeat(40));
vi.mock('@lib/email/mailer', () => ({sendMail, getSiteUrl: () => 'https://talentenraad.be'}));
vi.mock('@lib/content', () => ({
  content: {
    getActie: (slug: string) => (slug === 'pizzaverkoop' ? testActie() : undefined),
    getSite: () => ({footer: {email: 'bestuur@example.com'}}),
  },
}));
vi.mock('@lib/db', async () => {
  const schema = await import('../../../app/lib/db/schema');
  const {createTestDb} = await import('../../helpers/db');
  const created = createTestDb();
  test.current = created;
  return {...schema, db: created.db};
});

const {orders, orderLines} = await import('@lib/db/schema');
const {magNuVersturen, stuurHerinneringen, teHerinneren} = await import('@lib/bestellingen/herinneringen');
const {stuurBetaalHerinnering} = await import('@lib/bestellingen/mails');
const testDb = test.current as unknown as ReturnType<typeof createTestDb>;

let nummer = 0;
// Ordered on 10 January with 5 days to pay: deadline 15 January; pickup on 22 January
async function maak(overrides: Partial<typeof orders.$inferInsert> = {}) {
  nummer++;
  const [order] = await testDb.db.insert(orders).values({
    actie: 'pizzaverkoop', nummer, volgnummer: nummer, mededeling: String(nummer).padStart(12, '0'), token: `token${String(nummer).padStart(17, '0')}`,
    korteCode: `K${String(nummer).padStart(5, '0')}`, naam: 'Ouder A', email: `ouder${nummer}@example.com`, afhaalId: 'vrijdag', afhaalDatum: '2027-01-22',
    afhaalLabel: 'Vrijdag 22 januari, 17:00 - 19:00', afhaalPlaats: 'Refter', totaalCent: 2000, status: 'wacht',
    aangemaaktOp: new Date('2027-01-10T10:00:00Z'), ...overrides,
  }).returning();
  await testDb.db.insert(orderLines).values({orderId: order.id, volgorde: 0, productId: 'margherita', naam: 'Margherita', keuzes: [], prijsCent: 1000, aantal: 2});
  return order;
}

// 11:00 in Belgium; the same calendar day in UTC and in Brussels
const op = (dag: string) => new Date(`${dag}T10:00:00Z`);

beforeEach(() => {
  testDb.reset();
  sendMail.mockReset().mockResolvedValue(undefined);
});

afterAll(() => {
  testDb.close();
});

describe('magNuVersturen', () => {
  it('sends between 9 and 20 o\'clock Belgian time only', () => {
    expect(magNuVersturen(new Date('2027-01-14T07:59:00Z'))).toBe(false); // 08:59 in Brussels
    expect(magNuVersturen(new Date('2027-01-14T08:00:00Z'))).toBe(true);
    expect(magNuVersturen(new Date('2027-01-14T18:59:00Z'))).toBe(true);
    expect(magNuVersturen(new Date('2027-01-14T19:00:00Z'))).toBe(false); // 20:00
    expect(magNuVersturen(new Date('2027-07-14T07:00:00Z'))).toBe(true); // 09:00 in summer time
  });
});

describe('teHerinneren: betalen', () => {
  it('picks a waiting order the day before the deadline and on the deadline itself', async () => {
    const order = await maak();

    expect((await teHerinneren(op('2027-01-13'))).betalen).toEqual([]);
    expect((await teHerinneren(op('2027-01-14'))).betalen).toEqual([order.id]);
    expect((await teHerinneren(op('2027-01-15'))).betalen).toEqual([order.id]);
    expect((await teHerinneren(op('2027-01-16'))).betalen).toEqual([]);
  });

  it('skips paid, cancelled, wiped and already reminded orders, orders of today and unknown sales', async () => {
    await maak({status: 'betaald'});
    await maak({status: 'geannuleerd'});
    await maak({token: null});
    await maak({betaalHerinneringOp: op('2027-01-14')});
    await maak({actie: 'weg'});
    // Ordered today: never a reminder on the day of ordering
    await maak({aangemaaktOp: new Date('2027-01-14T08:00:00Z')});

    expect((await teHerinneren(op('2027-01-14'))).betalen).toEqual([]);
  });
});

describe('teHerinneren: afhalen', () => {
  it('picks a paid order the day before pickup, unless its pickup code left that same day', async () => {
    const oud = await maak({status: 'betaald', qrVerstuurdOp: op('2027-01-15')});
    const zonderMail = await maak({status: 'betaald'});
    await maak({status: 'betaald', qrVerstuurdOp: op('2027-01-21')});
    await maak({status: 'afgehaald'});
    const zaterdag = await maak({status: 'betaald', afhaalId: 'zaterdag', afhaalDatum: '2027-01-23'});

    expect((await teHerinneren(op('2027-01-20'))).afhalen).toEqual([]);
    expect((await teHerinneren(op('2027-01-21'))).afhalen).toEqual([oud.id, zonderMail.id]);
    // The day of the Friday pickup is the day before Saturday's
    expect((await teHerinneren(op('2027-01-22'))).afhalen).toEqual([zaterdag.id]);
    expect((await teHerinneren(op('2027-01-23'))).afhalen).toEqual([]);
  });
});

describe('stuurHerinneringen', () => {
  it('sends nothing outside the hours', async () => {
    await maak();

    expect(await stuurHerinneringen(new Date('2027-01-14T05:00:00Z'))).toEqual({betalen: 0, afhalen: 0});
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('sends each reminder once and records it', async () => {
    const order = await maak();

    expect(await stuurHerinneringen(op('2027-01-14'))).toEqual({betalen: 1, afhalen: 0});
    expect(await stuurHerinneringen(op('2027-01-15'))).toEqual({betalen: 0, afhalen: 0});

    expect(sendMail).toHaveBeenCalledTimes(1);
    const mail = sendMail.mock.calls[0][0] as {to: string; replyTo: string; subject: string; text: string};
    expect(mail).toMatchObject({to: order.email, replyTo: 'bestuur@example.com'});
    expect(mail.subject).toContain('uiterlijk vrijdag 15 januari');
    expect(mail.text).toContain('BE68 5390 0754 7034');
    const [row] = await testDb.db.select().from(orders);
    expect(row.betaalHerinneringOp).toEqual(op('2027-01-14'));
  });

  it('sends the pickup reminder with the QR code as PNG', async () => {
    await maak({status: 'betaald', qrVerstuurdOp: op('2027-01-15')});

    expect(await stuurHerinneringen(op('2027-01-21'))).toEqual({betalen: 0, afhalen: 1});
    const mail = sendMail.mock.calls[0][0] as {subject: string; attachments: Array<{cid: string; content: Buffer}>};
    expect(mail.subject).toBe('Morgen afhalen: je bestelling voor de pizzaverkoop');
    expect(mail.attachments[0].cid).toBe('afhaalcode');
    expect(mail.attachments[0].content.subarray(1, 4).toString()).toBe('PNG');
  });

  it('tries a failed mail again in the next round', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await maak();
    sendMail.mockRejectedValueOnce(new Error('smtp down'));

    expect(await stuurHerinneringen(op('2027-01-14'))).toEqual({betalen: 0, afhalen: 0});
    expect(error).toHaveBeenCalledWith('[bestellingen] herinnering (betalen) mislukt', 'smtp down');
    const [row] = await testDb.db.select().from(orders);
    expect(row.betaalHerinneringOp).toBeNull();

    expect(await stuurHerinneringen(new Date('2027-01-14T11:00:00Z'))).toEqual({betalen: 1, afhalen: 0});
    error.mockRestore();
  });

  it('does not remind an order that was paid in the meantime', async () => {
    const order = await maak({status: 'betaald'});

    expect(await stuurBetaalHerinnering(order.id, op('2027-01-14'))).toBe(false);
    expect(sendMail).not.toHaveBeenCalled();
  });
});
