'use client';

import {useState, type FormEvent, type ChangeEvent} from 'react';
import {useRouter} from 'next/navigation';

export type FieldDefinition = {
	name: string;
	label: string;
	type: 'text' | 'textarea' | 'richtext' | 'date' | 'select' | 'url' | 'boolean' | 'number';
	required?: boolean;
	placeholder?: string;
	options?: Array<{value: string; label: string}>;
	helpText?: string;
};

type ContentFormProps = {
	fields: FieldDefinition[];
	initialData?: Record<string, unknown>;
	onSubmit: (data: Record<string, unknown>) => Promise<void>;
	submitLabel?: string;
	cancelPath: string;
};

const inputStyles = [
	'w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-900',
	'focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none',
	'transition-colors duration-200 text-base',
].join(' ');

const labelStyles = 'block text-sm font-semibold text-gray-800 mb-2';

function Spinner() {
	return (
		<svg className='animate-spin h-4 w-4' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
			<circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
			<path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
		</svg>
	);
}

export function ContentForm({
	fields,
	initialData = {},
	onSubmit,
	submitLabel = 'Opslaan',
	cancelPath,
}: ContentFormProps) {
	const router = useRouter();
	const [formData, setFormData] = useState<Record<string, unknown>>(initialData);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleChange = (name: string, value: unknown) => {
		setFormData(previous => ({...previous, [name]: value}));
		setError(null);
	};

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		setIsSubmitting(true);
		setError(null);

		try {
			// Validate required fields
			for (const field of fields) {
				if (field.required && !formData[field.name]) {
					throw new Error(`${field.label} is verplicht`);
				}
			}

			await onSubmit(formData);
			router.push(cancelPath);
			router.refresh();
		} catch (submitError) {
			setError(submitError instanceof Error ? submitError.message : 'Er is een fout opgetreden');
		} finally {
			setIsSubmitting(false);
		}
	};

	const renderField = (field: FieldDefinition) => {
		const value = formData[field.name];

		switch (field.type) {
			case 'text':
			case 'url': {
				return (
					<input
						type={field.type === 'url' ? 'url' : 'text'}
						id={field.name}
						value={String(value ?? '')}
						onChange={(e: ChangeEvent<HTMLInputElement>) => {
							handleChange(field.name, e.target.value);
						}}
						placeholder={field.placeholder}
						required={field.required}
						className={inputStyles}
					/>
				);
			}

			case 'textarea':
			case 'richtext': {
				return (
					<textarea
						id={field.name}
						value={String(value ?? '')}
						onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
							handleChange(field.name, e.target.value);
						}}
						placeholder={field.placeholder}
						required={field.required}
						rows={field.type === 'richtext' ? 10 : 4}
						className={`${inputStyles} resize-y min-h-[100px]`}
					/>
				);
			}

			case 'date': {
				return (
					<input
						type='date'
						id={field.name}
						value={String(value ?? '')}
						onChange={(e: ChangeEvent<HTMLInputElement>) => {
							handleChange(field.name, e.target.value);
						}}
						required={field.required}
						className={inputStyles}
					/>
				);
			}

			case 'select': {
				return (
					<select
						id={field.name}
						value={String(value ?? '')}
						onChange={(e: ChangeEvent<HTMLSelectElement>) => {
							handleChange(field.name, e.target.value);
						}}
						required={field.required}
						className={inputStyles}
					>
						<option value=''>Selecteer...</option>
						{field.options?.map(option => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				);
			}

			case 'boolean': {
				return (
					<label className='flex items-center gap-3 cursor-pointer'>
						<input
							type='checkbox'
							id={field.name}
							checked={Boolean(value)}
							onChange={(e: ChangeEvent<HTMLInputElement>) => {
								handleChange(field.name, e.target.checked);
							}}
							className='w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary'
						/>
						<span className='text-gray-700'>{field.placeholder ?? 'Ja'}</span>
					</label>
				);
			}

			case 'number': {
				return (
					<input
						type='number'
						id={field.name}
						value={value !== undefined ? Number(value) : ''}
						onChange={(e: ChangeEvent<HTMLInputElement>) => {
							handleChange(field.name, e.target.value ? Number(e.target.value) : undefined);
						}}
						placeholder={field.placeholder}
						required={field.required}
						className={inputStyles}
					/>
				);
			}

			default: {
				return null;
			}
		}
	};

	return (
		<form onSubmit={handleSubmit} className='bg-white rounded-xl shadow-md p-4 sm:p-6'>
			{error && (
				<div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 flex items-start gap-3'>
					<svg className='w-5 h-5 text-red-500 flex-shrink-0 mt-0.5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
						<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
					</svg>
					<span>{error}</span>
				</div>
			)}

			<div className='space-y-5 sm:space-y-6'>
				{fields.map(field => (
					<div key={field.name}>
						{field.type !== 'boolean' && (
							<label htmlFor={field.name} className={labelStyles}>
								{field.label}
								{field.required && <span className='text-red-500 ml-1'>*</span>}
							</label>
						)}
						{renderField(field)}
						{field.helpText && (
							<p className='mt-1.5 text-sm text-gray-500'>{field.helpText}</p>
						)}
					</div>
				))}
			</div>

			<div className='mt-6 sm:mt-8 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4'>
				<button
					type='button'
					onClick={() => {
						router.push(cancelPath);
					}}
					disabled={isSubmitting}
					className='w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50'
				>
					Annuleren
				</button>
				<button
					type='submit'
					disabled={isSubmitting}
					className='w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2'
				>
					{isSubmitting ? (
						<>
							<Spinner />
							Bezig...
						</>
					) : (
						submitLabel
					)}
				</button>
			</div>
		</form>
	);
}
