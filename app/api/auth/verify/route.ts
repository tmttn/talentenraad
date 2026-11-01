import {type NextRequest, NextResponse} from 'next/server';
import {ensureAdminUser, safeReturnTo, canLogin} from '@lib/auth/admin';
import {logSessionEvent} from '@lib/auth/audit';
import {consumeLoginToken} from '@lib/auth/tokens';
import {createSessionCookie, sessionCookieName, sessionCookieOptions} from '@lib/auth/session';
import {publicUrl} from '@lib/public-url';

export async function GET(request: NextRequest) {
  const failure = NextResponse.redirect(publicUrl('/admin/login?error=link', request));
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return failure;
  }

  try {
    // Marks the token used before anything else, so a second click always fails.
    const consumed = await consumeLoginToken(token);

    if (!consumed || !await canLogin(consumed.email)) {
      return failure;
    }

    const user = await ensureAdminUser(consumed.email);
    const returnTo = safeReturnTo(request.nextUrl.searchParams.get('returnTo'));
    const response = NextResponse.redirect(publicUrl(returnTo, request));
    response.cookies.set(sessionCookieName, await createSessionCookie(user), sessionCookieOptions());

    await logSessionEvent(request, 'login', user);

    return response;
  } catch (error) {
    console.error('Login link verification failed:', error);
    return failure;
  }
}
