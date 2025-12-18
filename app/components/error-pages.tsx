'use client';

import Link from 'next/link';
import {Home, ArrowLeft, RefreshCw, Search, ShieldX, FileQuestion, ServerCrash, Lock} from 'lucide-react';

type ErrorPageProperties = {
	code: string;
	title: string;
	description: string;
	icon?: 'not-found' | 'forbidden' | 'error' | 'unauthorized';
	showHomeButton?: boolean;
	showBackButton?: boolean;
	showRetryButton?: boolean;
	showSearchButton?: boolean;
	onRetry?: () => void;
};

const iconMap = {
	'not-found': FileQuestion,
	forbidden: ShieldX,
	error: ServerCrash,
	unauthorized: Lock,
};

const iconColorMap = {
	'not-found': 'text-primary',
	forbidden: 'text-orange-500',
	error: 'text-red-500',
	unauthorized: 'text-yellow-500',
};

export function ErrorPage({
	code,
	title,
	description,
	icon = 'not-found',
	showHomeButton = true,
	showBackButton = true,
	showRetryButton = false,
	showSearchButton = false,
	onRetry,
}: Readonly<ErrorPageProperties>) {
	const IconComponent = iconMap[icon];

	return (
		<div className='min-h-[60vh] flex items-center justify-center px-4 py-16'>
			<div className='text-center max-w-lg'>
				{/* Icon */}
				<div className='mb-6 flex justify-center'>
					<div className={`p-4 rounded-full bg-gray-100 ${iconColorMap[icon]}`}>
						<IconComponent className='w-16 h-16' strokeWidth={1.5} />
					</div>
				</div>

				{/* Error code */}
				<p className='text-8xl font-bold text-gray-200 mb-2'>{code}</p>

				{/* Title */}
				<h1 className='text-2xl md:text-3xl font-bold text-gray-900 mb-4'>{title}</h1>

				{/* Description */}
				<p className='text-gray-600 mb-8 text-lg'>{description}</p>

				{/* Action buttons */}
				<div className='flex flex-wrap justify-center gap-3'>
					{showHomeButton && (
						<Link
							href='/'
							className='inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
						>
							<Home className='w-5 h-5' />
							Naar homepagina
						</Link>
					)}

					{showBackButton && (
						<button
							type='button'
							onClick={() => {
								window.history.back();
							}}
							className='inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2'
						>
							<ArrowLeft className='w-5 h-5' />
							Ga terug
						</button>
					)}

					{showRetryButton && onRetry && (
						<button
							type='button'
							onClick={onRetry}
							className='inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2'
						>
							<RefreshCw className='w-5 h-5' />
							Probeer opnieuw
						</button>
					)}

					{showSearchButton && (
						<Link
							href='/'
							className='inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2'
						>
							<Search className='w-5 h-5' />
							Zoeken
						</Link>
					)}
				</div>

				{/* Help text */}
				<p className='mt-8 text-sm text-gray-500'>
					Blijft dit probleem? Neem dan{' '}
					<Link href='/contact' className='text-primary hover:underline font-medium'>
						contact
					</Link>{' '}
					met ons op.
				</p>
			</div>
		</div>
	);
}

// Pre-configured error pages for common HTTP status codes
export function NotFoundPage() {
	return (
		<ErrorPage
			code='404'
			title='Pagina niet gevonden'
			description='Oeps! De pagina die je zoekt bestaat niet of is verplaatst.'
			icon='not-found'
			showSearchButton
		/>
	);
}

export function ForbiddenPage() {
	return (
		<ErrorPage
			code='403'
			title='Geen toegang'
			description='Je hebt geen toestemming om deze pagina te bekijken.'
			icon='forbidden'
			showSearchButton={false}
		/>
	);
}

export function UnauthorizedPage() {
	return (
		<ErrorPage
			code='401'
			title='Niet ingelogd'
			description='Je moet eerst inloggen om deze pagina te kunnen bekijken.'
			icon='unauthorized'
			showBackButton={false}
			showSearchButton={false}
		/>
	);
}

type ServerErrorPageProperties = {
	reset?: () => void;
};

export function ServerErrorPage({reset}: Readonly<ServerErrorPageProperties>) {
	return (
		<ErrorPage
			code='500'
			title='Er ging iets mis'
			description='Sorry, er is een onverwachte fout opgetreden. We werken eraan om dit op te lossen.'
			icon='error'
			showRetryButton={Boolean(reset)}
			onRetry={reset}
		/>
	);
}

// Admin-specific error pages with different styling
type AdminErrorPageProperties = {
	code: string;
	title: string;
	description: string;
	showRetry?: boolean;
	onRetry?: () => void;
};

export function AdminErrorPage({
	code,
	title,
	description,
	showRetry = false,
	onRetry,
}: Readonly<AdminErrorPageProperties>) {
	return (
		<div className='flex items-center justify-center min-h-[50vh]'>
			<div className='text-center max-w-md'>
				<p className='text-6xl font-bold text-gray-300 mb-2'>{code}</p>
				<h1 className='text-xl font-bold text-gray-900 mb-2'>{title}</h1>
				<p className='text-gray-600 mb-6'>{description}</p>

				<div className='flex justify-center gap-3'>
					<Link
						href='/admin'
						className='inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors'
					>
						<Home className='w-4 h-4' />
						Dashboard
					</Link>

					{showRetry && onRetry && (
						<button
							type='button'
							onClick={onRetry}
							className='inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors'
						>
							<RefreshCw className='w-4 h-4' />
							Opnieuw
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
