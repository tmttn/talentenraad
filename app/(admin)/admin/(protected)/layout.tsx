import {redirect} from 'next/navigation';
import {eq} from 'drizzle-orm';
import {auth0, isAdminEmail} from '@/lib/auth0';
import {db, users} from '@/lib/db';
import {AdminSidebar} from '@/features/admin/admin-sidebar';

async function ensureUserInDatabase(email: string, name: string | undefined, auth0Id: string) {
	const existingUser = await db.query.users.findFirst({
		where: eq(users.email, email),
	});

	if (!existingUser) {
		await db.insert(users).values({
			email,
			name: name ?? undefined,
			auth0Id,
		});
	} else if (!existingUser.auth0Id) {
		await db.update(users)
			.set({auth0Id, updatedAt: new Date()})
			.where(eq(users.id, existingUser.id));
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

	// If not an admin, redirect to home
	if (!isAdminEmail(userEmail)) {
		redirect('/');
	}

	// Ensure user exists in database
	if (userEmail) {
		await ensureUserInDatabase(userEmail, session.user.name, session.user.sub);
	}

	return (
		<div className='min-h-screen bg-gray-50 flex'>
			<AdminSidebar user={{
				name: session.user.name,
				email: session.user.email,
				image: session.user.picture,
			}} />
			<main id='main-content' className='flex-1 p-8 overflow-auto'>
				{children}
			</main>
		</div>
	);
}
