'use client';

import {useState, type FormEvent, type ChangeEvent} from 'react';
import {
	SuccessIcon, ErrorIcon, SendIcon, SpinnerIcon,
} from '@components/ui/icons';

const submitButtonClassName = [
	'w-full py-4 px-6 bg-primary-hover hover:bg-brand-primary-700 text-white font-semibold rounded-xl',
	'transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2',
	'focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2',
].join(' ');

type ContactFormProperties = {
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

type ApiResponse = {
	success?: boolean;
	message?: string;
	errors?: FormErrors;
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

// Extracted form field components to reduce complexity
type TextFieldProps = {
	id: string;
	label: string;
	type?: 'text' | 'email' | 'tel';
	required?: boolean;
	placeholder: string;
	value: string;
	error?: string;
	onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

function TextField({id, label, type = 'text', required = false, placeholder, value, error, onChange}: TextFieldProps) {
	return (
		<div>
			<label className={labelStyles} htmlFor={id}>
				{label} {required && <span className='text-primary-hover' aria-hidden='true'>*</span>}
				{required && <span className='sr-only'>(verplicht)</span>}
				{!required && <span className='text-gray-500 font-normal'>(optioneel)</span>}
			</label>
			<input
				type={type}
				id={id}
				name={id}
				required={required}
				aria-required={required}
				aria-invalid={Boolean(error)}
				aria-describedby={error ? `${id}-error` : undefined}
				className={`${inputBaseStyles} ${error ? inputErrorStyles : ''}`}
				placeholder={placeholder}
				value={value}
				onChange={onChange}
			/>
			{error && (
				<p id={`${id}-error`} className='mt-1 text-sm text-red-600 font-medium' role='alert'>
					{error}
				</p>
			)}
		</div>
	);
}

type TextAreaFieldProps = {
	id: string;
	label: string;
	placeholder: string;
	value: string;
	error?: string;
	onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
};

function TextAreaField({id, label, placeholder, value, error, onChange}: TextAreaFieldProps) {
	return (
		<div className='mt-6'>
			<label className={labelStyles} htmlFor={id}>
				{label} <span className='text-primary-hover' aria-hidden='true'>*</span>
				<span className='sr-only'>(verplicht)</span>
			</label>
			<textarea
				id={id}
				name={id}
				required
				aria-required='true'
				aria-invalid={Boolean(error)}
				aria-describedby={error ? `${id}-error` : undefined}
				rows={5}
				className={`${inputBaseStyles} resize-y min-h-[120px] ${error ? inputErrorStyles : ''}`}
				placeholder={placeholder}
				value={value}
				onChange={onChange}
			/>
			{error && (
				<p id={`${id}-error`} className='mt-1 text-sm text-red-600 font-medium' role='alert'>
					{error}
				</p>
			)}
		</div>
	);
}

type SelectFieldProps = {
	id: string;
	label: string;
	value: string;
	error?: string;
	options: Array<{value: string; label: string}>;
	onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
};

function SelectField({id, label, value, error, options, onChange}: SelectFieldProps) {
	return (
		<div className='mt-6'>
			<label className={labelStyles} htmlFor={id}>
				{label} <span className='text-primary-hover' aria-hidden='true'>*</span>
				<span className='sr-only'>(verplicht)</span>
			</label>
			<select
				id={id}
				name={id}
				required
				aria-required='true'
				aria-invalid={Boolean(error)}
				aria-describedby={error ? `${id}-error` : undefined}
				className={`${inputBaseStyles} ${error ? inputErrorStyles : ''}`}
				value={value}
				onChange={onChange}
			>
				{options.map(option => (
					<option key={option.value} value={option.value}>{option.label}</option>
				))}
			</select>
			{error && (
				<p id={`${id}-error`} className='mt-1 text-sm text-red-600 font-medium' role='alert'>
					{error}
				</p>
			)}
		</div>
	);
}

const subjectOptions = [
	{value: '', label: 'Selecteer een onderwerp'},
	{value: 'vraag', label: 'Algemene vraag'},
	{value: 'activiteit', label: 'Vraag over activiteit'},
	{value: 'lidmaatschap', label: 'Lid worden'},
	{value: 'sponsoring', label: 'Sponsoring'},
	{value: 'anders', label: 'Anders'},
];

// Extracted component for success message
function SuccessMessage() {
	return (
		<section className='py-16 px-6 bg-gray-50'>
			<div className='max-w-2xl mx-auto text-center'>
				<div className='bg-success-600 text-white p-8 rounded-2xl' role='alert'>
					<SuccessIcon className='h-16 w-16 mx-auto mb-4' />
					<h3 className='text-2xl font-bold mb-2'>Bedankt voor uw bericht!</h3>
					<p>We nemen zo snel mogelijk contact met u op.</p>
				</div>
			</div>
		</section>
	);
}

// Extracted component for general error message
function GeneralErrorMessage({message}: {message: string}) {
	return (
		<div className='mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg' role='alert'>
			<p className='text-red-800 font-medium flex items-center gap-2'>
				<ErrorIcon className='h-5 w-5' />
				{message}
			</p>
		</div>
	);
}

// Extracted component for submit button
function SubmitButton({isSubmitting}: {isSubmitting: boolean}) {
	return (
		<button
			type='submit'
			disabled={isSubmitting}
			className={submitButtonClassName}
		>
			{isSubmitting
				? (
					<>
						<SpinnerIcon className='animate-spin h-5 w-5' />
						<span>Verzenden...</span>
					</>
				)
				: (
					<>
						<span>Verstuur bericht</span>
						<SendIcon className='h-5 w-5' />
					</>
				)}
		</button>
	);
}

// Validation functions extracted
function validateName(name: string): string | undefined {
	if (!name.trim()) {
		return 'Naam is verplicht';
	}

	if (name.trim().length < 2) {
		return 'Naam moet minstens 2 karakters bevatten';
	}

	return undefined;
}

function validateEmail(email: string): string | undefined {
	if (!email.trim()) {
		return 'E-mailadres is verplicht';
	}

	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		return 'Ongeldig e-mailadres';
	}

	return undefined;
}

function validateMessage(message: string): string | undefined {
	if (!message.trim()) {
		return 'Bericht is verplicht';
	}

	if (message.trim().length < 10) {
		return 'Bericht moet minstens 10 karakters bevatten';
	}

	return undefined;
}

function ContactForm({
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

	const validateForm = (): boolean => {
		const newErrors: FormErrors = {
			name: validateName(formData.name),
			email: validateEmail(formData.email),
			subject: showSubject && !formData.subject ? 'Selecteer een onderwerp' : undefined,
			message: validateMessage(formData.message),
		};

		// Remove undefined values
		const filteredErrors = Object.fromEntries(Object.entries(newErrors).filter(([, v]) => v !== undefined)) as FormErrors;

		setErrors(filteredErrors);
		return Object.keys(filteredErrors).length === 0;
	};

	const handleInputChange = (field: keyof FormData) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		setFormData(previous => ({...previous, [field]: event.target.value}));
		if (errors[field]) {
			setErrors(previous => ({...previous, [field]: undefined}));
		}
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setStatusMessage('');

		if (!validateForm()) {
			setStatusMessage('Controleer de gemarkeerde velden.');
			return;
		}

		setIsSubmitting(true);
		setStatusMessage('Bericht wordt verzonden...');

		try {
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify(formData),
			});

			const data = await response.json() as ApiResponse;

			if (!response.ok) {
				if (data.errors) {
					setErrors(data.errors);
				}

				setStatusMessage(data.message ?? 'Er is een fout opgetreden.');
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
		return <SuccessMessage />;
	}

	return (
		<div>
			<div className='sr-only' role='status' aria-live='polite' aria-atomic='true'>
				{statusMessage}
			</div>

			{errors.general && <GeneralErrorMessage message={errors.general} />}

			<form onSubmit={handleSubmit} className='bg-white p-8 rounded-2xl shadow-lg' noValidate>
				<div className='grid md:grid-cols-2 gap-6'>
					<TextField
						id='name'
						label='Naam'
						required
						placeholder='Uw naam'
						value={formData.name}
						error={errors.name}
						onChange={handleInputChange('name')}
					/>
					<TextField
						id='email'
						label='E-mail'
						type='email'
						required
						placeholder='uw.email@voorbeeld.be'
						value={formData.email}
						error={errors.email}
						onChange={handleInputChange('email')}
					/>
				</div>
				{showPhone && (
					<div className='mt-6'>
						<TextField
							id='phone'
							label='Telefoonnummer'
							type='tel'
							placeholder='+32 xxx xx xx xx'
							value={formData.phone}
							onChange={handleInputChange('phone')}
						/>
					</div>
				)}
				{showSubject && (
					<SelectField
						id='subject'
						label='Onderwerp'
						value={formData.subject}
						error={errors.subject}
						options={subjectOptions}
						onChange={handleInputChange('subject')}
					/>
				)}
				<TextAreaField
					id='message'
					label='Bericht'
					placeholder='Uw bericht...'
					value={formData.message}
					error={errors.message}
					onChange={handleInputChange('message')}
				/>
				<div className='mt-8'>
					<SubmitButton isSubmitting={isSubmitting} />
				</div>
			</form>
		</div>
	);
}

export const ContactFormInfo = {
	name: 'ContactForm',
	component: ContactForm,
	inputs: [
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
