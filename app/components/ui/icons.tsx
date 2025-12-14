import type {SVGProps} from 'react';

type IconProperties = SVGProps<SVGSVGElement> & {
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
};

const sizeMap = {
	xs: 'h-3 w-3',
	sm: 'h-4 w-4',
	md: 'h-5 w-5',
	lg: 'h-6 w-6',
	xl: 'h-8 w-8',
};

function CalendarIcon({size = 'md', className = '', ...props}: IconProperties) {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={`${sizeMap[size]} ${className}`}
			fill='none'
			viewBox='0 0 24 24'
			stroke='currentColor'
			aria-hidden='true'
			{...props}
		>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
		</svg>
	);
}

function ClockIcon({size = 'md', className = '', ...props}: IconProperties) {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={`${sizeMap[size]} ${className}`}
			fill='none'
			viewBox='0 0 24 24'
			stroke='currentColor'
			aria-hidden='true'
			{...props}
		>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
		</svg>
	);
}

function LocationIcon({size = 'md', className = '', ...props}: IconProperties) {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={`${sizeMap[size]} ${className}`}
			fill='none'
			viewBox='0 0 24 24'
			stroke='currentColor'
			aria-hidden='true'
			{...props}
		>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
		</svg>
	);
}

function ArrowRightIcon({size = 'md', className = '', ...props}: IconProperties) {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={`${sizeMap[size]} ${className}`}
			fill='none'
			viewBox='0 0 24 24'
			stroke='currentColor'
			aria-hidden='true'
			{...props}
		>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 8l4 4m0 0l-4 4m4-4H3' />
		</svg>
	);
}

function ArrowLeftIcon({size = 'md', className = '', ...props}: IconProperties) {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={`${sizeMap[size]} ${className}`}
			fill='none'
			viewBox='0 0 24 24'
			stroke='currentColor'
			aria-hidden='true'
			{...props}
		>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 16l-4-4m0 0l4-4m-4 4h18' />
		</svg>
	);
}

function ChevronRightIcon({size = 'md', className = '', ...props}: IconProperties) {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={`${sizeMap[size]} ${className}`}
			fill='none'
			viewBox='0 0 24 24'
			stroke='currentColor'
			aria-hidden='true'
			{...props}
		>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
		</svg>
	);
}

function UsersIcon({size = 'md', className = '', ...props}: IconProperties) {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={`${sizeMap[size]} ${className}`}
			fill='none'
			viewBox='0 0 24 24'
			stroke='currentColor'
			aria-hidden='true'
			{...props}
		>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
		</svg>
	);
}

function HeartIcon({size = 'md', className = '', ...props}: IconProperties) {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={`${sizeMap[size]} ${className}`}
			fill='none'
			viewBox='0 0 24 24'
			stroke='currentColor'
			aria-hidden='true'
			{...props}
		>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' />
		</svg>
	);
}

function StarIcon({size = 'md', className = '', ...props}: IconProperties) {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={`${sizeMap[size]} ${className}`}
			fill='none'
			viewBox='0 0 24 24'
			stroke='currentColor'
			aria-hidden='true'
			{...props}
		>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' />
		</svg>
	);
}

function EmailIcon({size = 'md', className = '', ...props}: IconProperties) {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={`${sizeMap[size]} ${className}`}
			fill='none'
			viewBox='0 0 24 24'
			stroke='currentColor'
			aria-hidden='true'
			{...props}
		>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
		</svg>
	);
}

function QuestionIcon({size = 'md', className = '', ...props}: IconProperties) {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={`${sizeMap[size]} ${className}`}
			fill='none'
			viewBox='0 0 24 24'
			stroke='currentColor'
			aria-hidden='true'
			{...props}
		>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
		</svg>
	);
}

function NewsIcon({size = 'md', className = '', ...props}: IconProperties) {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={`${sizeMap[size]} ${className}`}
			fill='none'
			viewBox='0 0 24 24'
			stroke='currentColor'
			aria-hidden='true'
			{...props}
		>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' />
		</svg>
	);
}

type BookmarkIconProperties = Omit<IconProperties, 'fill'> & {filled?: boolean};

function BookmarkIcon({size = 'md', className = '', filled = false, ...props}: BookmarkIconProperties) {
	if (filled) {
		return (
			<svg
				xmlns='http://www.w3.org/2000/svg'
				className={`${sizeMap[size]} ${className}`}
				viewBox='0 0 20 20'
				fill='currentColor'
				aria-hidden='true'
				{...props}
			>
				<path d='M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z' />
			</svg>
		);
	}

	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={`${sizeMap[size]} ${className}`}
			fill='none'
			viewBox='0 0 24 24'
			stroke='currentColor'
			aria-hidden='true'
			{...props}
		>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' />
		</svg>
	);
}

function GiftIcon({size = 'md', className = '', ...props}: IconProperties) {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={`${sizeMap[size]} ${className}`}
			fill='none'
			viewBox='0 0 24 24'
			stroke='currentColor'
			aria-hidden='true'
			{...props}
		>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7' />
		</svg>
	);
}

function MoneyIcon({size = 'md', className = '', ...props}: IconProperties) {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={`${sizeMap[size]} ${className}`}
			fill='none'
			viewBox='0 0 24 24'
			stroke='currentColor'
			aria-hidden='true'
			{...props}
		>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
		</svg>
	);
}

function CheckIcon({size = 'md', className = '', ...props}: IconProperties) {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={`${sizeMap[size]} ${className}`}
			fill='none'
			viewBox='0 0 24 24'
			stroke='currentColor'
			aria-hidden='true'
			{...props}
		>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
		</svg>
	);
}

function XIcon({size = 'md', className = '', ...props}: IconProperties) {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={`${sizeMap[size]} ${className}`}
			fill='none'
			viewBox='0 0 24 24'
			stroke='currentColor'
			aria-hidden='true'
			{...props}
		>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
		</svg>
	);
}

export {
	ArrowLeftIcon,
	ArrowRightIcon,
	BookmarkIcon,
	CalendarIcon,
	CheckIcon,
	ChevronRightIcon,
	ClockIcon,
	EmailIcon,
	GiftIcon,
	HeartIcon,
	LocationIcon,
	MoneyIcon,
	NewsIcon,
	QuestionIcon,
	StarIcon,
	UsersIcon,
	XIcon,
};

export type {IconProperties};
