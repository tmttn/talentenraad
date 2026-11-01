import {eq, sql} from 'drizzle-orm';
import {db, users} from '@lib/db';
import type {Role} from '@lib/db/schema';

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

/** ADMIN_EMAILS always wins; otherwise the role stored on the user. */
export function resolveRole(user: {email: string; role: Role}): Role {
  return isAdminEmail(user.email) ? 'admin' : user.role;
}

/**
 * The role of an email: admin for ADMIN_EMAILS, otherwise the users.role from the
 * database. undefined for unknown emails (no access).
 */
export async function getUserRole(email: string | undefined | null): Promise<Role | undefined> {
  if (isAdminEmail(email)) {
    return 'admin';
  }

  if (!email) {
    return undefined;
  }

  const user = await db.query.users.findFirst({
    where: emailEquals(email),
  });

  return user?.role;
}

/** Admins and redacteurs may log in; unknown emails may not. */
export async function canLogin(email: string | undefined | null): Promise<boolean> {
  return await getUserRole(email) !== undefined;
}

/**
 * Called after a successful login: makes sure the user has a users row, sets
 * acceptedAt on the first login and makes ADMIN_EMAILS users admin.
 */
export async function ensureAdminUser(rawEmail: string): Promise<{id: string; email: string}> {
  const email = normalizeEmail(rawEmail);
  const isEnvAdmin = isAdminEmail(email);
  const now = new Date();

  const existing = await db.query.users.findFirst({
    where: emailEquals(email),
  });

  if (!existing) {
    const role: Role = isEnvAdmin ? 'admin' : 'redacteur';
    const [created] = await db.insert(users).values({
      email,
      role,
      isAdmin: role === 'admin',
      acceptedAt: now,
    }).returning({id: users.id, email: users.email});
    return created;
  }

  const changes: {acceptedAt?: Date; role?: Role; isAdmin?: boolean} = {};
  if (!existing.acceptedAt) {
    changes.acceptedAt = now;
  }

  if (isEnvAdmin && existing.role !== 'admin') {
    changes.role = 'admin';
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
  if (returnTo && /^\/admin(?:[/?#]|$)/.test(returnTo) && !/^\/admin\/login(?:[/?#]|$)/.test(returnTo)) {
    return returnTo;
  }

  return '/admin';
}
