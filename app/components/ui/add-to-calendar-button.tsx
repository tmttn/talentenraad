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
	className?: string;
};

export function AddToCalendarButton({
	title,
	date,
	time,
	location,
	description,
	url,
	id,
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
			className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-full transition-colors ${className}`}
		>
			<CalendarPlus className='h-4 w-4' />
			Toevoegen aan agenda
		</button>
	);
}
