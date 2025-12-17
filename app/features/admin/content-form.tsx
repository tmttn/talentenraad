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
	'w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-900',
	'focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none',
	'transition-colors duration-200',
].join(' ');

const labelStyles = 'block text-sm font-semibold text-gray-800 mb-2';

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
		<form onSubmit={handleSubmit} className='bg-white rounded-xl shadow-md p-6'>
			{error && (
				<div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800'>
					{error}
				</div>
			)}

			<div className='space-y-6'>
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
							<p className='mt-1 text-sm text-gray-500'>{field.helpText}</p>
						)}
					</div>
				))}
			</div>

			<div className='mt-8 flex gap-4'>
				<button
					type='submit'
					disabled={isSubmitting}
					className='px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center gap-2'
				>
					{isSubmitting ? (
						<>
							<span className='animate-spin'>&#8987;</span>
							Bezig...
						</>
					) : (
						submitLabel
					)}
				</button>
				<button
					type='button'
					onClick={() => {
						router.push(cancelPath);
					}}
					disabled={isSubmitting}
					className='px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50'
				>
					Annuleren
				</button>
			</div>
		</form>
	);
}
