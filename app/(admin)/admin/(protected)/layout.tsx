import {redirect} from 'next/navigation';
import {auth0, isAdminEmail} from '@/lib/auth0';
import {AdminSidebar} from '@/features/admin/admin-sidebar';

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

	// If not an admin, redirect to home
	if (!isAdminEmail(session.user.email)) {
		redirect('/');
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
