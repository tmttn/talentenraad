import {eq} from 'drizzle-orm';
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
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
		Google({
			// eslint-disable-next-line n/prefer-global/process
			clientId: process.env.GOOGLE_CLIENT_ID!,
			// eslint-disable-next-line n/prefer-global/process
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		}),
	],
	callbacks: {
		async signIn({user, account}) {
			if (account?.provider !== 'google' || !user.email) {
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
					googleId: account.providerAccountId,
				});
			} else if (!existingUser.googleId) {
				await db.update(users)
					.set({googleId: account.providerAccountId, updatedAt: new Date()})
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
