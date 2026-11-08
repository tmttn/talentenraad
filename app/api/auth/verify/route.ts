import {type NextRequest, NextResponse} from 'next/server';
import {ensureAdminUser, getUserRole, safeReturnTo} from '@lib/auth/admin';
import {logSessionEvent} from '@lib/auth/audit';
import {consumeLoginToken} from '@lib/auth/tokens';
import {
  createSessionCookie, helperSessionMaxAgeSeconds, sessionCookieName, sessionCookieOptions, sessionMaxAgeSeconds,
} from '@lib/auth/session';
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

    const role = consumed ? await getUserRole(consumed.email) : undefined;
    if (!consumed || !role) {
      return failure;
    }

    const user = await ensureAdminUser(consumed.email);
    // A helper only has the pickup app, and a session of one day
    const helper = role === 'helper';
    const requested = safeReturnTo(request.nextUrl.searchParams.get('returnTo'));
    const returnTo = helper && !requested.startsWith('/admin/afhalen') ? '/admin/afhalen' : requested;
    const maxAge = helper ? helperSessionMaxAgeSeconds : sessionMaxAgeSeconds;
    const response = NextResponse.redirect(publicUrl(returnTo, request));
    response.cookies.set(sessionCookieName, await createSessionCookie(user, maxAge), sessionCookieOptions(maxAge));

    await logSessionEvent(request, 'login', user);

    return response;
  } catch (error) {
    console.error('Login link verification failed:', error);
    return failure;
  }
}
