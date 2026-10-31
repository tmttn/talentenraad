import {after, type NextRequest, NextResponse} from 'next/server';
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

async function handleLoginRequest(email: string, returnTo: unknown): Promise<void> {
  try {
    if (!await verifyAdmin(email)) {
      return;
    }

    const token = await createLoginToken(email);

    if (!token) {
      return;
    }

    try {
      await sendLoginLink({to: email, url: buildLoginUrl(token, returnTo)});
    } catch (error) {
      console.error('Failed to send login link:', error);
    }
  } catch (error) {
    // Message only: never log anything that could carry the token.
    console.error('Login request failed:', error instanceof Error ? error.message : error);
  }
}

export async function POST(request: NextRequest) {
  let body: {email?: unknown; returnTo?: unknown} | undefined;

  try {
    body = await request.json() as typeof body;
  } catch {
    body = undefined;
  }

  const email = parseEmail(body);

  if (email) {
    // Runs after the response is sent, so admin and non-admin requests answer equally fast.
    after(async () => handleLoginRequest(email, body?.returnTo));
  }

  return NextResponse.json({message: neutralMessage});
}
