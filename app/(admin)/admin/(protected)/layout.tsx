import {redirect} from 'next/navigation';
import {headers} from 'next/headers';
import {eq, and, gt} from 'drizzle-orm';
import {Toaster} from 'sonner';
import {auth0, isAdminEmail} from '@/lib/auth0';
import {db, users, auditLogs} from '@/lib/db';
import {getAllFlags} from '@/lib/flags';
import {FlagsProvider} from '@/lib/flags-client';
import {AdminSidebar} from '@/features/admin/admin-sidebar';
import {SessionValidator} from '@/features/admin/session-validator';

async function ensureUserInDatabase(email: string, name: string | undefined, auth0Id: string): Promise<boolean> {
	const isEnvAdmin = isAdminEmail(email);

	const existingUser = await db.query.users.findFirst({
		where: eq(users.email, email),
	});

	if (!existingUser) {
		// Create new user, grant admin if in ADMIN_EMAILS env var
		await db.insert(users).values({
			email,
			name: name ?? undefined,
			auth0Id,
			isAdmin: isEnvAdmin,
		});
		return isEnvAdmin;
	}

	// Update auth0Id if missing
	if (!existingUser.auth0Id) {
		await db.update(users)
			.set({auth0Id, updatedAt: new Date()})
			.where(eq(users.id, existingUser.id));
	}

	// If user is in ADMIN_EMAILS but not marked as admin in DB, grant admin
	if (isEnvAdmin && !existingUser.isAdmin) {
		await db.update(users)
			.set({isAdmin: true, updatedAt: new Date()})
			.where(eq(users.id, existingUser.id));
		return true;
	}

	// Return true if user is admin in database OR in env var
	return existingUser.isAdmin || isEnvAdmin;
}

async function logLoginEvent(email: string, name: string | undefined): Promise<void> {
	try {
		// Check if user logged in recently (within 30 minutes) to avoid duplicate logs
		const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
		const recentLogin = await db.query.auditLogs.findFirst({
			where: and(
				eq(auditLogs.userEmail, email),
				eq(auditLogs.actionType, 'login'),
				gt(auditLogs.createdAt, thirtyMinutesAgo),
			),
		});

		if (recentLogin) {
			return; // Skip if already logged recently
		}

		// Look up user
		const user = await db.query.users.findFirst({
			where: eq(users.email, email),
		});

		const headersList = await headers();

		await db.insert(auditLogs).values({
			actionType: 'login',
			resourceType: 'session',
			resourceId: null,
			userId: user?.id ?? null,
			userEmail: email,
			userName: name ?? null,
			ipAddress: headersList.get('x-forwarded-for')?.split(',')[0].trim() ?? null,
			userAgent: headersList.get('user-agent'),
			requestPath: '/admin',
			requestMethod: 'GET',
			dataBefore: null,
			dataAfter: null,
		});
	} catch (error) {
		// Don't let login logging break the admin access
		console.error('Failed to log login event:', error);
	}
}

export default async function AdminProtectedLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await auth0.getSession();

	// If not authenticated, redirect to login
	if (!session?.user) {
		redirect('/admin/login');
	}

	const userEmail = session.user.email?.toLowerCase();

	if (!userEmail) {
		redirect('/');
	}

	// Check if user is admin (database or env var)
	const isAdmin = await ensureUserInDatabase(userEmail, session.user.name, session.user.sub);

	if (!isAdmin) {
		redirect('/');
	}

	// Log login event (with deduplication)
	await logLoginEvent(userEmail, session.user.name);

	// Get feature flags for client components
	const flags = await getAllFlags();

	return (
		<FlagsProvider flags={flags}>
			<div className='min-h-screen bg-gray-50 flex'>
				<Toaster position='top-right' richColors closeButton />
				<SessionValidator />
				<AdminSidebar user={{
					name: session.user.name,
					email: session.user.email,
					image: session.user.picture,
				}} />
				<main id='main-content' className='flex-1 overflow-auto pt-16 lg:pt-0'>
					<div className='p-4 sm:p-6 lg:p-8'>
						{children}
					</div>
				</main>
			</div>
		</FlagsProvider>
	);
}
