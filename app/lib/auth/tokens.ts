import {createHash, randomBytes} from 'node:crypto';
import {
  and, count, eq, gt, isNull,
} from 'drizzle-orm';
import {db, loginTokens} from '@lib/db';
import {normalizeEmail} from './admin';

export const loginTokenLifetimeMs = 15 * 60 * 1000;
export const maxLoginRequestsPerWindow = 5;

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Creates a single-use login token for an email. Returns the raw token (for the
 * link) or undefined when the rate limit (5 per 15 minutes) is reached. Only the
 * sha256 hash is stored.
 */
export async function createLoginToken(rawEmail: string): Promise<string | undefined> {
  const email = normalizeEmail(rawEmail);
  const now = Date.now();

  const [{value: recent}] = await db.select({value: count()})
    .from(loginTokens)
    .where(and(
      eq(loginTokens.email, email),
      gt(loginTokens.createdAt, new Date(now - loginTokenLifetimeMs)),
    ));

  if (recent >= maxLoginRequestsPerWindow) {
    return undefined;
  }

  const token = randomBytes(32).toString('base64url');
  await db.insert(loginTokens).values({
    email,
    tokenHash: hashToken(token),
    expiresAt: new Date(now + loginTokenLifetimeMs),
    // Written from the app clock (UTC) so it compares consistently with the rate-limit window.
    createdAt: new Date(now),
  });

  return token;
}

/**
 * Marks a token as used in one atomic UPDATE, so two clicks cannot both succeed.
 * Returns undefined for unknown, expired or already used tokens.
 */
export async function consumeLoginToken(token: string): Promise<{email: string} | undefined> {
  if (!token) {
    return undefined;
  }

  const now = new Date();
  const [row] = await db.update(loginTokens)
    .set({usedAt: now})
    .where(and(
      eq(loginTokens.tokenHash, hashToken(token)),
      isNull(loginTokens.usedAt),
      gt(loginTokens.expiresAt, now),
    ))
    .returning({email: loginTokens.email});

  return row ? {email: row.email} : undefined;
}
