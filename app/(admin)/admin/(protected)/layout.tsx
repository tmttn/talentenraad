import {redirect} from 'next/navigation';
import {eq} from 'drizzle-orm';
import {auth0, isAdminEmail} from '@/lib/auth0';
import {db, users} from '@/lib/db';
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

	return (
		<div className='min-h-screen bg-gray-50 flex'>
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
	);
}
