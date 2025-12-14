'use client';

import {useState, type FormEvent} from 'react';

type NewsletterSignupProperties = {
	buttonText?: string;
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

function NewsletterSignup({
	buttonText = 'Inschrijven',
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

	return (
		<form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-3 max-w-md'>
			<div className='flex-grow'>
				<label htmlFor='newsletter-email' className='sr-only'>E-mailadres</label>
				<input
					type='email'
					id='newsletter-email'
					value={email}
					onChange={event => {
						setEmail(event.target.value);
					}}
					placeholder='Je e-mailadres'
					required
					disabled={status === 'loading'}
					className={inputClassName}
				/>
			</div>
			<button
				type='submit'
				disabled={status === 'loading'}
				className={buttonClassName}
			>
				{status === 'loading' ? 'Bezig...' : buttonText}
			</button>
			{status === 'success' && (
				<p className='text-success-600 text-sm mt-2'>{message}</p>
			)}
			{status === 'error' && (
				<p className='text-red-600 text-sm mt-2'>{message}</p>
			)}
		</form>
	);
}

export const NewsletterSignupInfo = {
	name: 'NewsletterSignup',
	component: NewsletterSignup,
	inputs: [
		{
			name: 'buttonText',
			type: 'string',
			defaultValue: 'Inschrijven',
			helperText: 'Tekst op de knop',
		},
	],
};
