// @vitest-environment node
import {
  beforeEach, describe, expect, it, vi,
} from 'vitest';

const getSession = vi.fn();
const redirect = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT ${url}`);
});

vi.mock('@lib/auth/session', () => ({getSession}));
vi.mock('next/navigation', () => ({redirect}));

const {requireAdminSession} = await import('@lib/auth/require-admin');

beforeEach(() => {
  getSession.mockReset();
  redirect.mockClear();
});

describe('requireAdminSession', () => {
  it('returns the session for an admin', async () => {
    const session = {user: {id: 'u1', email: 'admin@test.com', name: null}};
    getSession.mockResolvedValue(session);

    await expect(requireAdminSession()).resolves.toBe(session);
    expect(redirect).not.toHaveBeenCalled();
  });

  it('redirects to the login page without a valid admin session', async () => {
    getSession.mockResolvedValue(undefined);

    await expect(requireAdminSession()).rejects.toThrow('NEXT_REDIRECT /admin/login');
  });
});
