import type {ReactNode} from 'react';

type FormFieldProps = {
	/** Label text */
	label: string;
	/** HTML for attribute (should match input id) */
	htmlFor: string;
	/** Is the field required */
	required?: boolean;
	/** Error message */
	error?: string;
	/** Hint text (shown below input) */
	hint?: string;
	/** Form input element */
	children: ReactNode;
	/** Additional CSS classes */
	className?: string;
};

/**
 * FormField - Wrapper for form inputs with label, error, and hint
 *
 * Usage:
 * <FormField label="Email" htmlFor="email" required error={errors.email}>
 *   <Input id="email" type="email" />
 * </FormField>
 */
export function FormField({
	label,
	htmlFor,
	required = false,
	error,
	hint,
	children,
	className = '',
}: FormFieldProps) {
	const hasError = Boolean(error);

	return (
		<div className={`flex flex-col gap-1 ${className}`}>
			<label htmlFor={htmlFor} className="text-sm font-medium text-gray-700">
				{label}
				{required && (
					<span className="ml-1 text-red-500" aria-hidden="true">
						*
					</span>
				)}
			</label>

			{children}

			{hint && !hasError && <p className="text-sm text-gray-500">{hint}</p>}

			{hasError && (
				<p className="text-sm text-red-600" role="alert" aria-live="polite">
					{error}
				</p>
			)}
		</div>
	);
}
