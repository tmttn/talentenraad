import type {SelectHTMLAttributes} from 'react';
import {forwardRef} from 'react';

type SelectSize = 'sm' | 'md' | 'lg';

type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectProps = {
  /** Select options */
  options: SelectOption[];
  /** Placeholder text */
  placeholder?: string;
  /** Select size variant */
  size?: SelectSize;
  /** Error state */
  error?: boolean;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'>;

const sizeClasses: Record<SelectSize, string> = {
  sm: 'px-2.5 py-1.5 text-sm',
  md: 'px-3 py-2 text-base',
  lg: 'px-4 py-3 text-lg',
};

/**
 * Select - Dropdown select input
 *
 * Usage:
 * <Select
 *   options={[
 *     { value: '1', label: 'Option 1' },
 *     { value: '2', label: 'Option 2' },
 *   ]}
 *   placeholder="Select an option"
 * />
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>((
  {options, placeholder, size = 'md', error = false, className = '', disabled, ...props},
  ref,
) => {
  const classes = [
    'w-full rounded-input border bg-white transition-colors duration-fast',
    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
    'appearance-none bg-no-repeat',
    sizeClasses[size],
    error
      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
      : 'border-gray-300 hover:border-gray-400',
    disabled && 'bg-gray-100 cursor-not-allowed opacity-60',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className='relative'>
      <select ref={ref} className={classes} disabled={disabled} {...props}>
        {placeholder && (
          <option value='' disabled>
            {placeholder}
          </option>
        )}
        {options.map(option => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      {/* Dropdown arrow */}
      <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3'>
        <svg
          className='h-4 w-4 text-gray-400'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
          aria-hidden='true'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M19 9l-7 7-7-7'
          />
        </svg>
      </div>
    </div>
  );
});

Select.displayName = 'Select';
