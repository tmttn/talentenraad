import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';

const sendMailMock = vi.fn();
const createTransportMock = vi.fn(() => ({sendMail: sendMailMock}));

vi.mock('nodemailer', () => ({
  default: {createTransport: createTransportMock},
}));

const message = {
  to: 'ouder@example.com',
  subject: 'Onderwerp',
  html: '<p>Hallo</p>',
  text: 'Hallo',
};

describe('sendMail', () => {
  beforeEach(() => {
    vi.resetModules();
    sendMailMock.mockReset();
    createTransportMock.mockClear();
    vi.stubEnv('SMTP_HOST', '');
    vi.stubEnv('SMTP_PORT', '');
    vi.stubEnv('SMTP_USER', '');
    vi.stubEnv('SMTP_PASS', '');
    vi.stubEnv('SMTP_FROM', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('sends through SMTP with host, port, auth and from', async () => {
    vi.stubEnv('SMTP_HOST', 'smtp.example.com');
    vi.stubEnv('SMTP_PORT', '2525');
    vi.stubEnv('SMTP_USER', 'user');
    vi.stubEnv('SMTP_PASS', 'pass');
    vi.stubEnv('SMTP_FROM', 'Talentenraad <noreply@example.com>');
    const {sendMail} = await import('@lib/email/mailer');

    await sendMail(message);

    expect(createTransportMock).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: 2525,
      secure: false,
      auth: {user: 'user', pass: 'pass'},
    });
    expect(sendMailMock).toHaveBeenCalledWith({
      from: 'Talentenraad <noreply@example.com>',
      ...message,
    });
  });

  it('defaults to port 587 and omits auth without credentials', async () => {
    vi.stubEnv('SMTP_HOST', 'smtp.example.com');
    const {sendMail} = await import('@lib/email/mailer');

    await sendMail(message);

    expect(createTransportMock).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: undefined,
    });
  });

  it('uses implicit TLS on port 465', async () => {
    vi.stubEnv('SMTP_HOST', 'smtp.example.com');
    vi.stubEnv('SMTP_PORT', '465');
    const {sendMail} = await import('@lib/email/mailer');

    await sendMail(message);

    expect(createTransportMock).toHaveBeenCalledWith(expect.objectContaining({port: 465, secure: true}));
  });

  it('propagates SMTP errors', async () => {
    vi.stubEnv('SMTP_HOST', 'smtp.example.com');
    sendMailMock.mockRejectedValue(new Error('connection refused'));
    const {sendMail} = await import('@lib/email/mailer');

    await expect(sendMail(message)).rejects.toThrow('connection refused');
  });

  it('logs the mail to the console in development without SMTP_HOST', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    const {sendMail} = await import('@lib/email/mailer');

    await sendMail(message);

    expect(createTransportMock).not.toHaveBeenCalled();
    expect(info).toHaveBeenCalledWith(expect.stringContaining('Hallo'));
  });

  it('throws in production without SMTP_HOST', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const {sendMail} = await import('@lib/email/mailer');

    await expect(sendMail(message)).rejects.toThrow('SMTP_HOST');
    expect(createTransportMock).not.toHaveBeenCalled();
  });
});
