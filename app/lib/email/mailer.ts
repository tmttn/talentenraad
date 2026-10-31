import nodemailer from 'nodemailer';

export type MailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

const defaultFrom = 'Talentenraad <noreply@talentenraad.be>';

/** Public base URL of the site, used in links inside mails. */
export function getSiteUrl(): string {
  const siteUrl = process.env.SITE_URL;

  if (siteUrl) {
    return siteUrl.replace(/\/$/, '');
  }

  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  throw new Error('SITE_URL is niet ingesteld');
}

export async function sendMail(message: MailMessage): Promise<void> {
  const host = process.env.SMTP_HOST;

  if (!host) {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[mail] Naar: ${message.to}\nOnderwerp: ${message.subject}\n\n${message.text}`);
      return;
    }

    throw new Error('SMTP_HOST is niet ingesteld');
  }

  const port = Number(process.env.SMTP_PORT ?? '') || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user ? {user, pass} : undefined,
  });

  await transport.sendMail({
    from: process.env.SMTP_FROM?.trim() || defaultFrom,
    ...message,
  });
}
