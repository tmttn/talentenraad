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

const {requireAdminSession, requireEditorSession, requireStaffSession} = await import('@lib/auth/require-admin');

const admin = {user: {id: 'u1', email: 'admin@test.com', name: null, role: 'admin'}};
const editor = {user: {id: 'u2', email: 'editor@test.com', name: null, role: 'redacteur'}};
const helper = {user: {id: 'u3', email: 'helper@test.com', name: null, role: 'helper'}};

beforeEach(() => {
  getSession.mockReset();
  redirect.mockClear();
});

describe('requireEditorSession', () => {
  it('returns the session for an admin and for a redacteur', async () => {
    getSession.mockResolvedValue(admin);
    await expect(requireEditorSession()).resolves.toBe(admin);
    getSession.mockResolvedValue(editor);
    await expect(requireEditorSession()).resolves.toBe(editor);
    expect(redirect).not.toHaveBeenCalled();
  });

  it('redirects to the login page without a session', async () => {
    getSession.mockResolvedValue(undefined);

    await expect(requireEditorSession()).rejects.toThrow('NEXT_REDIRECT /admin/login');
  });

  it('sends a helper to the pickup app', async () => {
    getSession.mockResolvedValue(helper);

    await expect(requireEditorSession()).rejects.toThrow('NEXT_REDIRECT /admin/afhalen');
  });
});

describe('requireStaffSession', () => {
  it.each([helper, editor, admin])('returns the session for a $user.role', async session => {
    getSession.mockResolvedValue(session);

    await expect(requireStaffSession()).resolves.toBe(session);
    expect(redirect).not.toHaveBeenCalled();
  });

  it('redirects to the login page without a session', async () => {
    getSession.mockResolvedValue(undefined);

    await expect(requireStaffSession()).rejects.toThrow('NEXT_REDIRECT /admin/login');
  });
});

describe('requireAdminSession', () => {
  it('returns the session for an admin', async () => {
    getSession.mockResolvedValue(admin);

    await expect(requireAdminSession()).resolves.toBe(admin);
    expect(redirect).not.toHaveBeenCalled();
  });

  it('sends a helper to the pickup app, not the dashboard', async () => {
    getSession.mockResolvedValue(helper);

    await expect(requireAdminSession()).rejects.toThrow('NEXT_REDIRECT /admin/afhalen');
  });

  it('sends a redacteur back to the dashboard', async () => {
    getSession.mockResolvedValue(editor);

    await expect(requireAdminSession()).rejects.toThrow('NEXT_REDIRECT /admin');
  });

  it('redirects to the login page without a session', async () => {
    getSession.mockResolvedValue(undefined);

    await expect(requireAdminSession()).rejects.toThrow('NEXT_REDIRECT /admin/login');
  });
});
