import {redirect} from 'next/navigation';
import {auth} from '@/lib/auth/config';
import {AdminSidebar} from '@/features/admin/admin-sidebar';

export default async function AdminProtectedLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await auth();

	// If not authenticated, redirect to login
	if (!session?.user) {
		redirect('/admin/login');
	}

	return (
		<div className='min-h-screen bg-gray-50 flex'>
			<AdminSidebar user={session.user} />
			<main id='main-content' className='flex-1 p-8 overflow-auto'>
				{children}
			</main>
		</div>
	);
}
