'use client';

import {CalendarPlus} from 'lucide-react';
import {downloadICalEvent} from '@lib/calendar';

type AddToCalendarButtonProperties = {
  title: string;
  date: string;
  time?: string;
  location?: string;
  description?: string;
  url?: string;
  id: string;
  /** `contour`: pink pill with a black outline; `contour-solid`: the primary contour button, for a side panel. */
  variant?: 'default' | 'contour' | 'contour-solid';
  /** Button text; "Toevoegen aan agenda" by default. */
  label?: string;
  className?: string;
};

const variantStyles = {
  default: 'px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-full',
  contour: 'px-[18px] py-3 font-bold text-black bg-brand-primary-100 hover:bg-brand-primary-50 contour-xs rounded-full',
  'contour-solid': 'justify-center px-[18px] py-3 font-bold text-white bg-primary hover:bg-primary-hover contour-sm shadow-hard-sm rounded-control active:translate-x-1 active:translate-y-1 active:shadow-none',
};

export function AddToCalendarButton({
  title,
  date,
  time,
  location,
  description,
  url,
  id,
  variant = 'default',
  label = 'Toevoegen aan agenda',
  className = '',
}: Readonly<AddToCalendarButtonProperties>) {
  const handleClick = () => {
    downloadICalEvent({
      title,
      date,
      time,
      location,
      description,
      url,
      id,
    });
  };

  return (
    <button
      type='button'
      onClick={handleClick}
      className={`inline-flex items-center gap-2 transition ${variantStyles[variant]} ${className}`}
    >
      <CalendarPlus className={variant === 'default' ? 'h-4 w-4' : 'h-5 w-5'} aria-hidden='true' />
      {label}
    </button>
  );
}
