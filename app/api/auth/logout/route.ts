import {type NextRequest, NextResponse} from 'next/server';
import {logSessionEvent} from '@lib/auth/audit';
import {getSession, sessionCookieName, sessionCookieOptions} from '@lib/auth/session';
import {getSiteUrl} from '@lib/email/mailer';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (session) {
      await logSessionEvent(request, 'logout', session.user);
    }
  } catch (error) {
    // Logging out must never depend on the database.
    console.error('Failed to log logout event:', error);
  }

  // 303 so the browser follows with a GET.
  const response = NextResponse.redirect(new URL('/admin/login', getSiteUrl()), 303);
  response.cookies.set(sessionCookieName, '', {...sessionCookieOptions(), maxAge: 0});

  return response;
}
