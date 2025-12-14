'use client';

import Image from 'next/image';
import {EmailIcon} from '@components/ui/icons';

type TeamMemberProperties = {
	name: string;
	role: string;
	image?: string;
	email?: string;
	description?: string;
	variant?: 'card' | 'compact' | 'horizontal';
};

function TeamMember({
	name,
	role,
	image,
	email,
	description,
	variant = 'card',
}: Readonly<TeamMemberProperties>) {
	const getInitials = (fullName: string) => fullName
		.split(' ')
		.map(n => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2);

	const roleColors: Record<string, string> = {
		Voorzitter: 'bg-primary text-white',
		Secretaris: 'bg-secondary text-white',
		Penningmeester: 'bg-accent text-white',
		Lid: 'bg-gray-200 text-gray-700',
		default: 'bg-primary/10 text-primary',
	};

	const getRoleColor = (memberRole: string) => roleColors[memberRole] || roleColors.default;

	if (variant === 'compact') {
		return (
			<div className='flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow'>
				<div className='relative w-14 h-14 flex-shrink-0'>
					{image
						? (
							<Image
								src={image}
								alt={name}
								fill
								className='object-cover rounded-full'
							/>
						)
						: (
							<div className='w-full h-full rounded-full bg-gradient-to-br from-brand-primary-500 to-brand-accent-400 flex items-center justify-center'>
								<span className='text-white font-bold text-lg'>{getInitials(name)}</span>
							</div>
						)}
				</div>
				<div className='flex-grow min-w-0'>
					<h3 className='font-bold text-gray-800 truncate'>{name}</h3>
					<span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${getRoleColor(role)}`}>
						{role}
					</span>
				</div>
			</div>
		);
	}

	if (variant === 'horizontal') {
		return (
			<div className='flex flex-col md:flex-row items-center gap-6 p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow'>
				<div className='relative w-32 h-32 flex-shrink-0'>
					{image
						? (
							<Image
								src={image}
								alt={name}
								fill
								className='object-cover rounded-2xl'
							/>
						)
						: (
							<div className='w-full h-full rounded-2xl bg-gradient-to-br from-brand-primary-500 to-brand-accent-400 flex items-center justify-center'>
								<span className='text-white font-bold text-3xl'>{getInitials(name)}</span>
							</div>
						)}
				</div>
				<div className='flex-grow text-center md:text-left'>
					<span className={`inline-block text-sm px-3 py-1 rounded-full mb-2 ${getRoleColor(role)}`}>
						{role}
					</span>
					<h3 className='text-2xl font-bold text-gray-800'>{name}</h3>
					{description && (
						<p className='text-gray-600 mt-2'>{description}</p>
					)}
					{email && (
						<a
							href={`mailto:${email}`}
							className='inline-flex items-center gap-2 mt-3 text-primary hover:underline'
						>
							<EmailIcon className='h-4 w-4' />
							{email}
						</a>
					)}
				</div>
			</div>
		);
	}

	// Default card variant
	return (
		<div className='group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden'>
			<div className='relative h-48 bg-gradient-to-br from-brand-primary-500 via-brand-primary-600 to-brand-accent-400 overflow-hidden'>
				{/* Decorative circles */}
				<div className='absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2' />
				<div className='absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2' />

				{image
					? (
						<Image
							src={image}
							alt={name}
							fill
							className='object-cover group-hover:scale-105 transition-transform duration-300'
						/>
					)
					: (
						<div className='absolute inset-0 flex items-center justify-center'>
							<div className='w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30'>
								<span className='text-white font-bold text-3xl'>{getInitials(name)}</span>
							</div>
						</div>
					)}
			</div>
			<div className='p-6 text-center'>
				<span className={`inline-block text-sm px-3 py-1 rounded-full mb-3 ${getRoleColor(role)}`}>
					{role}
				</span>
				<h3 className='text-xl font-bold text-gray-800'>{name}</h3>
				{description && (
					<p className='text-gray-600 text-sm mt-3 line-clamp-3'>{description}</p>
				)}
				{email && (
					<a
						href={`mailto:${email}`}
						className='inline-flex items-center gap-2 mt-4 text-gray-500 hover:text-primary transition-colors text-sm'
					>
						<EmailIcon className='h-4 w-4' />
						{email}
					</a>
				)}
			</div>
		</div>
	);
}

export const TeamMemberInfo = {
	name: 'TeamMember',
	component: TeamMember,
	inputs: [
		{
			name: 'name',
			type: 'string',
			required: true,
			defaultValue: 'Jan Janssen',
		},
		{
			name: 'role',
			type: 'string',
			required: true,
			defaultValue: 'Voorzitter',
			enum: ['Voorzitter', 'Ondervoorzitter', 'Secretaris', 'Penningmeester', 'Lid'],
		},
		{
			name: 'image',
			type: 'file',
			allowedFileTypes: ['jpeg', 'jpg', 'png', 'webp'],
		},
		{
			name: 'email',
			type: 'email',
		},
		{
			name: 'description',
			type: 'longText',
			helperText: 'Korte beschrijving of bio',
		},
		{
			name: 'variant',
			type: 'string',
			enum: ['card', 'compact', 'horizontal'],
			defaultValue: 'card',
			helperText: 'Weergave stijl',
		},
	],
};
