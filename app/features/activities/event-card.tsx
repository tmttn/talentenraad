'use client';

import Image from 'next/image';
import {Calendar, MapPin} from 'lucide-react';

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
	// Uses shadow-floating → shadow-overlay, duration-slow tokens
	const content = (
		<div className='card bg-white rounded-card shadow-floating hover:shadow-overlay transition-shadow duration-slow overflow-hidden'>
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
					<Calendar className='h-5 w-5' aria-hidden='true' />
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
						<MapPin className='h-4 w-4' aria-hidden='true' />
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
				className='block focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 rounded-card'
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
