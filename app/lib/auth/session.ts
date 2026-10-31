import {cookies} from 'next/headers';
import {eq} from 'drizzle-orm';
import {db, users} from '@lib/db';
import {isAdminUser} from './admin';
import {readSession, sessionCookieName} from './session-token';

export {
  createSessionCookie, readSession, sessionCookieName, sessionCookieOptions, sessionMaxAgeSeconds,
} from './session-token';

export type Session = {
  user: {id: string; email: string; name: string | null};
};

/**
 * Reads the session cookie, verifies the JWT and checks that the user still
 * exists and is still an admin (same rule as verifyAdmin).
 */
export async function getSession(): Promise<Session | undefined> {
  const cookieStore = await cookies();
  const claims = await readSession(cookieStore.get(sessionCookieName)?.value);

  if (!claims) {
    return undefined;
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, claims.userId),
  });

  if (!user || user.email !== claims.email || !isAdminUser(user)) {
    return undefined;
  }

  return {user: {id: user.id, email: user.email, name: user.name}};
}
