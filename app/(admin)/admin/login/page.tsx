import type {Metadata} from 'next';
import Image from 'next/image';
import {redirect} from 'next/navigation';
import {auth0} from '@/lib/auth0';
import {Auth0LockLogin} from './auth0-lock-login';
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

	// Get Auth0 config from environment
	// eslint-disable-next-line n/prefer-global/process
	const auth0Domain = process.env.AUTH0_DOMAIN ?? '';
	// eslint-disable-next-line n/prefer-global/process
	const auth0ClientId = process.env.AUTH0_CLIENT_ID ?? '';

	// Check if Auth0 is properly configured for embedded login
	const hasAuth0Config = auth0Domain && auth0ClientId;

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
			<div className='bg-white p-6 sm:p-8 rounded-modal shadow-elevated max-w-md w-full'>
				<div className='text-center mb-6 sm:mb-8'>
					<Image
						src='/Logo.png'
						alt='Talentenraad'
						width={160}
						height={107}
						className='h-16 w-auto mx-auto mb-4'
						priority
					/>
					<h1 className='text-xl sm:text-2xl font-bold text-gray-800 mb-2'>
						Admin Dashboard
					</h1>
					<p className='text-gray-500 text-sm sm:text-base'>
						Log in om toegang te krijgen tot het admin dashboard.
					</p>
				</div>
				{hasAuth0Config ? (
					<Auth0LockLogin
						domain={auth0Domain}
						clientId={auth0ClientId}
						returnTo={safeReturnTo}
					/>
				) : (
					<LoginButton returnTo={safeReturnTo} />
				)}
				<p className='mt-6 text-center text-xs sm:text-sm text-gray-500'>
					Alleen geautoriseerde beheerders kunnen inloggen.
				</p>
			</div>
		</div>
	);
}
