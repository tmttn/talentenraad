import {type NextRequest, NextResponse} from 'next/server';
import {normalizeEmail, safeReturnTo, verifyAdmin} from '@lib/auth/admin';
import {createLoginToken} from '@lib/auth/tokens';
import {getSiteUrl} from '@lib/email/mailer';
import {sendLoginLink} from '@lib/email/messages';

// Same answer for every request, so nobody can find out which addresses have access.
const neutralMessage = 'Als dit adres toegang heeft, ontvang je een e-mail met een link.';

function parseEmail(body: unknown): string | undefined {
  const email = (body as {email?: unknown} | undefined)?.email;

  if (typeof email !== 'string') {
    return undefined;
  }

  const normalized = normalizeEmail(email);
  return normalized.length <= 254 && /^[^\s@]+@[^\s@]+$/.test(normalized) ? normalized : undefined;
}

function buildLoginUrl(token: string, returnTo: unknown): string {
  const parameters = new URLSearchParams({token});

  if (typeof returnTo === 'string' && safeReturnTo(returnTo) === returnTo) {
    parameters.set('returnTo', returnTo);
  }

  return `${getSiteUrl()}/api/auth/verify?${parameters.toString()}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {returnTo?: unknown} | undefined;
    const email = parseEmail(body);

    if (email && await verifyAdmin(email)) {
      const token = await createLoginToken(email);

      if (token) {
        // Not awaited: the answer must not wait for (or reveal) the SMTP round trip.
        sendLoginLink({to: email, url: buildLoginUrl(token, body?.returnTo)}).catch((error: unknown) => {
          console.error('Failed to send login link:', error);
        });
      }
    }
  } catch (error) {
    console.error('Login request failed:', error instanceof Error ? error.message : error);
  }

  return NextResponse.json({message: neutralMessage});
}
