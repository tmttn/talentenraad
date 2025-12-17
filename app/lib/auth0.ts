import {Auth0Client} from '@auth0/nextjs-auth0/server';
import {eq} from 'drizzle-orm';
import {db, users} from '@/lib/db';

const getAdminEmails = (): string[] => {
	// eslint-disable-next-line n/prefer-global/process
	const emails = process.env.ADMIN_EMAILS ?? '';
	return emails.split(',').map(email => email.trim().toLowerCase()).filter(Boolean);
};

export const auth0 = new Auth0Client({
	async beforeSessionSaved(session) {
		const userEmail = session.user.email?.toLowerCase();

		if (!userEmail) {
			return session;
		}

		// Check if user is in admin allow-list
		const adminEmails = getAdminEmails();
		if (!adminEmails.includes(userEmail)) {
			// User not allowed - session will still be created but we can check this later
			return session;
		}

		// Check if user exists in database, create if not
		const existingUser = await db.query.users.findFirst({
			where: eq(users.email, userEmail),
		});

		if (!existingUser) {
			await db.insert(users).values({
				email: userEmail,
				name: session.user.name ?? undefined,
				auth0Id: session.user.sub,
			});
		} else if (!existingUser.auth0Id) {
			await db.update(users)
				.set({auth0Id: session.user.sub, updatedAt: new Date()})
				.where(eq(users.id, existingUser.id));
		}

		return session;
	},
});

// Helper function to check if user is an admin
export function isAdminEmail(email: string | undefined | null): boolean {
	if (!email) return false;
	const adminEmails = getAdminEmails();
	return adminEmails.includes(email.toLowerCase());
}
