import {Auth0Client} from '@auth0/nextjs-auth0/server';

export const auth0 = new Auth0Client();

/**
 * Check if user email is in the ADMIN_EMAILS env var (bootstrap/fallback)
 * This is synchronous and safe for edge runtime
 */
export function isAdminEmail(email: string | undefined | null): boolean {
	if (!email) return false;
	// eslint-disable-next-line n/prefer-global/process
	const emails = process.env.ADMIN_EMAILS ?? '';
	const adminEmails = emails.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
	return adminEmails.includes(email.toLowerCase());
}
