'use client';

import {useState, type FormEvent} from 'react';

type NewsletterSignupProperties = {
	title?: string;
	subtitle?: string;
	buttonText?: string;
	variant?: 'inline' | 'card' | 'banner';
	showSocialLinks?: boolean;
};

type FormState = {
	email: string;
	status: 'idle' | 'loading' | 'success' | 'error';
	message: string;
};

type FormHandlers = {
	handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
	setEmail: (email: string) => void;
};

const inputClassName = [
	'w-full px-4 py-3 rounded-lg border border-gray-300',
	'focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent',
	'disabled:bg-gray-100 disabled:cursor-not-allowed',
].join(' ');

const buttonClassName = [
	'px-6 py-3 bg-primary text-white font-semibold rounded-lg',
	'hover:bg-primary-hover transition-colors',
	'focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2',
	'disabled:opacity-50 disabled:cursor-not-allowed',
].join(' ');

function InlineVariant({state, handlers, buttonText}: {
	state: FormState;
	handlers: FormHandlers;
	buttonText: string;
}) {
	return (
		<form onSubmit={handlers.handleSubmit} className='flex flex-col sm:flex-row gap-3 max-w-md'>
			<div className='flex-grow'>
				<label htmlFor='newsletter-email-inline' className='sr-only'>E-mailadres</label>
				<input
					type='email'
					id='newsletter-email-inline'
					value={state.email}
					onChange={event => {
						handlers.setEmail(event.target.value);
					}}
					placeholder='Je e-mailadres'
					required
					disabled={state.status === 'loading'}
					className={inputClassName}
				/>
			</div>
			<button
				type='submit'
				disabled={state.status === 'loading'}
				className={buttonClassName}
			>
				{state.status === 'loading' ? 'Bezig...' : buttonText}
			</button>
			{state.status === 'success' && (
				<p className='text-success-600 text-sm mt-2'>{state.message}</p>
			)}
			{state.status === 'error' && (
				<p className='text-red-600 text-sm mt-2'>{state.message}</p>
			)}
		</form>
	);
}

const bannerButtonClassName = [
	'px-6 py-3 bg-white text-primary font-semibold rounded-lg',
	'hover:bg-gray-100 transition-colors',
	'focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-primary-500',
	'disabled:opacity-50 disabled:cursor-not-allowed',
].join(' ');

const bannerInputClassName = [
	'w-full md:w-64 px-4 py-3 rounded-lg border-0',
	'focus:outline-none focus:ring-2 focus:ring-white',
	'disabled:bg-gray-100 disabled:cursor-not-allowed',
].join(' ');

function BannerVariant({state, handlers, buttonText, title, subtitle}: {
	state: FormState;
	handlers: FormHandlers;
	buttonText: string;
	title?: string;
	subtitle?: string;
}) {
	return (
		<section className='bg-gradient-to-r from-brand-primary-500 to-brand-primary-600 py-8 px-6'>
			<div className='max-w-4xl mx-auto'>
				<div className='flex flex-col md:flex-row items-center justify-between gap-6'>
					<div className='text-center md:text-left'>
						{title && (
							<h2 className='text-xl md:text-2xl font-bold text-white mb-1'>
								{title}
							</h2>
						)}
						{subtitle && (
							<p className='text-white/90 text-sm md:text-base'>
								{subtitle}
							</p>
						)}
					</div>
					<form onSubmit={handlers.handleSubmit} className='flex flex-col sm:flex-row gap-3 w-full md:w-auto'>
						<div className='flex-grow'>
							<label htmlFor='newsletter-email-banner' className='sr-only'>E-mailadres</label>
							<input
								type='email'
								id='newsletter-email-banner'
								value={state.email}
								onChange={event => {
									handlers.setEmail(event.target.value);
								}}
								placeholder='Je e-mailadres'
								required
								disabled={state.status === 'loading'}
								className={bannerInputClassName}
							/>
						</div>
						<button
							type='submit'
							disabled={state.status === 'loading'}
							className={bannerButtonClassName}
						>
							{state.status === 'loading' ? 'Bezig...' : buttonText}
						</button>
					</form>
				</div>
				{(state.status === 'success' || state.status === 'error') && (
					<p className={`text-center mt-4 text-sm ${state.status === 'success' ? 'text-white' : 'text-red-200'}`}>
						{state.message}
					</p>
				)}
			</div>
		</section>
	);
}

function NewsletterSignup({
	title = 'Blijf op de hoogte',
	subtitle = 'Ontvang updates over activiteiten en nieuws van de Talentenraad',
	buttonText = 'Inschrijven',
	variant = 'card',
	showSocialLinks = true,
}: Readonly<NewsletterSignupProperties>) {
	const [email, setEmail] = useState('');
	const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
	const [message, setMessage] = useState('');

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setStatus('loading');

		// Simulate API call - in production, integrate with email service
		try {
			await new Promise(resolve => {
				setTimeout(resolve, 1000);
			});
			setStatus('success');
			setMessage('Bedankt voor je inschrijving! Je ontvangt binnenkort een bevestigingsmail.');
			setEmail('');
		} catch {
			setStatus('error');
			setMessage('Er is iets misgegaan. Probeer het later opnieuw.');
		}
	};

	const state: FormState = {email, status, message};
	const handlers: FormHandlers = {handleSubmit, setEmail};

	if (variant === 'inline') {
		return <InlineVariant state={state} handlers={handlers} buttonText={buttonText} />;
	}

	if (variant === 'banner') {
		return (
			<BannerVariant
				state={state}
				handlers={handlers}
				buttonText={buttonText}
				title={title}
				subtitle={subtitle}
			/>
		);
	}

	// Default: card variant
	return (
		<CardVariant
			state={state}
			handlers={handlers}
			buttonText={buttonText}
			title={title}
			subtitle={subtitle}
			showSocialLinks={showSocialLinks}
		/>
	);
}

const socialLinkClassName = [
	'w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center',
	'text-gray-600 hover:bg-primary hover:text-white transition-colors',
	'focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2',
].join(' ');

/* eslint-disable @stylistic/max-len */
const instagramPath = 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z';
/* eslint-enable @stylistic/max-len */

function CardVariant({state, handlers, buttonText, title, subtitle, showSocialLinks}: {
	state: FormState;
	handlers: FormHandlers;
	buttonText: string;
	title?: string;
	subtitle?: string;
	showSocialLinks?: boolean;
}) {
	const fullButtonClassName = `w-full ${buttonClassName}`;

	return (
		<section className='py-12 px-6' aria-labelledby='newsletter-title'>
			<div className='max-w-xl mx-auto'>
				<div className='bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-sm border border-gray-100'>
					<div className='text-center mb-6'>
						<div className='w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-8 w-8 text-primary'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'
								aria-hidden='true'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
								/>
							</svg>
						</div>
						{title && (
							<h2 id='newsletter-title' className='text-2xl font-bold text-gray-900 mb-2'>
								{title}
							</h2>
						)}
						{subtitle && (
							<p className='text-gray-600'>
								{subtitle}
							</p>
						)}
					</div>

					<form onSubmit={handlers.handleSubmit} className='space-y-4'>
						<div>
							<label htmlFor='newsletter-email-card' className='block text-sm font-medium text-gray-700 mb-1'>
								E-mailadres
							</label>
							<input
								type='email'
								id='newsletter-email-card'
								value={state.email}
								onChange={event => {
									handlers.setEmail(event.target.value);
								}}
								placeholder='naam@voorbeeld.be'
								required
								disabled={state.status === 'loading'}
								className={inputClassName}
							/>
						</div>
						<button
							type='submit'
							disabled={state.status === 'loading'}
							className={fullButtonClassName}
						>
							{state.status === 'loading'
								? (
									<span className='flex items-center justify-center gap-2'>
										<svg
											className='animate-spin h-5 w-5'
											xmlns='http://www.w3.org/2000/svg'
											fill='none'
											viewBox='0 0 24 24'
											aria-hidden='true'
										>
											<circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
											<path
												className='opacity-75'
												fill='currentColor'
												d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
											/>
										</svg>
										Bezig met inschrijven...
									</span>
								)
								: (
									<span className='flex items-center justify-center gap-2'>
										{buttonText}
										<svg
											xmlns='http://www.w3.org/2000/svg'
											className='h-5 w-5'
											fill='none'
											viewBox='0 0 24 24'
											stroke='currentColor'
											aria-hidden='true'
										>
											<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 8l4 4m0 0l-4 4m4-4H3' />
										</svg>
									</span>
								)}
						</button>

						{state.status === 'success' && (
							<div className='p-4 bg-success-50 border border-success-200 rounded-lg' role='alert'>
								<p className='text-success-800 text-sm flex items-center gap-2'>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										className='h-5 w-5'
										fill='none'
										viewBox='0 0 24 24'
										stroke='currentColor'
										aria-hidden='true'
									>
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
									</svg>
									{state.message}
								</p>
							</div>
						)}

						{state.status === 'error' && (
							<div className='p-4 bg-red-50 border border-red-200 rounded-lg' role='alert'>
								<p className='text-red-800 text-sm flex items-center gap-2'>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										className='h-5 w-5'
										fill='none'
										viewBox='0 0 24 24'
										stroke='currentColor'
										aria-hidden='true'
									>
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
									</svg>
									{state.message}
								</p>
							</div>
						)}
					</form>

					{showSocialLinks && (
						<div className='mt-6 pt-6 border-t border-gray-100'>
							<p className='text-sm text-gray-500 text-center mb-4'>Of volg ons op sociale media</p>
							<div className='flex items-center justify-center gap-4'>
								<a
									href='https://facebook.com/talentenhuis'
									target='_blank'
									rel='noopener noreferrer'
									className={socialLinkClassName}
									aria-label='Facebook (opent in nieuw venster)'
								>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										className='h-5 w-5'
										fill='currentColor'
										viewBox='0 0 24 24'
										aria-hidden='true'
									>
										<path d='M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z' />
									</svg>
								</a>
								<a
									href='https://instagram.com/talentenhuis'
									target='_blank'
									rel='noopener noreferrer'
									className={socialLinkClassName}
									aria-label='Instagram (opent in nieuw venster)'
								>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										className='h-5 w-5'
										fill='currentColor'
										viewBox='0 0 24 24'
										aria-hidden='true'
									>
										<path d={instagramPath} />
									</svg>
								</a>
							</div>
						</div>
					)}

					<p className='mt-4 text-xs text-gray-400 text-center'>
						We respecteren je privacy. Je kunt je op elk moment uitschrijven.
					</p>
				</div>
			</div>
		</section>
	);
}

export const NewsletterSignupInfo = {
	name: 'NewsletterSignup',
	component: NewsletterSignup,
	inputs: [
		{
			name: 'title',
			type: 'string',
			defaultValue: 'Blijf op de hoogte',
			helperText: 'Titel van de newsletter sectie',
		},
		{
			name: 'subtitle',
			type: 'string',
			defaultValue: 'Ontvang updates over activiteiten en nieuws van de Talentenraad',
			helperText: 'Ondertitel/beschrijving',
		},
		{
			name: 'buttonText',
			type: 'string',
			defaultValue: 'Inschrijven',
			helperText: 'Tekst op de knop',
		},
		{
			name: 'variant',
			type: 'string',
			enum: ['inline', 'card', 'banner'],
			defaultValue: 'card',
			helperText: 'Stijl: inline (compact), card (groot met rand), banner (volledig breed)',
		},
		{
			name: 'showSocialLinks',
			type: 'boolean',
			defaultValue: true,
			helperText: 'Toon sociale media links onder het formulier (alleen bij card variant)',
		},
	],
};
