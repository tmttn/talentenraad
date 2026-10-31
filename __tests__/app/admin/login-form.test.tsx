import {fireEvent, render, screen} from '@testing-library/react';
import {
  afterEach, describe, expect, it, vi,
} from 'vitest';
import {LoginForm} from '../../../app/(admin)/admin/login/login-form';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('LoginForm', () => {
  it('posts the email and shows "Check je mailbox" afterwards', async () => {
    const fetchMock = vi.fn(async () => Response.json({message: 'Als dit adres toegang heeft, ontvang je een e-mail met een link.'}));
    vi.stubGlobal('fetch', fetchMock);
    render(<LoginForm returnTo='/admin/gebruikers' />);

    fireEvent.change(screen.getByLabelText('E-mailadres'), {target: {value: 'admin@test.com'}});
    fireEvent.click(screen.getByRole('button', {name: 'Stuur inloglink'}));

    expect(await screen.findByRole('heading', {name: 'Check je mailbox'})).toBeInTheDocument();
    expect(screen.getByText('Als dit adres toegang heeft, ontvang je een e-mail met een link.')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/request', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({email: 'admin@test.com', returnTo: '/admin/gebruikers'}),
    }));
  });

  it('shows the link error when asked to', () => {
    render(<LoginForm returnTo='/admin' error='link' />);

    expect(screen.getByRole('alert')).toHaveTextContent('Deze link is ongeldig of verlopen. Vraag een nieuwe aan.');
  });

  it('shows a retry message when the request cannot be sent', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('offline');
    }));
    render(<LoginForm returnTo='/admin' />);

    fireEvent.change(screen.getByLabelText('E-mailadres'), {target: {value: 'admin@test.com'}});
    fireEvent.click(screen.getByRole('button', {name: 'Stuur inloglink'}));

    expect(await screen.findByRole('alert')).toHaveTextContent('Er ging iets mis. Probeer het opnieuw.');
  });
});
