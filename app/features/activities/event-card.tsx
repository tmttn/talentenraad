'use client';

import Image from 'next/image';
import {CalendarIcon, LocationIcon} from '@components/ui';

type EventCardProperties = {
	title: string;
	date: string;
	time?: string;
	location?: string;
	description?: string;
	image?: string;
	link?: string;
};

function EventCard({
	title,
	date,
	time,
	location,
	description,
	image,
	link,
}: Readonly<EventCardProperties>) {
	const content = (
		<div className='card bg-white shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden'>
			{image && (
				<figure className='relative h-48'>
					<Image
						src={image}
						alt={title}
						fill
						className='object-cover'
					/>
				</figure>
			)}
			<div className='card-body'>
				<div className='flex items-center gap-2 text-sm text-primary font-semibold mb-2'>
					<CalendarIcon size='md' />
					<span>{date}</span>
					{time && (
						<>
							<span className='text-gray-400'>|</span>
							<span>{time}</span>
						</>
					)}
				</div>
				<h3 className='card-title text-gray-800'>{title}</h3>
				{location && (
					<div className='flex items-center gap-2 text-sm text-gray-500'>
						<LocationIcon size='sm' />
						<span>{location}</span>
					</div>
				)}
				{description && (
					<p className='text-gray-600 mt-2 line-clamp-3'>{description}</p>
				)}
				{link && (
					<div className='card-actions justify-end mt-4'>
						<span className='text-primary font-semibold hover:underline'>
							Meer info →
						</span>
					</div>
				)}
			</div>
		</div>
	);

	if (link) {
		return (
			<a
				href={link}
				className='block focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 rounded-2xl'
				aria-label={`${title} - Meer info`}
			>
				{content}
			</a>
		);
	}

	return content;
}

export const EventCardInfo = {
	name: 'EventCard',
	component: EventCard,
	inputs: [
		{
			name: 'title',
			type: 'string',
			required: true,
			defaultValue: 'Schoolfeest',
		},
		{
			name: 'date',
			type: 'string',
			required: true,
			defaultValue: '15 maart 2025',
		},
		{
			name: 'time',
			type: 'string',
			defaultValue: '14:00 - 18:00',
		},
		{
			name: 'location',
			type: 'string',
			defaultValue: 'Het Talentenhuis',
		},
		{
			name: 'description',
			type: 'longText',
			defaultValue: 'Kom gezellig langs voor een leuke namiddag vol activiteiten!',
		},
		{
			name: 'image',
			type: 'file',
			allowedFileTypes: ['jpeg', 'jpg', 'png', 'webp'],
		},
		{
			name: 'link',
			type: 'string',
		},
	],
};
