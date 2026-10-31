// @vitest-environment node
import {NextRequest} from 'next/server';
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';

const verifyAdmin = vi.fn();
const ensureAdminUser = vi.fn();
const createLoginToken = vi.fn();
const consumeLoginToken = vi.fn();
const sendLoginLink = vi.fn();
const getSession = vi.fn();
const auditValues = vi.fn();
const afterCallbacks: Array<() => unknown> = [];

vi.mock('next/server', async () => {
  const actual = await vi.importActual<typeof import('next/server')>('next/server');
  return {
    ...actual,
    after(callback: () => unknown) {
      afterCallbacks.push(callback);
    },
  };
});

vi.mock('@lib/auth/admin', async () => {
  const actual = await vi.importActual<typeof import('@lib/auth/admin')>('@lib/auth/admin');
  return {...actual, verifyAdmin, ensureAdminUser};
});
vi.mock('@lib/auth/tokens', () => ({createLoginToken, consumeLoginToken}));
vi.mock('@lib/email/messages', () => ({sendLoginLink}));
vi.mock('@lib/auth/session', async () => {
  const actual = await vi.importActual<typeof import('@lib/auth/session')>('@lib/auth/session');
  return {...actual, getSession};
});
vi.mock('@lib/db', () => ({
  auditLogs: {},
  db: {insert: () => ({values: auditValues})},
}));

const neutral = 'Als dit adres toegang heeft, ontvang je een e-mail met een link.';
// Runs the work the route scheduled with after(), as Next.js does once the response is sent.
const flush = async () => {
  const callbacks = afterCallbacks.splice(0);
  await Promise.all(callbacks.map(async callback => callback()));
};

beforeEach(() => {
  vi.resetAllMocks();
  afterCallbacks.length = 0;
  vi.stubEnv('SITE_URL', 'https://talentenraad.test');
  vi.stubEnv('AUTH_SECRET', 'test-secret-that-is-at-least-32-chars!!');
  auditValues.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

const requestLogin = async (body: unknown) => {
  const {POST} = await import('../../app/api/auth/request/route');
  return POST(new NextRequest('http://intern:3000/api/auth/request', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  }));
};

describe('POST /api/auth/request', () => {
  it('mails a login link to an admin under the rate limit', async () => {
    verifyAdmin.mockResolvedValue(true);
    createLoginToken.mockResolvedValue('the-token');
    sendLoginLink.mockResolvedValue(undefined);

    const response = await requestLogin({email: ' Admin@Test.com ', returnTo: '/admin/gebruikers'});
    await flush();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({message: neutral});
    expect(verifyAdmin).toHaveBeenCalledWith('admin@test.com');
    expect(createLoginToken).toHaveBeenCalledWith('admin@test.com');
    expect(sendLoginLink).toHaveBeenCalledWith({
      to: 'admin@test.com',
      url: 'https://talentenraad.test/api/auth/verify?token=the-token&returnTo=%2Fadmin%2Fgebruikers',
    });
  });

  it('drops an unsafe returnTo from the link', async () => {
    verifyAdmin.mockResolvedValue(true);
    createLoginToken.mockResolvedValue('the-token');
    sendLoginLink.mockResolvedValue(undefined);

    await requestLogin({email: 'admin@test.com', returnTo: 'https://evil.example'});
    await flush();

    expect(sendLoginLink).toHaveBeenCalledWith(expect.objectContaining({
      url: 'https://talentenraad.test/api/auth/verify?token=the-token',
    }));
  });

  it('gives a non-admin the same answer without token or mail', async () => {
    verifyAdmin.mockResolvedValue(false);

    const response = await requestLogin({email: 'ouder@example.com'});
    await flush();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({message: neutral});
    expect(createLoginToken).not.toHaveBeenCalled();
    expect(sendLoginLink).not.toHaveBeenCalled();
  });

  it('gives the same answer and sends no mail when rate limited', async () => {
    verifyAdmin.mockResolvedValue(true);
    createLoginToken.mockResolvedValue(undefined);

    const response = await requestLogin({email: 'admin@test.com'});
    await flush();

    await expect(response.json()).resolves.toEqual({message: neutral});
    expect(sendLoginLink).not.toHaveBeenCalled();
  });

  it('gives the same answer for invalid input', async () => {
    for (const body of ['{kapot', {}, {email: 42}, {email: 'geen-adres'}]) {
      const response = await requestLogin(body);
      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({message: neutral});
    }

    expect(verifyAdmin).not.toHaveBeenCalled();
  });

  it('logs a failing mail without the token and still answers neutrally', async () => {
    verifyAdmin.mockResolvedValue(true);
    createLoginToken.mockResolvedValue('secret-token');
    sendLoginLink.mockRejectedValue(new Error('smtp down'));
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const response = await requestLogin({email: 'admin@test.com'});
    await flush();

    await expect(response.json()).resolves.toEqual({message: neutral});
    expect(error).toHaveBeenCalledWith('Failed to send login link:', expect.any(Error));
    expect(JSON.stringify(error.mock.calls)).not.toContain('secret-token');
  });

  it('answers neutrally when the database fails, logging without the token', async () => {
    verifyAdmin.mockRejectedValue(new Error('db down'));
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const response = await requestLogin({email: 'admin@test.com'});
    await flush();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({message: neutral});
    expect(error).toHaveBeenCalledWith('Login request failed:', 'db down');
  });

  it('answers before any admin check, token or mail work runs', async () => {
    verifyAdmin.mockReturnValue(new Promise(() => undefined));

    const response = await requestLogin({email: 'admin@test.com'});

    expect(response.status).toBe(200);
    expect(verifyAdmin).not.toHaveBeenCalled();
    expect(createLoginToken).not.toHaveBeenCalled();
    expect(afterCallbacks).toHaveLength(1);
  });
});

const verify = async (query: string) => {
  const {GET} = await import('../../app/api/auth/verify/route');
  return GET(new NextRequest(`http://intern:3000/api/auth/verify${query}`));
};

describe('GET /api/auth/verify', () => {
  const user = {id: '0d4b6f5e-1111-4222-8333-444455556666', email: 'admin@test.com'};

  it('sets the session cookie and redirects to a safe returnTo', async () => {
    consumeLoginToken.mockResolvedValue({email: user.email});
    verifyAdmin.mockResolvedValue(true);
    ensureAdminUser.mockResolvedValue(user);
    const {readSession} = await import('@lib/auth/session');

    const response = await verify('?token=abc&returnTo=/admin/gebruikers');

    expect(consumeLoginToken).toHaveBeenCalledWith('abc');
    expect(ensureAdminUser).toHaveBeenCalledWith(user.email);
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://talentenraad.test/admin/gebruikers');
    const cookie = response.cookies.get('tr_session');
    expect(cookie).toMatchObject({httpOnly: true, sameSite: 'lax', path: '/'});
    await expect(readSession(cookie?.value)).resolves.toEqual({userId: user.id, email: user.email});
    expect(auditValues).toHaveBeenCalledWith(expect.objectContaining({actionType: 'login', userEmail: user.email}));
  });

  it('ignores an external returnTo', async () => {
    consumeLoginToken.mockResolvedValue({email: user.email});
    verifyAdmin.mockResolvedValue(true);
    ensureAdminUser.mockResolvedValue(user);

    const response = await verify('?token=abc&returnTo=https://evil.example');

    expect(response.headers.get('location')).toBe('https://talentenraad.test/admin');
  });

  it('redirects to the login error without a session for an unknown, expired or reused token', async () => {
    consumeLoginToken.mockResolvedValue(undefined);

    const response = await verify('?token=used');

    expect(response.headers.get('location')).toBe('https://talentenraad.test/admin/login?error=link');
    expect(response.cookies.get('tr_session')).toBeUndefined();
    expect(ensureAdminUser).not.toHaveBeenCalled();
  });

  it('redirects to the login error without a token', async () => {
    const response = await verify('');

    expect(response.headers.get('location')).toBe('https://talentenraad.test/admin/login?error=link');
    expect(consumeLoginToken).not.toHaveBeenCalled();
  });

  it.each([
    ['consumeLoginToken', () => consumeLoginToken.mockRejectedValue(new Error('db down'))],
    ['ensureAdminUser', () => {
      consumeLoginToken.mockResolvedValue({email: user.email});
      verifyAdmin.mockResolvedValue(true);
      ensureAdminUser.mockRejectedValue(new Error('db down'));
    }],
  ])('redirects to the login error and logs when %s throws', async (_name, arrange) => {
    arrange();
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const response = await verify('?token=abc');

    expect(response.headers.get('location')).toBe('https://talentenraad.test/admin/login?error=link');
    expect(response.cookies.get('tr_session')).toBeUndefined();
    expect(error).toHaveBeenCalledWith('Login link verification failed:', expect.any(Error));
  });

  it('refuses a valid token for someone who lost admin access since requesting it', async () => {
    consumeLoginToken.mockResolvedValue({email: user.email});
    verifyAdmin.mockResolvedValue(false);

    const response = await verify('?token=abc');

    expect(response.headers.get('location')).toBe('https://talentenraad.test/admin/login?error=link');
    expect(response.cookies.get('tr_session')).toBeUndefined();
  });
});

describe('POST /api/auth/logout', () => {
  it('clears the cookie and redirects to the login page', async () => {
    getSession.mockResolvedValue({user: {...user(), name: null}});
    const {POST} = await import('../../app/api/auth/logout/route');

    const response = await POST(new NextRequest('http://intern:3000/api/auth/logout', {method: 'POST'}));

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe('https://talentenraad.test/admin/login');
    expect(response.cookies.get('tr_session')).toMatchObject({value: '', maxAge: 0, path: '/'});
    expect(auditValues).toHaveBeenCalledWith(expect.objectContaining({actionType: 'logout'}));
  });

  it('clears the cookie even when the session lookup throws', async () => {
    getSession.mockRejectedValue(new Error('db down'));
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const {POST} = await import('../../app/api/auth/logout/route');

    const response = await POST(new NextRequest('http://intern:3000/api/auth/logout', {method: 'POST'}));

    expect(response.headers.get('location')).toBe('https://talentenraad.test/admin/login');
    expect(response.cookies.get('tr_session')).toMatchObject({value: '', maxAge: 0});
    expect(error).toHaveBeenCalledWith('Failed to log logout event:', expect.any(Error));
  });

  it('still logs out without a valid session', async () => {
    getSession.mockResolvedValue(undefined);
    const {POST} = await import('../../app/api/auth/logout/route');

    const response = await POST(new NextRequest('http://intern:3000/api/auth/logout', {method: 'POST'}));

    expect(response.cookies.get('tr_session')?.value).toBe('');
    expect(auditValues).not.toHaveBeenCalled();
  });
});

describe('GET /api/admin/session', () => {
  it('returns the user for a valid session', async () => {
    getSession.mockResolvedValue({user: {...user(), name: 'Admin'}});
    const {GET} = await import('../../app/api/admin/session/route');

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({valid: true, user: {email: 'admin@test.com', name: 'Admin'}});
  });

  it('returns 401 without a valid session', async () => {
    getSession.mockResolvedValue(undefined);
    const {GET} = await import('../../app/api/admin/session/route');

    const response = await GET();

    expect(response.status).toBe(401);
  });
});

function user() {
  return {id: '0d4b6f5e-1111-4222-8333-444455556666', email: 'admin@test.com'};
}
