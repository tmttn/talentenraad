import type {InputHTMLAttributes} from 'react';
import {forwardRef} from 'react';

type CheckboxProps = {
  /** Label text */
  label: string;
  /** Description text */
  description?: string;
  /** Error state */
  error?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

/**
 * Checkbox - Single checkbox with label
 *
 * Usage:
 * <Checkbox label="Accept terms" />
 * <Checkbox label="Newsletter" description="Get updates via email" />
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({label, description, error = false, className = '', disabled, id, ...props}, ref) => {
  const checkboxId = id ?? `checkbox-${label.toLowerCase().replaceAll(/\s+/g, '-')}`;

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <input
        ref={ref}
        type='checkbox'
        id={checkboxId}
        disabled={disabled}
        className={[
          'mt-0.5 h-4 w-4 rounded border-gray-300 text-primary',
          'focus:ring-2 focus:ring-primary/20 focus:ring-offset-0',
          'transition-colors duration-fast',
          error && 'border-red-300',
          disabled && 'cursor-not-allowed opacity-60',
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />
      <div className='flex flex-col'>
        <label
          htmlFor={checkboxId}
          className={[
            'text-sm font-medium',
            disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 cursor-pointer',
          ].join(' ')}
        >
          {label}
        </label>
        {description && <p className='text-sm text-gray-500'>{description}</p>}
      </div>
    </div>
  );
});

Checkbox.displayName = 'Checkbox';
