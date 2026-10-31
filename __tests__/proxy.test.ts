// @vitest-environment node
import {SignJWT} from 'jose';
import {NextRequest} from 'next/server';
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';
import {proxy} from '../proxy';

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

  it('leaves public routes alone', async () => {
    const response = await proxy(request('/kalender'));

    expect(response.headers.get('x-middleware-next')).toBe('1');
  });
});
