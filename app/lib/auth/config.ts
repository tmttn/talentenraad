import {eq} from 'drizzle-orm';
import NextAuth from 'next-auth';
import Auth0 from 'next-auth/providers/auth0';
import {db, users} from '@/lib/db';

const getAdminEmails = (): string[] => {
	// eslint-disable-next-line n/prefer-global/process
	const emails = process.env.ADMIN_EMAILS ?? '';
	return emails.split(',').map(email => email.trim().toLowerCase()).filter(Boolean);
};

// eslint-disable-next-line new-cap
export const {handlers, signIn, signOut, auth} = NextAuth({
	providers: [
		// eslint-disable-next-line new-cap
		Auth0({
			// eslint-disable-next-line n/prefer-global/process
			clientId: process.env.AUTH0_CLIENT_ID!,
			// eslint-disable-next-line n/prefer-global/process
			clientSecret: process.env.AUTH0_CLIENT_SECRET!,
			// eslint-disable-next-line n/prefer-global/process
			issuer: process.env.AUTH0_ISSUER_BASE_URL,
		}),
	],
	callbacks: {
		async signIn({user, account}) {
			if (account?.provider !== 'auth0' || !user.email) {
				return false;
			}

			const adminEmails = getAdminEmails();
			const userEmail = user.email.toLowerCase();

			// Only allow emails in the allow-list
			if (!adminEmails.includes(userEmail)) {
				return false;
			}

			// Check if user exists, create if not
			const existingUser = await db.query.users.findFirst({
				where: eq(users.email, userEmail),
			});

			if (!existingUser) {
				await db.insert(users).values({
					email: userEmail,
					name: user.name ?? undefined,
					auth0Id: account.providerAccountId,
				});
			} else if (!existingUser.auth0Id) {
				await db.update(users)
					.set({auth0Id: account.providerAccountId, updatedAt: new Date()})
					.where(eq(users.id, existingUser.id));
			}

			return true;
		},
		async session({session}) {
			if (session.user?.email) {
				const dbUser = await db.query.users.findFirst({
					where: eq(users.email, session.user.email.toLowerCase()),
				});
				if (dbUser) {
					session.user.id = dbUser.id;
				}
			}

			return session;
		},
	},
	pages: {
		signIn: '/admin/login',
		error: '/admin/login',
	},
});
