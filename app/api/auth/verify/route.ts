import {type NextRequest, NextResponse} from 'next/server';
import {ensureAdminUser, safeReturnTo, verifyAdmin} from '@lib/auth/admin';
import {logSessionEvent} from '@lib/auth/audit';
import {consumeLoginToken} from '@lib/auth/tokens';
import {createSessionCookie, sessionCookieName, sessionCookieOptions} from '@lib/auth/session';
import {getSiteUrl} from '@lib/email/mailer';

export async function GET(request: NextRequest) {
  const siteUrl = getSiteUrl();
  const failure = NextResponse.redirect(new URL('/admin/login?error=link', siteUrl));
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return failure;
  }

  try {
    // Marks the token used before anything else, so a second click always fails.
    const consumed = await consumeLoginToken(token);

    if (!consumed || !await verifyAdmin(consumed.email)) {
      return failure;
    }

    const user = await ensureAdminUser(consumed.email);
    const returnTo = safeReturnTo(request.nextUrl.searchParams.get('returnTo'));
    const response = NextResponse.redirect(new URL(returnTo, siteUrl));
    response.cookies.set(sessionCookieName, await createSessionCookie(user), sessionCookieOptions());

    await logSessionEvent(request, 'login', user);

    return response;
  } catch (error) {
    console.error('Login link verification failed:', error);
    return failure;
  }
}
