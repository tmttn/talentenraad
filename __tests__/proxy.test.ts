// @vitest-environment node
import {SignJWT} from 'jose';
import {NextRequest} from 'next/server';
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';
import {config, hasValidPercentEncoding, proxy} from '../proxy';

const secret = 'test-secret-that-is-at-least-32-chars!!';

async function jwt(key = secret, expiresIn = '7d') {
  return new SignJWT({email: 'admin@test.com'})
    .setProtectedHeader({alg: 'HS256'})
    .setSubject('user-1')
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(new TextEncoder().encode(key));
}

function request(path: string, cookie?: string) {
  const headers = new Headers();
  if (cookie) {
    headers.set('cookie', `tr_session=${cookie}`);
  }

  return new NextRequest(`http://localhost:3000${path}`, {headers});
}

beforeEach(() => {
  vi.stubEnv('AUTH_SECRET', secret);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('proxy', () => {
  it('redirects /admin without a session to the login page', async () => {
    const response = await proxy(request('/admin/gebruikers'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/admin/login?returnTo=%2Fadmin%2Fgebruikers');
  });

  it('redirects with a forged or expired cookie', async () => {
    const forged = await proxy(request('/admin', await jwt('another-secret-that-is-at-least-32-chars')));
    const expired = await proxy(request('/admin', await jwt(secret, '-1s')));

    expect(forged.headers.get('location')).toBe('http://localhost:3000/admin/login?returnTo=%2Fadmin');
    expect(expired.headers.get('location')).toBe('http://localhost:3000/admin/login?returnTo=%2Fadmin');
  });

  it('lets a valid session through', async () => {
    const response = await proxy(request('/admin', await jwt()));

    expect(response.headers.get('location')).toBeNull();
    expect(response.headers.get('x-middleware-next')).toBe('1');
  });

  it('never redirects the login page itself', async () => {
    const response = await proxy(request('/admin/login?error=link'));

    expect(response.headers.get('x-middleware-next')).toBe('1');
  });

  it('rewrites unknown admin routes to the admin 404 page for signed-in users', async () => {
    const response = await proxy(request('/admin/bestaat-niet', await jwt()));

    expect(response.status).toBe(404);
    expect(response.headers.get('x-middleware-rewrite')).toBe('http://localhost:3000/admin/not-found-page');
  });

  it('rewrites the removed /admin/notificaties route to the admin 404 page', async () => {
    const response = await proxy(request('/admin/notificaties', await jwt()));

    expect(response.status).toBe(404);
    expect(response.headers.get('x-middleware-rewrite')).toBe('http://localhost:3000/admin/not-found-page');
  });

  it.each([
    '/admin/content',
    '/admin/content/aankondiging',
    '/admin/content/activiteiten',
    '/admin/content/nieuws/nieuw',
    '/admin/content/team/jan-peeters',
    '/admin/content/faq/vraag-2',
    '/admin/content/acties',
    '/admin/content/acties/pizzaverkoop-2027',
    '/admin/bestellingen',
    '/admin/bestellingen/pizzaverkoop-2027',
    '/admin/bestellingen/pizzaverkoop-2027/14',
    '/admin/bestellingen/pizzaverkoop-2027/productielijst',
    '/admin/bestellingen/pizzaverkoop-2027/afhaallijst',
    '/admin/afhalen',
    '/admin/afhalen/pizzaverkoop-2027/vrijdag',
    '/admin/afhalen/pizzaverkoop-2027/vrijdag/AbCdEfGhIjKlMnOpQrSt_-',
  ])('lets the content editor route %s through', async path => {
    const response = await proxy(request(path, await jwt()));

    expect(response.headers.get('x-middleware-next')).toBe('1');
  });

  it.each([
    '/admin/content/foo',
    '/admin/content/nieuws/a/b',
    '/admin/content/nieuws/Hoofdletters',
    '/admin/bestellingen/pizzaverkoop-2027/lijst',
    '/admin/afhalen/pizzaverkoop-2027',
    '/admin/afhalen/pizzaverkoop-2027/vrijdag/te-kort',
  ])('rewrites the unknown content route %s to the admin 404 page', async path => {
    const response = await proxy(request(path, await jwt()));

    expect(response.headers.get('x-middleware-rewrite')).toBe('http://localhost:3000/admin/not-found-page');
  });

  it('leaves public routes alone', async () => {
    const response = await proxy(request('/kalender'));

    expect(response.headers.get('x-middleware-next')).toBe('1');
  });
});

describe('invalid percent-encoding', () => {
  it.each([
    '/nieuws/kapot%E0%A4',
    '/activiteiten/%C3',
    '/contact?onderwerp=%E0',
    '/admin/content/%FF',
  ])('answers %s with a short 400 page before any route', async path => {
    const response = await proxy(request(path));
    expect(response.status).toBe(400);
    expect(response.headers.get('content-type')).toContain('text/html');
    const html = await response.text();
    expect(html).toContain('Dit adres klopt niet');
    expect(html).toContain('href="/"');
  });

  it.each([
    '/nieuws/nieuwsbrief-start-schooljaar-2025',
    '/zoek/caf%C3%A9',
    '/a%20b',
    '/contact?onderwerp=sponsoring&naam=Lies+Peeters',
  ])('lets valid addresses like %s through', path => {
    expect(hasValidPercentEncoding(`http://localhost:3000${path}`)).toBe(true);
  });

  it('passes public pages on untouched', async () => {
    const response = await proxy(request('/kalender'));
    expect(response.status).toBe(200);
    expect(response.headers.get('x-middleware-next')).toBe('1');
  });

  it('runs for every address except the Next.js build files', () => {
    const [matcher] = config.matcher;
    const regex = new RegExp(`^${matcher}$`);
    expect(regex.test('/nieuws/kapot%E0%A4')).toBe(true);
    expect(regex.test('/admin')).toBe(true);
    expect(regex.test('/_next/static/chunks/app.js')).toBe(false);
    expect(regex.test('/_next/image')).toBe(false);
  });
});

