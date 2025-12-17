'use client';

import Image from 'next/image';
import {Clock, ArrowRight} from 'lucide-react';
import {linkStyles} from '@components/ui';

type NewsCardProperties = {
	title: string;
	date: string;
	excerpt?: string;
	image?: string;
	category?: string;
	link?: string;
};

function NewsCard({
	title,
	date,
	excerpt,
	image,
	category,
	link,
}: Readonly<NewsCardProperties>) {
	const content = (
		<>
			<style dangerouslySetInnerHTML={{__html: linkStyles}} />
			<article className='group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden'>
				{image && (
					<div className='relative h-52 overflow-hidden'>
						<Image
							src={image}
							alt={title}
							fill
							className='object-cover group-hover:scale-105 transition-transform duration-300'
						/>
						{category && (
							<span className='absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full'>
								{category}
							</span>
						)}
					</div>
				)}
				<div className='p-6'>
					<time className='text-sm text-gray-500 flex items-center gap-2'>
						<Clock className='h-4 w-4' aria-hidden='true' />
						{date}
					</time>
					<h3 className='text-xl font-bold text-gray-800 mt-2 group-hover:text-primary transition-colors'>
						{title}
					</h3>
					{excerpt && (
						<p className='text-gray-600 mt-3 line-clamp-2'>{excerpt}</p>
					)}
					{link && (
						<span className='animated-link inline-flex items-center gap-1 mt-4 text-primary font-semibold' aria-hidden='true'>
							Lees meer
							<ArrowRight className='h-4 w-4 animated-link-arrow' aria-hidden='true' />
						</span>
					)}
				</div>
			</article>
		</>
	);

	if (link) {
		return (
			<a
				href={link}
				className='block focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 rounded-2xl'
				aria-label={`${title} - Lees meer`}
			>
				{content}
			</a>
		);
	}

	return content;
}

export const NewsCardInfo = {
	name: 'NewsCard',
	component: NewsCard,
	inputs: [
		{
			name: 'title',
			type: 'string',
			required: true,
			defaultValue: 'Nieuwstitel',
		},
		{
			name: 'date',
			type: 'string',
			required: true,
			defaultValue: '1 januari 2025',
		},
		{
			name: 'excerpt',
			type: 'longText',
			defaultValue: 'Een korte samenvatting van het nieuwsbericht...',
		},
		{
			name: 'image',
			type: 'file',
			allowedFileTypes: ['jpeg', 'jpg', 'png', 'webp'],
		},
		{
			name: 'category',
			type: 'string',
			enum: ['Nieuws', 'Activiteit', 'Aankondiging', 'Verslag'],
		},
		{
			name: 'link',
			type: 'string',
		},
	],
};
