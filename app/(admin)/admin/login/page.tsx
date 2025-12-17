import {redirect} from 'next/navigation';
import {auth0} from '@/lib/auth0';

export default async function AdminLoginPage() {
	const session = await auth0.getSession();

	// If already authenticated, redirect to admin dashboard
	if (session?.user) {
		redirect('/admin');
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
			<div className='bg-white p-8 rounded-2xl shadow-lg max-w-md w-full'>
				<div className='text-center mb-8'>
					<h1 className='text-2xl font-bold text-gray-800 mb-2'>
						Admin Dashboard
					</h1>
					<p className='text-gray-500'>
						Log in om toegang te krijgen tot het admin dashboard.
					</p>
				</div>
				<a
					href='/auth/login?returnTo=/admin'
					className={[
						'w-full flex items-center justify-center gap-3 px-4 py-3 bg-primary text-white',
						'rounded-xl hover:bg-primary-hover transition-colors font-medium',
					].join(' ')}
				>
					<svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
						/>
					</svg>
					Inloggen
				</a>
				<p className='mt-6 text-center text-sm text-gray-500'>
					Alleen geautoriseerde beheerders kunnen inloggen.
				</p>
			</div>
		</div>
	);
}
