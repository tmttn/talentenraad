'use client';

import type {InputHTMLAttributes} from 'react';
import {forwardRef} from 'react';

type SwitchSize = 'sm' | 'md';

type SwitchProps = {
  /** Label text */
  label: string;
  /** Description text */
  description?: string;
  /** Switch size */
  size?: SwitchSize;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'>;

const sizeClasses: Record<SwitchSize, {track: string; thumb: string; translate: string}> = {
  sm: {
    track: 'h-5 w-9',
    thumb: 'h-4 w-4',
    translate: 'translate-x-4',
  },
  md: {
    track: 'h-6 w-11',
    thumb: 'h-5 w-5',
    translate: 'translate-x-5',
  },
};

/**
 * Switch - Toggle switch component
 *
 * Usage:
 * <Switch label="Enable notifications" />
 * <Switch label="Dark mode" description="Use dark theme" size="sm" />
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(({label, description, size = 'md', className = '', disabled, checked, id, ...props}, ref) => {
  const switchId = id ?? `switch-${label.toLowerCase().replaceAll(/\s+/g, '-')}`;
  const sizes = sizeClasses[size];

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <button
        type='button'
        role='switch'
        aria-checked={checked}
        aria-labelledby={`${switchId}-label`}
        disabled={disabled}
        onClick={() => {
          // Trigger the hidden input's change event
          const input = document.getElementById(switchId) as HTMLInputElement;
          if (input && !disabled) {
            input.click();
          }
        }}
        className={[
          'relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent',
          'transition-colors duration-base ease-in-out',
          'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2',
          sizes.track,
          checked ? 'bg-primary' : 'bg-gray-200',
          disabled && 'cursor-not-allowed opacity-60',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span
          className={[
            'pointer-events-none inline-block transform rounded-full bg-white shadow ring-0',
            'transition duration-base ease-in-out',
            sizes.thumb,
            checked ? sizes.translate : 'translate-x-0',
          ]
            .filter(Boolean)
            .join(' ')}
        />
      </button>

      {/* Hidden checkbox for form submission */}
      <input
        ref={ref}
        type='checkbox'
        id={switchId}
        checked={checked}
        disabled={disabled}
        className='sr-only'
        {...props}
      />

      <div className='flex flex-col'>
        <label
          id={`${switchId}-label`}
          htmlFor={switchId}
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

Switch.displayName = 'Switch';
