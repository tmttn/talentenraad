'use client';

type LoginButtonProps = {
	returnTo: string;
};

export function LoginButton({returnTo}: LoginButtonProps) {
	const loginUrl = `/auth/login?returnTo=${encodeURIComponent(returnTo)}`;

	return (
		<a
			href={loginUrl}
			className='w-full flex items-center justify-center gap-3 px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors font-medium'
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
	);
}
