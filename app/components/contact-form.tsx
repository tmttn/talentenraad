'use client';

import {useState, type FormEvent} from 'react';

type ContactFormProperties = {
	title?: string;
	subtitle?: string;
	emailTo?: string;
	showPhone?: boolean;
	showSubject?: boolean;
};

type FormErrors = {
	name?: string;
	email?: string;
	phone?: string;
	subject?: string;
	message?: string;
	general?: string;
};

type FormData = {
	name: string;
	email: string;
	phone: string;
	subject: string;
	message: string;
};

// Shared input styles for accessibility - improved contrast
const inputBaseStyles = `
	w-full px-4 py-3
	border-2 border-gray-400 rounded-lg
	bg-white text-gray-900
	placeholder:text-gray-500
	transition-colors duration-200
	focus:border-primary-hover focus:ring-2 focus:ring-primary/30 focus:outline-none
	focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-hover
	hover:border-gray-500
`.replaceAll(/\s+/g, ' ').trim();

const inputErrorStyles = 'border-red-500 focus:border-red-500 focus:ring-red-500/20';

const labelStyles = 'block text-sm font-semibold text-gray-800 mb-2';

function ContactForm({
	title = 'Contacteer ons',
	subtitle,
	showPhone = false,
	showSubject = true,
}: Readonly<ContactFormProperties>) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [errors, setErrors] = useState<FormErrors>({});
	const [statusMessage, setStatusMessage] = useState('');
	const [formData, setFormData] = useState<FormData>({
		name: '',
		email: '',
		phone: '',
		subject: '',
		message: '',
	});

	// Client-side validation
	const validateForm = (): boolean => {
		const newErrors: FormErrors = {};

		if (!formData.name.trim()) {
			newErrors.name = 'Naam is verplicht';
		} else if (formData.name.trim().length < 2) {
			newErrors.name = 'Naam moet minstens 2 karakters bevatten';
		}

		if (!formData.email.trim()) {
			newErrors.email = 'E-mailadres is verplicht';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = 'Ongeldig e-mailadres';
		}

		if (showSubject && !formData.subject) {
			newErrors.subject = 'Selecteer een onderwerp';
		}

		if (!formData.message.trim()) {
			newErrors.message = 'Bericht is verplicht';
		} else if (formData.message.trim().length < 10) {
			newErrors.message = 'Bericht moet minstens 10 karakters bevatten';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleInputChange = (field: keyof FormData, value: string) => {
		setFormData(previous => ({...previous, [field]: value}));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors(previous => ({...previous, [field]: undefined}));
		}
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		// Clear previous status
		setStatusMessage('');

		// Validate form
		if (!validateForm()) {
			setStatusMessage('Controleer de gemarkeerde velden.');
			return;
		}

		setIsSubmitting(true);
		setStatusMessage('Bericht wordt verzonden...');

		try {
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData),
			});

			const data = await response.json();

			if (!response.ok) {
				// Handle validation errors from server
				if (data.errors) {
					setErrors(data.errors);
				}

				setStatusMessage(data.message || 'Er is een fout opgetreden.');
				return;
			}

			setIsSubmitted(true);
			setStatusMessage('Bericht succesvol verzonden!');
		} catch {
			setErrors({general: 'Netwerkfout. Controleer uw internetverbinding.'});
			setStatusMessage('Er is een fout opgetreden bij het verzenden.');
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isSubmitted) {
		return (
			<section className='py-16 px-6 bg-gray-50'>
				<div className='max-w-2xl mx-auto text-center'>
					<div className='bg-success-600 text-white p-8 rounded-2xl' role='alert'>
						<svg xmlns='http://www.w3.org/2000/svg' className='h-16 w-16 mx-auto mb-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
						</svg>
						<h3 className='text-2xl font-bold mb-2'>Bedankt voor uw bericht!</h3>
						<p>We nemen zo snel mogelijk contact met u op.</p>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className='py-16 px-6 bg-gray-50' aria-labelledby='contact-form-title'>
			<div className='max-w-2xl mx-auto'>
				{/* Screen reader announcement for form status */}
				<div className='sr-only' role='status' aria-live='polite' aria-atomic='true'>
					{statusMessage}
				</div>

				{title && (
					<h2 id='contact-form-title' className='text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4'>
						{title}
					</h2>
				)}
				{subtitle && (
					<p className='text-center text-gray-600 mb-8'>{subtitle}</p>
				)}

				{/* General error message */}
				{errors.general && (
					<div className='mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg' role='alert'>
						<p className='text-red-800 font-medium flex items-center gap-2'>
							<svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' viewBox='0 0 20 20' fill='currentColor' aria-hidden='true'>
								<path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
							</svg>
							{errors.general}
						</p>
					</div>
				)}

				<form onSubmit={handleSubmit} className='bg-white p-8 rounded-2xl shadow-lg' noValidate>
					<div className='grid md:grid-cols-2 gap-6'>
						<div>
							<label className={labelStyles} htmlFor='name'>
								Naam <span className='text-primary-hover' aria-hidden='true'>*</span>
								<span className='sr-only'>(verplicht)</span>
							</label>
							<input
								type='text'
								id='name'
								name='name'
								required
								aria-required='true'
								aria-invalid={Boolean(errors.name)}
								aria-describedby={errors.name ? 'name-error' : undefined}
								className={`${inputBaseStyles} ${errors.name ? inputErrorStyles : ''}`}
								placeholder='Uw naam'
								value={formData.name}
								onChange={event => {
									handleInputChange('name', event.target.value);
								}}
							/>
							{errors.name && (
								<p id='name-error' className='mt-1 text-sm text-red-600 font-medium' role='alert'>
									{errors.name}
								</p>
							)}
						</div>
						<div>
							<label className={labelStyles} htmlFor='email'>
								E-mail <span className='text-primary-hover' aria-hidden='true'>*</span>
								<span className='sr-only'>(verplicht)</span>
							</label>
							<input
								type='email'
								id='email'
								name='email'
								required
								aria-required='true'
								aria-invalid={Boolean(errors.email)}
								aria-describedby={errors.email ? 'email-error' : undefined}
								className={`${inputBaseStyles} ${errors.email ? inputErrorStyles : ''}`}
								placeholder='uw.email@voorbeeld.be'
								value={formData.email}
								onChange={event => {
									handleInputChange('email', event.target.value);
								}}
							/>
							{errors.email && (
								<p id='email-error' className='mt-1 text-sm text-red-600 font-medium' role='alert'>
									{errors.email}
								</p>
							)}
						</div>
					</div>
					{showPhone && (
						<div className='mt-6'>
							<label className={labelStyles} htmlFor='phone'>
								Telefoonnummer <span className='text-gray-500 font-normal'>(optioneel)</span>
							</label>
							<input
								type='tel'
								id='phone'
								name='phone'
								className={inputBaseStyles}
								placeholder='+32 xxx xx xx xx'
								value={formData.phone}
								onChange={event => {
									handleInputChange('phone', event.target.value);
								}}
							/>
						</div>
					)}
					{showSubject && (
						<div className='mt-6'>
							<label className={labelStyles} htmlFor='subject'>
								Onderwerp <span className='text-primary-hover' aria-hidden='true'>*</span>
								<span className='sr-only'>(verplicht)</span>
							</label>
							<select
								id='subject'
								name='subject'
								required
								aria-required='true'
								aria-invalid={Boolean(errors.subject)}
								aria-describedby={errors.subject ? 'subject-error' : undefined}
								className={`${inputBaseStyles} ${errors.subject ? inputErrorStyles : ''}`}
								value={formData.subject}
								onChange={event => {
									handleInputChange('subject', event.target.value);
								}}
							>
								<option value=''>Selecteer een onderwerp</option>
								<option value='vraag'>Algemene vraag</option>
								<option value='activiteit'>Vraag over activiteit</option>
								<option value='lidmaatschap'>Lid worden</option>
								<option value='sponsoring'>Sponsoring</option>
								<option value='anders'>Anders</option>
							</select>
							{errors.subject && (
								<p id='subject-error' className='mt-1 text-sm text-red-600 font-medium' role='alert'>
									{errors.subject}
								</p>
							)}
						</div>
					)}
					<div className='mt-6'>
						<label className={labelStyles} htmlFor='message'>
							Bericht <span className='text-primary-hover' aria-hidden='true'>*</span>
							<span className='sr-only'>(verplicht)</span>
						</label>
						<textarea
							id='message'
							name='message'
							required
							aria-required='true'
							aria-invalid={Boolean(errors.message)}
							aria-describedby={errors.message ? 'message-error' : undefined}
							rows={5}
							className={`${inputBaseStyles} resize-y min-h-[120px] ${errors.message ? inputErrorStyles : ''}`}
							placeholder='Uw bericht...'
							value={formData.message}
							onChange={event => {
								handleInputChange('message', event.target.value);
							}}
						/>
						{errors.message && (
							<p id='message-error' className='mt-1 text-sm text-red-600 font-medium' role='alert'>
								{errors.message}
							</p>
						)}
					</div>
					<div className='mt-8'>
						<button
							type='submit'
							disabled={isSubmitting}
							className='w-full py-4 px-6 bg-primary-hover hover:bg-brand-primary-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2'
						>
							{isSubmitting
								? (
									<>
										<svg className='animate-spin h-5 w-5' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' aria-hidden='true'>
											<circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
											<path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
										</svg>
										<span>Verzenden...</span>
									</>
								)
								: (
									<>
										<span>Verstuur bericht</span>
										<svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
											<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8' />
										</svg>
									</>
								)}
						</button>
					</div>
				</form>
			</div>
		</section>
	);
}

export const ContactFormInfo = {
	name: 'ContactForm',
	component: ContactForm,
	inputs: [
		{
			name: 'title',
			type: 'string',
			defaultValue: 'Contacteer ons',
		},
		{
			name: 'subtitle',
			type: 'string',
			defaultValue: 'Heb je een vraag of wil je meer informatie? Neem gerust contact met ons op!',
		},
		{
			name: 'emailTo',
			type: 'email',
			helperText: 'E-mailadres waar berichten naartoe gestuurd worden',
		},
		{
			name: 'showPhone',
			type: 'boolean',
			defaultValue: false,
			helperText: 'Toon telefoonnummer veld',
		},
		{
			name: 'showSubject',
			type: 'boolean',
			defaultValue: true,
			helperText: 'Toon onderwerp dropdown',
		},
	],
};
