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
  /** `contour`: pink pill with a black outline, for contour cards. */
  variant?: 'default' | 'contour';
  className?: string;
};

const variantStyles = {
  default: 'px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20',
  contour: 'px-[18px] py-3 font-bold text-black bg-brand-primary-100 hover:bg-brand-primary-50 contour-xs',
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
      className={`inline-flex items-center gap-2 rounded-full transition-colors ${variantStyles[variant]} ${className}`}
    >
      <CalendarPlus className={variant === 'contour' ? 'h-5 w-5' : 'h-4 w-4'} aria-hidden='true' />
      Toevoegen aan agenda
    </button>
  );
}
