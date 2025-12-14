'use client';

type InfoCardProperties = {
	title: string;
	description: string;
	icon?: 'heart' | 'users' | 'calendar' | 'star' | 'gift' | 'school' | 'money' | 'chat' | 'team' | 'email' | 'location' | 'phone';
	link?: string;
	linkText?: string;
	variant?: 'default' | 'pink' | 'green' | 'orange' | 'gradient';
};

const icons = {
	heart: (
		<svg xmlns='http://www.w3.org/2000/svg' className='h-8 w-8' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' />
		</svg>
	),
	users: (
		<svg xmlns='http://www.w3.org/2000/svg' className='h-8 w-8' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' />
		</svg>
	),
	calendar: (
		<svg xmlns='http://www.w3.org/2000/svg' className='h-8 w-8' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
		</svg>
	),
	star: (
		<svg xmlns='http://www.w3.org/2000/svg' className='h-8 w-8' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' />
		</svg>
	),
	gift: (
		<svg xmlns='http://www.w3.org/2000/svg' className='h-8 w-8' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7' />
		</svg>
	),
	school: (
		<svg xmlns='http://www.w3.org/2000/svg' className='h-8 w-8' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 14l9-5-9-5-9 5 9 5z' />
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' />
		</svg>
	),
	money: (
		<svg xmlns='http://www.w3.org/2000/svg' className='h-8 w-8' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
		</svg>
	),
	chat: (
		<svg xmlns='http://www.w3.org/2000/svg' className='h-8 w-8' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' />
		</svg>
	),
	team: (
		<svg xmlns='http://www.w3.org/2000/svg' className='h-8 w-8' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
		</svg>
	),
	email: (
		<svg xmlns='http://www.w3.org/2000/svg' className='h-8 w-8' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
		</svg>
	),
	location: (
		<svg xmlns='http://www.w3.org/2000/svg' className='h-8 w-8' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
		</svg>
	),
	phone: (
		<svg xmlns='http://www.w3.org/2000/svg' className='h-8 w-8' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
		</svg>
	),
};

const variantStyles = {
	default: {
		card: 'bg-white',
		iconBg: 'bg-[#ea247b]/10 text-[#ea247b] group-hover:bg-[#ea247b] group-hover:text-white',
		title: 'text-gray-800',
		description: 'text-gray-600',
		link: 'text-[#ea247b]',
	},
	pink: {
		card: 'bg-gradient-to-br from-[#ea247b] to-[#d91a6d]',
		iconBg: 'bg-white/20 text-white',
		title: 'text-white',
		description: 'text-white/90',
		link: 'text-white hover:text-white/80',
	},
	green: {
		card: 'bg-gradient-to-br from-[#afbd43] to-[#9aab2f]',
		iconBg: 'bg-white/20 text-white',
		title: 'text-white',
		description: 'text-white/90',
		link: 'text-white hover:text-white/80',
	},
	orange: {
		card: 'bg-gradient-to-br from-[#fcb142] to-[#e9a33a]',
		iconBg: 'bg-white/20 text-white',
		title: 'text-white',
		description: 'text-white/90',
		link: 'text-white hover:text-white/80',
	},
	gradient: {
		card: 'bg-gradient-to-br from-[#ea247b] via-[#fcb142] to-[#afbd43]',
		iconBg: 'bg-white/20 text-white',
		title: 'text-white',
		description: 'text-white/90',
		link: 'text-white hover:text-white/80',
	},
};

function InfoCard({
	title,
	description,
	icon = 'star',
	link,
	linkText = 'Meer info',
	variant = 'default',
}: Readonly<InfoCardProperties>) {
	const styles = variantStyles[variant];

	return (
		<div className={`p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 text-center group relative overflow-hidden ${styles.card}`}>
			{/* Decorative elements for colored variants */}
			{variant !== 'default' && (
				<>
					<div className='absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2' />
					<div className='absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2' />
				</>
			)}

			<div className='relative z-10'>
				<div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 transition-all duration-300 ${variant === 'default' ? 'group-hover:scale-110' : ''} ${styles.iconBg}`}>
					{icons[icon]}
				</div>
				<h3 className={`text-xl font-bold mb-3 ${styles.title}`}>{title}</h3>
				<p className={`whitespace-pre-line ${styles.description}`}>{description}</p>
				{link && (
					<a
						href={link}
						className={`inline-flex items-center gap-1 mt-4 font-semibold hover:underline ${styles.link}`}
					>
						{linkText}
						<svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
						</svg>
					</a>
				)}
			</div>
		</div>
	);
}

export const InfoCardInfo = {
	name: 'InfoCard',
	component: InfoCard,
	inputs: [
		{
			name: 'title',
			type: 'string',
			required: true,
			defaultValue: 'Activiteiten',
		},
		{
			name: 'description',
			type: 'longText',
			required: true,
			defaultValue: 'Wij organiseren leuke activiteiten voor kinderen en ouders.',
		},
		{
			name: 'icon',
			type: 'string',
			enum: ['heart', 'users', 'calendar', 'star', 'gift', 'school', 'money', 'chat', 'team', 'email', 'location', 'phone'],
			defaultValue: 'star',
		},
		{
			name: 'variant',
			type: 'string',
			enum: ['default', 'pink', 'green', 'orange', 'gradient'],
			defaultValue: 'default',
			helperText: 'Kleurvariant van de kaart',
		},
		{
			name: 'link',
			type: 'string',
		},
		{
			name: 'linkText',
			type: 'string',
			defaultValue: 'Meer info',
		},
	],
};
