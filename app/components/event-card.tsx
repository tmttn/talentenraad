'use client';

import Image from 'next/image';

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
				<div className='flex items-center gap-2 text-sm text-[#ea247b] font-semibold mb-2'>
					<svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
						<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
					</svg>
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
						<svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
						</svg>
						<span>{location}</span>
					</div>
				)}
				{description && (
					<p className='text-gray-600 mt-2 line-clamp-3'>{description}</p>
				)}
				{link && (
					<div className='card-actions justify-end mt-4'>
						<span className='text-[#ea247b] font-semibold hover:underline'>
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
				className='block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ea247b] focus-visible:ring-offset-2 rounded-2xl'
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
