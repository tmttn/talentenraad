'use client';

import {Minus, Plus} from 'lucide-react';

type Properties = {
  name: string;
  /** What is counted, for the labels: "Aantal Margherita". */
  label: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
  invalid?: boolean;
  describedBy?: string;
};

const stepButton = [
  'inline-flex items-center justify-center w-11 h-11 rounded-control contour-sm transition',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2',
  'disabled:opacity-40 disabled:cursor-not-allowed',
].join(' ');

/**
 * Quantity with − and + buttons (44px). The number itself is a real input, so the form also works
 * without JavaScript: then the buttons do nothing and parents type the number.
 */
export function AantalKiezer({
  name, label, value, max, onChange, invalid, describedBy,
}: Readonly<Properties>) {
  const set = (next: number) => {
    onChange(Math.max(0, Math.min(max, next)));
  };

  return (
    <div role='group' aria-label={`Aantal ${label}`} className='flex items-center gap-2.5'>
      <button
        type='button'
        aria-label={`Eén ${label} minder`}
        disabled={value <= 0}
        className={`${stepButton} bg-white text-black hover:bg-brand-primary-50`}
        onClick={() => {
          set(value - 1);
        }}
      >
        <Minus className='h-5 w-5' strokeWidth={3} aria-hidden='true' />
      </button>
      <input
        type='number'
        name={name}
        inputMode='numeric'
        min={0}
        max={max}
        value={value === 0 ? '' : value}
        placeholder='0'
        aria-label={`Aantal ${label}`}
        aria-invalid={invalid ? true : undefined}
        aria-describedby={describedBy}
        className={[
          'w-12 h-11 text-center font-display font-extrabold text-2xl text-black bg-white rounded-control placeholder:text-gray-500',
          'border-(length:--contour-width-xs) border-transparent focus:border-ink focus:outline-none',
          '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
          invalid ? 'border-red-700 bg-red-50' : '',
        ].join(' ')}
        onChange={event => {
          const parsed = Number.parseInt(event.target.value, 10);
          set(Number.isNaN(parsed) ? 0 : parsed);
        }}
      />
      <button
        type='button'
        aria-label={`Eén ${label} meer`}
        disabled={value >= max}
        className={`${stepButton} bg-primary text-white shadow-hard-xs hover:bg-primary-hover active:translate-x-0.5 active:translate-y-0.5 active:shadow-none`}
        onClick={() => {
          set(value + 1);
        }}
      >
        <Plus className='h-5 w-5' strokeWidth={3} aria-hidden='true' />
      </button>
    </div>
  );
}
