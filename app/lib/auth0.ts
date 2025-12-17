import {Auth0Client} from '@auth0/nextjs-auth0/server';

export const auth0 = new Auth0Client();

// Helper function to check if user is an admin
export function isAdminEmail(email: string | undefined | null): boolean {
	if (!email) return false;
	// eslint-disable-next-line n/prefer-global/process
	const emails = process.env.ADMIN_EMAILS ?? '';
	const adminEmails = emails.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
	return adminEmails.includes(email.toLowerCase());
}
