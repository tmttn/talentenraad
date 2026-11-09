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
const {
  verstuurNaBestelling, stuurAfhaalcode, stuurAfhaalHerinnering, stuurBetaalHerinnering,
} = await import('@lib/bestellingen/mails');
const testDb = test.current as unknown as ReturnType<typeof createTestDb>;

async function maakBestelling(overrides: Partial<typeof orders.$inferInsert> = {}) {
  const [order] = await testDb.db.insert(orders).values({
    actie: 'pizzaverkoop', nummer: 14, volgnummer: 14, mededeling: '000000001414', token: 'abcdefghijklmnopqrstuv', korteCode: 'K7P4QX',
    naam: 'Ouder A', email: 'ouder@example.com', afhaalId: 'vrijdag', afhaalDatum: '2027-01-22', afhaalLabel: 'Vrijdag 22 januari, 17:00 - 19:00',
    afhaalPlaats: 'Refter', totaalCent: 2700, status: 'wacht', aangemaaktOp: new Date('2027-01-10T10:00:00'), ...overrides,
  }).returning();
  await testDb.db.insert(orderLines).values({orderId: order.id, volgorde: 0, productId: 'mand', naam: 'Ontbijtmand', keuzes: [{optie: 'Brood', keuze: 'Glutenvrij'}], prijsCent: 2700, aantal: 1});
  return order;
}

describe('order mails', () => {
  beforeEach(() => {
    testDb.reset();
    sendMail.mockClear();
  });

  afterAll(() => {
    testDb.close();
  });

  it('sends the payment instructions after ordering and records it', async () => {
    const order = await maakBestelling();
    await verstuurNaBestelling(order.id);

    const mail = sendMail.mock.calls[0][0] as {to: string; replyTo: string; subject: string; text: string};
    expect(mail).toMatchObject({to: 'ouder@example.com', replyTo: 'bestuur@example.com'});
    expect(mail.subject).toBe('Je bestelling voor de pizzaverkoop (nr. 14): zo betaal je');
    expect(mail.text).toContain('1 × Ontbijtmand (glutenvrij)  € 27,00');
    expect(mail.text).toContain('+++000/0000/01414+++');
    expect(mail.text).toContain('Betaal uiterlijk vrijdag 15 januari');
    expect(mail.text).toContain('https://talentenraad.be/b/abcdefghijklmnopqrstuv');
    const [row] = await testDb.db.select().from(orders);
    expect(row.bevestigingVerstuurdOp).toBeInstanceOf(Date);
  });

  it('sends the pickup code with a PNG for a paid order', async () => {
    const order = await maakBestelling({status: 'betaald'});
    await verstuurNaBestelling(order.id);

    const mail = sendMail.mock.calls[0][0] as {subject: string; attachments: Array<{cid: string; content: Buffer}>};
    expect(mail.subject).toBe('Betaling ontvangen: je afhaalcode voor de pizzaverkoop');
    expect(mail.attachments[0].cid).toBe('afhaalcode');
    expect(mail.attachments[0].content.subarray(1, 4).toString()).toBe('PNG');
    const [row] = await testDb.db.select().from(orders);
    expect(row.qrVerstuurdOp).toBeInstanceOf(Date);
  });

  it('sends nothing to an order the board entered without e-mail', async () => {
    const wacht = await maakBestelling({email: '', ingevoerdDoor: 'Sara'});
    const betaald = await maakBestelling({email: '', nummer: 15, volgnummer: 15, mededeling: '000000001515', token: 'bcdefghijklmnopqrstuvw', korteCode: 'K7P4QY', status: 'betaald'});
    await verstuurNaBestelling(wacht.id);
    await verstuurNaBestelling(betaald.id);
    expect(await stuurBetaalHerinnering(wacht.id)).toBe(false);
    expect(await stuurAfhaalHerinnering(betaald.id)).toBe(false);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('sends nothing for a wiped order', async () => {
    const order = await maakBestelling({token: null});
    await stuurAfhaalcode(order.id);
    await verstuurNaBestelling('onbekend');
    expect(sendMail).not.toHaveBeenCalled();
  });
});
