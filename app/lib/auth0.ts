import {Auth0Client} from '@auth0/nextjs-auth0/server';
import {db, users} from '@lib/db';
import {eq} from 'drizzle-orm';

export const auth0 = new Auth0Client();

/**
 * Check if user email is in the ADMIN_EMAILS env var (bootstrap/fallback)
 * This is synchronous and safe for edge runtime
 */
export function isAdminEmail(email: string | undefined | null): boolean {
	if (!email) return false;
	const emails = process.env.ADMIN_EMAILS ?? '';
	const adminEmails = emails.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
	return adminEmails.includes(email.toLowerCase());
}

/**
 * Verify if user is an admin - checks ADMIN_EMAILS first, then database
 * Use this for all admin API route authorization
 */
export async function verifyAdmin(email: string | undefined | null): Promise<boolean> {
	// First check env-based admin list (fast path)
	if (isAdminEmail(email)) {
		return true;
	}

	// Fallback to database check
	if (!email) return false;

	const user = await db.query.users.findFirst({
		where: eq(users.email, email.toLowerCase()),
	});

	return user?.isAdmin ?? false;
}
