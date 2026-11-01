// @vitest-environment node
import {SignJWT, decodeJwt} from 'jose';
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';

const secret = 'test-secret-that-is-at-least-32-chars!!';
const cookieValue = vi.fn<() => string | undefined>();
const findFirst = vi.fn();

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (name === 'tr_session' && cookieValue() ? {value: cookieValue()} : undefined),
  }),
}));

vi.mock('@lib/db', () => ({
  users: {id: 'id', email: 'email'},
  db: {query: {users: {findFirst}}},
}));

const user = {id: '0d4b6f5e-1111-4222-8333-444455556666', email: 'admin@test.com'};

async function signWith(key: string, expiresIn = '7d') {
  return new SignJWT({email: user.email})
    .setProtectedHeader({alg: 'HS256'})
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(new TextEncoder().encode(key));
}

beforeEach(() => {
  vi.stubEnv('AUTH_SECRET', secret);
  vi.stubEnv('ADMIN_EMAILS', '');
  cookieValue.mockReset();
  findFirst.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe('session token', () => {
  it('round-trips a session with sub, email, iat and a 7 day exp', async () => {
    const {createSessionCookie, readSession} = await import('@lib/auth/session');

    const jwt = await createSessionCookie(user);
    const claims = decodeJwt(jwt);

    expect(claims).toMatchObject({sub: user.id, email: user.email});
    expect(claims.exp! - claims.iat!).toBe(7 * 24 * 60 * 60);
    await expect(readSession(jwt)).resolves.toEqual({userId: user.id, email: user.email});
  });

  it('rejects a missing, garbage or forged cookie', async () => {
    const {readSession} = await import('@lib/auth/session');

    await expect(readSession(undefined)).resolves.toBeUndefined();
    await expect(readSession('not-a-jwt')).resolves.toBeUndefined();
    await expect(readSession(await signWith('another-secret-that-is-at-least-32-chars'))).resolves.toBeUndefined();
  });

  it('rejects an unsigned (alg none) token', async () => {
    const {readSession} = await import('@lib/auth/session');
    const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
    const unsigned = `${encode({alg: 'none'})}.${encode({sub: user.id, email: user.email})}.`;

    await expect(readSession(unsigned)).resolves.toBeUndefined();
  });

  it('rejects an expired cookie', async () => {
    const {createSessionCookie, readSession} = await import('@lib/auth/session');
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-01T00:00:00Z'));
    const jwt = await createSessionCookie(user);

    vi.setSystemTime(new Date('2026-10-08T00:00:01Z'));

    await expect(readSession(jwt)).resolves.toBeUndefined();
  });

  it('fails loudly when AUTH_SECRET is missing or shorter than 32 characters', async () => {
    const {createSessionCookie, readSession} = await import('@lib/auth/session');

    vi.stubEnv('AUTH_SECRET', '');
    await expect(createSessionCookie(user)).rejects.toThrow(/AUTH_SECRET/);
    vi.stubEnv('AUTH_SECRET', 'too-short');
    await expect(readSession('x')).rejects.toThrow(/AUTH_SECRET/);
  });

  it('uses httpOnly, lax, path / and secure except in development', async () => {
    const {sessionCookieOptions} = await import('@lib/auth/session');

    vi.stubEnv('NODE_ENV', 'production');
    expect(sessionCookieOptions()).toEqual({
      httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 7 * 24 * 60 * 60,
    });
    vi.stubEnv('NODE_ENV', 'development');
    expect(sessionCookieOptions().secure).toBe(false);
  });
});

describe('getSession', () => {
  it('returns the user with role when the cookie is valid', async () => {
    const {createSessionCookie, getSession} = await import('@lib/auth/session');
    cookieValue.mockReturnValue(await createSessionCookie(user));
    findFirst.mockResolvedValue({...user, name: 'Admin', role: 'admin'});

    await expect(getSession()).resolves.toEqual({user: {...user, name: 'Admin', role: 'admin'}});
  });

  it('returns the redacteur role for an editor', async () => {
    const {createSessionCookie, getSession} = await import('@lib/auth/session');
    cookieValue.mockReturnValue(await createSessionCookie(user));
    findFirst.mockResolvedValue({...user, name: null, role: 'redacteur'});

    await expect(getSession()).resolves.toEqual({user: {...user, name: null, role: 'redacteur'}});
  });

  it('ADMIN_EMAILS is always admin, whatever the row says', async () => {
    const {createSessionCookie, getSession} = await import('@lib/auth/session');
    vi.stubEnv('ADMIN_EMAILS', user.email);
    cookieValue.mockReturnValue(await createSessionCookie(user));
    findFirst.mockResolvedValue({...user, name: null, role: 'redacteur'});

    await expect(getSession()).resolves.toMatchObject({user: {role: 'admin'}});
  });

  it('returns undefined without a cookie', async () => {
    const {getSession} = await import('@lib/auth/session');

    await expect(getSession()).resolves.toBeUndefined();
    expect(findFirst).not.toHaveBeenCalled();
  });

  it('returns undefined when the user was deleted or the email changed', async () => {
    const {createSessionCookie, getSession} = await import('@lib/auth/session');
    cookieValue.mockReturnValue(await createSessionCookie(user));
    findFirst.mockResolvedValueOnce(undefined);
    await expect(getSession()).resolves.toBeUndefined();

    findFirst.mockResolvedValueOnce({...user, email: 'someone-else@test.com', role: 'admin'});
    await expect(getSession()).resolves.toBeUndefined();
  });
});
