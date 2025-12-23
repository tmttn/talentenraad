import type {InputHTMLAttributes, ReactNode} from 'react';
import {forwardRef} from 'react';

type InputSize = 'sm' | 'md' | 'lg';

type InputProps = {
  /** Input size variant */
  size?: InputSize;
  /** Error state */
  error?: boolean;
  /** Icon to display on the left */
  iconLeft?: ReactNode;
  /** Icon to display on the right */
  iconRight?: ReactNode;
  /** Additional wrapper classes */
  wrapperClassName?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;

const sizeClasses: Record<InputSize, string> = {
  sm: 'px-2.5 py-1.5 text-sm',
  md: 'px-3 py-2 text-base',
  lg: 'px-4 py-3 text-lg',
};

const iconSizeClasses: Record<InputSize, string> = {
  sm: 'pl-8',
  md: 'pl-10',
  lg: 'pl-12',
};

const iconRightSizeClasses: Record<InputSize, string> = {
  sm: 'pr-8',
  md: 'pr-10',
  lg: 'pr-12',
};

/**
 * Input - Text input field with variants
 *
 * Usage:
 * <Input type="email" placeholder="Enter email" />
 * <Input size="lg" error iconLeft={<SearchIcon />} />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>((
  {
    size = 'md',
    error = false,
    iconLeft,
    iconRight,
    className = '',
    wrapperClassName = '',
    disabled,
    ...props
  },
  ref,
) => {
  const baseClasses = [
    'w-full rounded-input border transition-colors duration-fast',
    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
    'placeholder:text-gray-400',
    sizeClasses[size],
    iconLeft && iconSizeClasses[size],
    iconRight && iconRightSizeClasses[size],
    error
      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
      : 'border-gray-300 hover:border-gray-400',
    disabled && 'bg-gray-100 cursor-not-allowed opacity-60',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Boolean OR is intentional for truthy check on React nodes
  if (iconLeft || iconRight) {
    return (
      <div className={`relative ${wrapperClassName}`}>
        {iconLeft && (
          <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400'>
            {iconLeft}
          </div>
        )}
        <input ref={ref} className={baseClasses} disabled={disabled} {...props} />
        {iconRight && (
          <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400'>
            {iconRight}
          </div>
        )}
      </div>
    );
  }

  return <input ref={ref} className={baseClasses} disabled={disabled} {...props} />;
});

Input.displayName = 'Input';
