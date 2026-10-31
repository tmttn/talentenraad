import {eq, sql} from 'drizzle-orm';
import {db, users} from '@lib/db';

/** Emails are compared lowercase and trimmed everywhere. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Check if an email is in the ADMIN_EMAILS env var (bootstrap/fallback).
 */
export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) {
    return false;
  }

  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map(entry => normalizeEmail(entry))
    .filter(Boolean);
  return adminEmails.includes(normalizeEmail(email));
}

/** Matches users.email case-insensitively, so legacy mixed-case rows are found. */
function emailEquals(email: string) {
  return sql`lower(${users.email}) = ${normalizeEmail(email)}`;
}

/** Admin when listed in ADMIN_EMAILS or marked isAdmin in the database. */
export function isAdminUser(user: {email: string; isAdmin: boolean}): boolean {
  return isAdminEmail(user.email) || user.isAdmin;
}

/**
 * Verify if an email belongs to an admin: ADMIN_EMAILS first, then the database.
 */
export async function verifyAdmin(email: string | undefined | null): Promise<boolean> {
  if (isAdminEmail(email)) {
    return true;
  }

  if (!email) {
    return false;
  }

  const user = await db.query.users.findFirst({
    where: emailEquals(email),
  });

  return user?.isAdmin ?? false;
}

/**
 * Called after a successful login: makes sure the admin has a users row,
 * sets acceptedAt on the first login and syncs isAdmin for ADMIN_EMAILS.
 */
export async function ensureAdminUser(rawEmail: string): Promise<{id: string; email: string}> {
  const email = normalizeEmail(rawEmail);
  const isEnvAdmin = isAdminEmail(email);
  const now = new Date();

  const existing = await db.query.users.findFirst({
    where: emailEquals(email),
  });

  if (!existing) {
    const [created] = await db.insert(users).values({
      email,
      isAdmin: isEnvAdmin,
      acceptedAt: now,
    }).returning({id: users.id, email: users.email});
    return created;
  }

  const changes: {acceptedAt?: Date; isAdmin?: boolean} = {};
  if (!existing.acceptedAt) {
    changes.acceptedAt = now;
  }

  if (isEnvAdmin && !existing.isAdmin) {
    changes.isAdmin = true;
  }

  if (Object.keys(changes).length > 0) {
    await db.update(users)
      .set({...changes, updatedAt: now})
      .where(eq(users.id, existing.id));
  }

  return {id: existing.id, email: existing.email};
}

/** Only same-site admin paths are allowed as redirect target. */
export function safeReturnTo(returnTo: string | undefined | null): string {
  if (returnTo && /^\/admin(?:[/?#]|$)/.test(returnTo)) {
    return returnTo;
  }

  return '/admin';
}
