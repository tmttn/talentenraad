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

const {requireAdminSession, requireEditorSession} = await import('@lib/auth/require-admin');

const admin = {user: {id: 'u1', email: 'admin@test.com', name: null, role: 'admin'}};
const editor = {user: {id: 'u2', email: 'editor@test.com', name: null, role: 'redacteur'}};

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
});

describe('requireAdminSession', () => {
  it('returns the session for an admin', async () => {
    getSession.mockResolvedValue(admin);

    await expect(requireAdminSession()).resolves.toBe(admin);
    expect(redirect).not.toHaveBeenCalled();
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
