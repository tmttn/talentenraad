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

const {orders, orderLines} = await import('@lib/db/schema');
const {plaatsBestelling} = await import('@lib/bestellingen/plaatsen');
const {annuleerDoorOuder, vindOpToken, uitersteBetaaldatum} = await import('@lib/bestellingen/bestellingen');
const {issueFormToken} = await import('@lib/form-timing');
const testDb = test.current as unknown as ReturnType<typeof createTestDb>;

const iban = 'BE68 5390 0754 7034';
const now = new Date('2027-01-10T10:00:00');
let ip = 0;

const formulier = (velden: Record<string, string>) => ({
  data: {naam: 'Ouder A', email: 'ouder@example.com', afhaalId: 'vrijdag', ...velden},
  formToken: issueFormToken('bestellen', now.getTime() - 10_000),
});

afterAll(() => {
  testDb.close();
});

const bestel = (velden: Record<string, string>, actie = testActie()) =>
  plaatsBestelling(actie, iban, formulier(velden), `10.1.0.${++ip}`, now);

describe('plaatsBestelling', () => {
  beforeEach(() => {
    testDb.reset();
    verstuurNaBestelling.mockClear();
  });

  it('stores the order with a snapshot of names, prices and choices', async () => {
    const result = await bestel({'aantal:margherita': '2', 'aantal:mand:Glutenvrij': '1', telefoon: '0470 12 34 56'});
    expect(result).toMatchObject({status: 'besteld', nummer: 1});

    const [order] = await testDb.db.select().from(orders);
    expect(order).toMatchObject({
      actie: 'pizzaverkoop',
      nummer: 1,
      volgnummer: 1,
      mededeling: '000000000101',
      status: 'wacht',
      totaalCent: 4700,
      afhaalId: 'vrijdag',
      afhaalDatum: '2027-01-22',
      afhaalLabel: 'Vrijdag 22 januari, 17:00 - 19:00',
      afhaalPlaats: 'Refter',
      telefoon: '0470 12 34 56',
      kindNaam: null,
    });
    expect(order.korteCode).toMatch(/^[A-HJ-NP-Z2-9]{6}$/);
    expect(result.status === 'besteld' && result.token).toBe(order.token);

    const lines = await testDb.db.select().from(orderLines);
    expect(lines.map(line => [line.naam, line.prijsCent, line.aantal, line.keuzes])).toEqual([
      ['Margherita', 1000, 2, []],
      ['Ontbijtmand', 2700, 1, [{optie: 'Brood', keuze: 'Glutenvrij'}]],
    ]);
    expect(verstuurNaBestelling).toHaveBeenCalledWith(order.id);
  });

  it('numbers per sale and keeps the payment reference unique over sales', async () => {
    await bestel({'aantal:margherita': '1'});
    await bestel({'aantal:margherita': '1'}, testActie({}, 'ontbijt'));
    await bestel({'aantal:margherita': '1'});

    const rows = (await testDb.db.select().from(orders)).map(order => [order.actie, order.nummer, order.volgnummer]);
    expect(rows).toEqual([['pizzaverkoop', 1, 1], ['ontbijt', 1, 2], ['pizzaverkoop', 2, 3]]);
  });

  it('never sells more than the stock, and a cancelled order frees it', async () => {
    expect((await bestel({'aantal:margherita': '2'})).status).toBe('besteld');
    expect(await bestel({'aantal:margherita': '2'})).toEqual({status: 'uitverkocht', fouten: {'product:margherita': 'Nog 1 Margherita over.'}});
    const third = await bestel({'aantal:margherita': '1'});
    expect(third.status).toBe('besteld');
    expect(await bestel({'aantal:margherita': '1'})).toEqual({status: 'uitverkocht', fouten: {'product:margherita': 'Margherita is uitverkocht.'}});

    const cancelled = await annuleerDoorOuder(third.status === 'besteld' ? third.token : '', testActie(), now);
    expect(cancelled.status).toBe('geannuleerd');
    expect((await bestel({'aantal:margherita': '1'})).status).toBe('besteld');
  });

  it('confirms a free order at once', async () => {
    await bestel({'aantal:inschrijving': '2'});
    const [order] = await testDb.db.select().from(orders);
    expect(order).toMatchObject({status: 'betaald', totaalCent: 0});
    expect(order.betaaldOp).toEqual(now);
  });

  it('refuses invalid input with messages at the fields', async () => {
    expect(await bestel({naam: '', 'aantal:mand:Wit': '5', afhaalId: 'zondag'})).toEqual({
      status: 'ongeldig',
      fouten: {
        naam: 'Vul je naam in.',
        afhaalId: 'Kies wanneer je afhaalt.',
        'product:mand': 'Maximaal 4 Ontbijtmand per bestelling.',
      },
    });
    expect(await bestel({})).toMatchObject({status: 'ongeldig', fouten: {producten: 'Kies minstens één product.'}});
    expect(await testDb.db.select().from(orders)).toHaveLength(0);
  });

  it('notices a sale that changed while the form was open', async () => {
    expect(await bestel({'aantal:quattro': '1'})).toEqual({status: 'gewijzigd'});
    expect(await bestel({'aantal:mand:Bruin': '1'})).toEqual({status: 'gewijzigd'});
  });

  it('turns away spam without a row and refuses a closed sale', async () => {
    const actie = testActie();
    expect(await plaatsBestelling(actie, iban, {...formulier({'aantal:margherita': '1'}), website: 'http://spam'}, '10.2.0.1', now)).toEqual({status: 'spam'});
    expect(await plaatsBestelling(actie, iban, {...formulier({'aantal:margherita': '1'}), formToken: issueFormToken('bestellen', now.getTime())}, '10.2.0.2', now)).toEqual({status: 'spam'});
    expect(await plaatsBestelling(actie, iban, formulier({'aantal:margherita': '1'}), '10.2.0.3', new Date('2027-01-18T09:00:00'))).toEqual({status: 'gesloten', reden: 'gesloten'});
    expect(await testDb.db.select().from(orders)).toHaveLength(0);
  });

  it('limits orders per address', async () => {
    const results = [];
    for (let i = 0; i < 6; i++) {
      // eslint-disable-next-line no-await-in-loop
      results.push((await plaatsBestelling(testActie(), iban, formulier({'aantal:inschrijving': '1'}), '10.3.0.1', now)).status);
    }

    expect(results).toEqual(['besteld', 'besteld', 'besteld', 'besteld', 'besteld', 'beperkt']);
  });
});

describe('annuleerDoorOuder', () => {
  beforeEach(() => {
    testDb.reset();
  });

  it('cancels a waiting order and puts a paid one on the list to pay back', async () => {
    const eerste = await bestel({'aantal:margherita': '1'});
    const tweede = await bestel({'aantal:margherita': '1'});
    const tokenVan = (result: typeof eerste) => (result.status === 'besteld' ? result.token : '');
    const order = await vindOpToken(tokenVan(tweede));
    await testDb.db.update(orders).set({status: 'betaald'}).where((await import('drizzle-orm')).eq(orders.id, order!.id));

    expect((await annuleerDoorOuder(tokenVan(eerste), testActie(), now)).status).toBe('geannuleerd');
    expect((await annuleerDoorOuder(tokenVan(tweede), testActie(), now)).status).toBe('terugbetalen');
    expect((await annuleerDoorOuder(tokenVan(tweede), testActie(), now)).status).toBe('niet-mogelijk');
    expect((await vindOpToken(tokenVan(eerste)))).toMatchObject({geannuleerdDoor: 'ouder', geannuleerdOp: now});
  });

  it('refuses after the ordering period', async () => {
    const result = await bestel({'aantal:margherita': '1'});
    const token = result.status === 'besteld' ? result.token : '';
    expect(await annuleerDoorOuder(token, testActie(), new Date('2027-01-18T08:00:00'))).toEqual({status: 'niet-mogelijk'});
    expect(await annuleerDoorOuder('kapot', testActie(), now)).toEqual({status: 'niet-mogelijk'});
  });

  it('computes the payment deadline from the day of ordering', () => {
    expect(uitersteBetaaldatum({aangemaaktOp: new Date('2027-01-29T23:30:00')}, {betalen: {binnenDagen: 5}})).toBe('2027-02-03');
  });
});
