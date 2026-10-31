import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';

const sendMailMock = vi.fn();

vi.mock('@lib/email/mailer', () => ({
  sendMail: sendMailMock,
  getSiteUrl: () => 'https://site.example',
}));

describe('email messages', () => {
  beforeEach(() => {
    sendMailMock.mockReset().mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('sends the login link with validity info', async () => {
    const {sendLoginLink} = await import('@lib/email/messages');

    await sendLoginLink({to: 'a@example.com', url: 'https://site.example/api/auth/verify?token=abc'});

    const call = sendMailMock.mock.calls[0][0] as {to: string; subject: string; html: string; text: string};
    expect(call.to).toBe('a@example.com');
    expect(call.subject).toBe('Je inloglink voor Talentenraad');
    expect(call.html).toContain('https://site.example/api/auth/verify?token=abc');
    expect(call.text).toContain('15 minuten');
    expect(call.text).toContain('één keer');
    expect(call.text).toContain('negeren');
  });

  it('points the invitation to /admin/login without Auth0 wording', async () => {
    const {sendInvitationEmail} = await import('@lib/email/messages');

    await sendInvitationEmail({email: 'n@example.com', name: 'Nina', inviterName: 'Tom'});

    const call = sendMailMock.mock.calls[0][0] as {to: string; subject: string; html: string; text: string};
    expect(call.to).toBe('n@example.com');
    expect(call.subject).toBe('Uitnodiging voor Talentenraad Admin');
    expect(call.html).toContain('https://site.example/admin/login');
    expect(call.html).toContain('Beste Nina');
    expect(call.html).toContain('door Tom');
    expect(call.text).toContain('https://site.example/admin/login');
    expect(`${call.html}${call.text}`).not.toMatch(/auth0/i);
  });

  it('sends the contact notification to the admin address', async () => {
    vi.stubEnv('ADMIN_NOTIFICATION_EMAIL', 'admin@example.com');
    const {sendContactNotification} = await import('@lib/email/messages');

    await sendContactNotification({
      name: 'Ouder',
      email: 'ouder@example.com',
      phone: '0123',
      subject: 'sponsoring',
      message: 'Regel 1\nRegel 2',
      submissionId: 'sub-1',
    });

    const call = sendMailMock.mock.calls[0][0] as {to: string; subject: string; html: string; text: string};
    expect(call.to).toBe('admin@example.com');
    expect(call.subject).toBe('Nieuw contactbericht: Sponsoring');
    expect(call.html).toContain('Regel 1<br />Regel 2');
    expect(call.html).toContain('https://site.example/admin/submissions/sub-1');
    expect(call.text).toContain('0123');
  });

  it('propagates mail errors', async () => {
    sendMailMock.mockRejectedValue(new Error('smtp down'));
    const {sendLoginLink} = await import('@lib/email/messages');

    await expect(sendLoginLink({to: 'a@example.com', url: 'x'})).rejects.toThrow('smtp down');
  });
});
