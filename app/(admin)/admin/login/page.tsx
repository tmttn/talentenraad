import type {Metadata} from 'next';
import {redirect} from 'next/navigation';
import {auth0} from '@/lib/auth0';
import {LoginButton} from './login-button';

export const metadata: Metadata = {
	title: 'Inloggen',
};

type AdminLoginPageProps = {
	searchParams: Promise<{
		returnTo?: string;
	}>;
};

export default async function AdminLoginPage({searchParams}: AdminLoginPageProps) {
	const session = await auth0.getSession();
	const params = await searchParams;

	// If already authenticated, redirect to admin dashboard or returnTo
	if (session?.user) {
		const returnTo = params.returnTo ?? '/admin';
		// Only allow admin paths for security
		const safeReturnTo = returnTo.startsWith('/admin') ? returnTo : '/admin';
		redirect(safeReturnTo);
	}

	// Get returnTo from search params, default to /admin
	const returnTo = params.returnTo ?? '/admin';
	// Only allow admin paths for security
	const safeReturnTo = returnTo.startsWith('/admin') ? returnTo : '/admin';

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
			<div className='bg-white p-6 sm:p-8 rounded-modal shadow-elevated max-w-md w-full'>
				<div className='text-center mb-6 sm:mb-8'>
					<h1 className='text-xl sm:text-2xl font-bold text-gray-800 mb-2'>
						Admin Dashboard
					</h1>
					<p className='text-gray-500 text-sm sm:text-base'>
						Log in om toegang te krijgen tot het admin dashboard.
					</p>
				</div>
				<LoginButton returnTo={safeReturnTo} />
				<p className='mt-6 text-center text-xs sm:text-sm text-gray-500'>
					Alleen geautoriseerde beheerders kunnen inloggen.
				</p>
			</div>
		</div>
	);
}
