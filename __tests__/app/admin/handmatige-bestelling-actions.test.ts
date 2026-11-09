// @vitest-environment node
import {
  beforeEach, describe, expect, it, vi,
} from 'vitest';
import {testActie} from '../../helpers/acties';

const requireEditorSession = vi.fn();
const plaatsHandmatig = vi.fn();
const logAudit = vi.fn();
const revalidatePath = vi.fn();
const redirect = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT ${url}`);
});

vi.mock('@lib/auth/require-admin', () => ({requireEditorSession}));
vi.mock('@lib/bestellingen/handmatig', () => ({plaatsHandmatig}));
vi.mock('@lib/content', () => ({content: {getActie: (slug: string) => (slug === 'pizzaverkoop' ? testActie() : undefined)}}));
vi.mock('@lib/audit', () => ({logAudit, createAuditContext: () => ({})}));
vi.mock('next/cache', () => ({revalidatePath}));
vi.mock('next/navigation', () => ({redirect}));
vi.mock('next/headers', () => ({headers: async () => new Headers()}));

const {voerBestellingIn} = await import('../../../app/(admin)/admin/(protected)/bestellingen/[actie]/nieuw/actions');

const sessie = (bankToegang: boolean) => ({user: {id: 'u1', email: 'sara@example.com', name: 'Sara', role: 'redacteur', bankToegang}});

const form = (values: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) {
    data.set(key, value);
  }

  return data;
};

const basis = {actie: 'pizzaverkoop', naam: 'Oma Jeanne', afhaalId: 'vrijdag', 'aantal:margherita': '1'};

describe('voerBestellingIn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireEditorSession.mockResolvedValue(sessie(false));
    plaatsHandmatig.mockResolvedValue({status: 'besteld', id: 'o1', nummer: 7});
  });

  it('stores the order, logs it and opens the order page', async () => {
    await expect(voerBestellingIn({status: 'idle'}, form(basis))).rejects.toThrow('NEXT_REDIRECT /admin/bestellingen/pizzaverkoop/7?melding=ingevoerd');
    expect(plaatsHandmatig).toHaveBeenCalledWith(expect.objectContaining({slug: 'pizzaverkoop'}), expect.any(FormData), {door: 'Sara', cashBetaaldDoor: undefined});
    expect(logAudit).toHaveBeenCalledWith(expect.objectContaining({actionType: 'create', resourceType: 'bestelling', resourceId: 'o1', dataAfter: {nummer: 7, ingevoerd: true, cash: false}}));
  });

  it('refuses cash without access to the bank account, also when the form is forged', async () => {
    const state = await voerBestellingIn({status: 'idle'}, form({...basis, cash: 'on'}));
    expect(state).toMatchObject({status: 'fout', melding: 'Alleen wie toegang heeft tot de bankrekening, kan een betaling bevestigen.'});
    expect(plaatsHandmatig).not.toHaveBeenCalled();
  });

  it('confirms cash in the name of whoever has access to the bank account', async () => {
    requireEditorSession.mockResolvedValue(sessie(true));
    await expect(voerBestellingIn({status: 'idle'}, form({...basis, cash: 'on'}))).rejects.toThrow('NEXT_REDIRECT');
    expect(plaatsHandmatig).toHaveBeenCalledWith(expect.anything(), expect.anything(), {door: 'Sara', cashBetaaldDoor: 'Sara'});
  });

  it('gives the errors back with what was sent', async () => {
    plaatsHandmatig.mockResolvedValue({status: 'ongeldig', fouten: {naam: 'Vul je naam in.'}});
    const state = await voerBestellingIn({status: 'fout', poging: 2}, form({...basis, naam: ''}));
    expect(state).toEqual({
      status: 'fout', melding: 'Er klopt nog iets niet. Kijk de rode velden na.', fouten: {naam: 'Vul je naam in.'}, waarden: {...basis, naam: ''}, poging: 3,
    });
    expect(logAudit).not.toHaveBeenCalled();
  });

  it('says so when the sale is gone', async () => {
    expect(await voerBestellingIn({status: 'idle'}, form({...basis, actie: 'weg'}))).toMatchObject({status: 'fout', melding: 'Deze actie bestaat niet meer.'});
    expect(await voerBestellingIn({status: 'idle'}, form({...basis, actie: '../x'}))).toMatchObject({melding: 'Deze actie bestaat niet meer.'});
    expect(plaatsHandmatig).not.toHaveBeenCalled();
  });
});
