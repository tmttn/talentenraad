import {render, screen} from '@testing-library/react';
import {
  afterEach, describe, expect, it, vi,
} from 'vitest';

const getSession = vi.fn();
const redirect = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT ${url}`);
});

vi.mock('@lib/auth/session', () => ({getSession}));
vi.mock('next/navigation', () => ({redirect}));

const {default: AdminLoginPage} = await import('../../../app/(admin)/admin/login/page');

afterEach(() => {
  vi.restoreAllMocks();
  getSession.mockReset();
});

describe('AdminLoginPage', () => {
  it('renders the login form normally when the session lookup fails', async () => {
    getSession.mockRejectedValue(new Error('db down'));
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    render(await AdminLoginPage({searchParams: Promise.resolve({error: 'link'})}));

    expect(screen.getByRole('button', {name: 'Stuur inloglink'})).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Deze link is ongeldig of verlopen.');
    expect(error).toHaveBeenCalledWith('Session lookup failed on login page:', expect.any(Error));
  });

  it('redirects a signed-in admin to the safe returnTo', async () => {
    getSession.mockResolvedValue({user: {id: 'u1', email: 'admin@test.com', name: null}});

    await expect(AdminLoginPage({searchParams: Promise.resolve({returnTo: 'https://evil.example'})}))
      .rejects.toThrow('NEXT_REDIRECT /admin');
  });
});
