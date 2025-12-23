'use client';

type RadioOption = {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
};

type RadioGroupProps = {
  /** Group name (required for radio buttons) */
  name: string;
  /** Radio options */
  options: RadioOption[];
  /** Currently selected value */
  value?: string;
  /** Change handler */
  onChange?: (value: string) => void;
  /** Error state */
  error?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Orientation of the options */
  orientation?: 'vertical' | 'horizontal';
  /** Additional CSS classes */
  className?: string;
};

/**
 * RadioGroup - Radio button group
 *
 * Usage:
 * <RadioGroup
 *   name="plan"
 *   options={[
 *     { value: 'free', label: 'Free', description: 'Basic features' },
 *     { value: 'pro', label: 'Pro', description: 'All features' },
 *   ]}
 *   value={selectedPlan}
 *   onChange={setSelectedPlan}
 * />
 */
export function RadioGroup({
  name,
  options,
  value,
  onChange,
  error = false,
  disabled = false,
  orientation = 'vertical',
  className = '',
}: RadioGroupProps) {
  const orientationClasses = orientation === 'horizontal' ? 'flex-row flex-wrap gap-6' : 'flex-col gap-3';

  return (
    <div
      role='radiogroup'
      aria-label={name}
      className={`flex ${orientationClasses} ${className}`}
    >
      {options.map(option => {
        const optionId = `${name}-${option.value}`;
        const isDisabled = disabled || option.disabled;
        const isSelected = value === option.value;

        return (
          <div key={option.value} className='flex items-start gap-3'>
            <input
              type='radio'
              id={optionId}
              name={name}
              value={option.value}
              checked={isSelected}
              disabled={isDisabled}
              onChange={e => onChange?.(e.target.value)}
              className={[
                'mt-0.5 h-4 w-4 border-gray-300 text-primary',
                'focus:ring-2 focus:ring-primary/20 focus:ring-offset-0',
                'transition-colors duration-fast',
                error && 'border-red-300',
                isDisabled && 'cursor-not-allowed opacity-60',
              ]
                .filter(Boolean)
                .join(' ')}
            />
            <div className='flex flex-col'>
              <label
                htmlFor={optionId}
                className={[
                  'text-sm font-medium',
                  isDisabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 cursor-pointer',
                ].join(' ')}
              >
                {option.label}
              </label>
              {option.description && (
                <p className='text-sm text-gray-500'>{option.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
