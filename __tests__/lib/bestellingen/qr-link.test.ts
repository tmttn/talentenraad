// @vitest-environment node
import {describe, expect, it} from 'vitest';
import {afgifteAdres, leesTokenUitQr} from '@lib/bestellingen/qr-link';

const token = 'AbCdEfGhIjKlMnOpQrSt_-';
const origins = ['http://localhost:3000', 'https://talentenraad.be'];

describe('leesTokenUitQr', () => {
  it('reads the token from a link of our own site', () => {
    expect(leesTokenUitQr(`https://talentenraad.be/b/${token}`, origins)).toBe(token);
    expect(leesTokenUitQr(` https://talentenraad.be/b/${token}/ `, origins)).toBe(token);
    expect(leesTokenUitQr(`http://localhost:3000/b/${token}?x=1`, origins)).toBe(token);
  });

  it('refuses another host, scheme or path, and text that is no link', () => {
    expect(leesTokenUitQr(`https://evil.example/b/${token}`, origins)).toBeUndefined();
    expect(leesTokenUitQr(`https://talentenraad.be.evil.example/b/${token}`, origins)).toBeUndefined();
    expect(leesTokenUitQr(`http://talentenraad.be/b/${token}`, origins)).toBeUndefined();
    expect(leesTokenUitQr(`https://talentenraad.be/admin/${token}`, origins)).toBeUndefined();
    expect(leesTokenUitQr('https://talentenraad.be/b/kort', origins)).toBeUndefined();
    expect(leesTokenUitQr(`https://talentenraad.be/b/${token}/extra`, origins)).toBeUndefined();
    expect(leesTokenUitQr('K7P-4QX', origins)).toBeUndefined();
    expect(leesTokenUitQr(`https://talentenraad.be/b/${token}`, ['geen url'])).toBeUndefined();
  });
});

describe('afgifteAdres', () => {
  const order = {actie: 'pizzaverkoop', afhaalId: 'vrijdag'};

  it('sends a helper to the moment this phone chose, else to the order\'s own moment', () => {
    expect(afgifteAdres({rol: 'helper', gekozen: 'pizzaverkoop/zaterdag', order, token, ouder: false})).toBe(`/admin/afhalen/pizzaverkoop/zaterdag/${token}`);
    expect(afgifteAdres({rol: 'helper', gekozen: undefined, order, token, ouder: false})).toBe(`/admin/afhalen/pizzaverkoop/vrijdag/${token}`);
    expect(afgifteAdres({rol: 'helper', gekozen: 'andere/zaterdag', order, token, ouder: false})).toBe(`/admin/afhalen/pizzaverkoop/vrijdag/${token}`);
    expect(afgifteAdres({rol: 'helper', gekozen: 'pizzaverkoop/../x', order, token, ouder: false})).toBe(`/admin/afhalen/pizzaverkoop/vrijdag/${token}`);
  });

  it('keeps a helper out of the parent page, also with ?ouder=1', () => {
    expect(afgifteAdres({rol: 'helper', gekozen: undefined, order, token, ouder: true})).toBe(`/admin/afhalen/pizzaverkoop/vrijdag/${token}`);
  });

  it('sends an admin or redacteur only when this phone chose a moment of the sale', () => {
    expect(afgifteAdres({rol: 'redacteur', gekozen: 'pizzaverkoop/vrijdag', order, token, ouder: false})).toBe(`/admin/afhalen/pizzaverkoop/vrijdag/${token}`);
    expect(afgifteAdres({rol: 'admin', gekozen: undefined, order, token, ouder: false})).toBeUndefined();
    expect(afgifteAdres({rol: 'admin', gekozen: 'andere/vrijdag', order, token, ouder: false})).toBeUndefined();
    expect(afgifteAdres({rol: 'admin', gekozen: 'pizzaverkoop/vrijdag', order, token, ouder: true})).toBeUndefined();
  });
});
