/**
 * Centralized SVG icon components and paths
 * This file contains all the SVG icon paths used throughout the application
 */

import {type ComponentProps} from 'react';

type SvgProps = ComponentProps<'svg'>;

// Default SVG wrapper component
function SvgIcon({
	children,
	className = 'h-5 w-5',
	viewBox = '0 0 24 24',
	fill = 'none',
	stroke = 'currentColor',
	...props
}: SvgProps) {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			viewBox={viewBox}
			fill={fill}
			stroke={stroke}
			aria-hidden='true'
			{...props}
		>
			{children}
		</svg>
	);
}

/* eslint-disable @stylistic/max-len */

// Icon paths - organized by category

// Navigation & Actions
export const arrowRightPath = 'M17 8l4 4m0 0l-4 4m4-4H3';
export const chevronDownPath = 'M19 9l-7 7-7-7';
export const chevronRightPath = 'M9 5l7 7-7 7';

// Communication
export const emailPath = 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z';
export const phonePath = 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z';
export const chatPath = 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z';
export const sendPath = 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8';

// Date & Time
export const calendarPath = 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z';
export const clockPath = 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';

// Location
export const locationPath = 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z';
export const locationDotPath = 'M15 11a3 3 0 11-6 0 3 3 0 016 0z';

// People & Social
export const usersPath = 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z';
export const userPath = 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z';
export const teamPath = usersPath; // Alias

// Status & Feedback
export const successPath = 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
export const errorPath = 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z';
export const infoPath = 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
export const warningPath = 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
export const questionPath = 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';

// Objects & Items
export const heartPath = 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z';
export const starPath = 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z';
export const giftPath = 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7';
export const moneyPath = 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
export const schoolPath1 = 'M12 14l9-5-9-5-9 5 9 5z';
export const schoolPath2 = 'M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z';
export const newsPath = 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z';
export const pinnedPath = 'M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5zm7 14l-5-2.5V5h10v9.5L12 17z';

// Loading
export const spinnerPath = 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z';

// Social Media
export const facebookPath = 'M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z';
export const instagramPath = 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z';

/* eslint-enable @stylistic/max-len */

// Icon Components

export function ArrowRightIcon(props: SvgProps) {
	return (
		<SvgIcon {...props}>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d={arrowRightPath} />
		</SvgIcon>
	);
}

export function ChevronDownIcon(props: SvgProps) {
	return (
		<SvgIcon {...props}>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d={chevronDownPath} />
		</SvgIcon>
	);
}

export function ChevronRightIcon(props: SvgProps) {
	return (
		<SvgIcon {...props}>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d={chevronRightPath} />
		</SvgIcon>
	);
}

export function EmailIcon(props: SvgProps) {
	return (
		<SvgIcon {...props}>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d={emailPath} />
		</SvgIcon>
	);
}

export function CalendarIcon(props: SvgProps) {
	return (
		<SvgIcon {...props}>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d={calendarPath} />
		</SvgIcon>
	);
}

export function ClockIcon(props: SvgProps) {
	return (
		<SvgIcon {...props}>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d={clockPath} />
		</SvgIcon>
	);
}

export function LocationIcon(props: SvgProps) {
	return (
		<SvgIcon {...props}>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d={locationPath} />
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d={locationDotPath} />
		</SvgIcon>
	);
}

export function UsersIcon(props: SvgProps) {
	return (
		<SvgIcon {...props}>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d={usersPath} />
		</SvgIcon>
	);
}

export function HeartIcon(props: SvgProps) {
	return (
		<SvgIcon {...props}>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d={heartPath} />
		</SvgIcon>
	);
}

export function StarIcon(props: SvgProps) {
	return (
		<SvgIcon {...props}>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d={starPath} />
		</SvgIcon>
	);
}

export function GiftIcon(props: SvgProps) {
	return (
		<SvgIcon {...props}>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d={giftPath} />
		</SvgIcon>
	);
}

export function MoneyIcon(props: SvgProps) {
	return (
		<SvgIcon {...props}>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d={moneyPath} />
		</SvgIcon>
	);
}

export function SuccessIcon(props: SvgProps) {
	return (
		<SvgIcon {...props}>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d={successPath} />
		</SvgIcon>
	);
}

export function ErrorIcon(props: SvgProps) {
	return (
		<SvgIcon viewBox='0 0 20 20' fill='currentColor' stroke='none' {...props}>
			<path fillRule='evenodd' d={errorPath} clipRule='evenodd' />
		</SvgIcon>
	);
}

export function InfoIcon(props: SvgProps) {
	return (
		<SvgIcon {...props}>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d={infoPath} />
		</SvgIcon>
	);
}

export function WarningIcon(props: SvgProps) {
	return (
		<SvgIcon {...props}>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d={warningPath} />
		</SvgIcon>
	);
}

export function QuestionIcon(props: SvgProps) {
	return (
		<SvgIcon {...props}>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d={questionPath} />
		</SvgIcon>
	);
}

export function NewsIcon(props: SvgProps) {
	return (
		<SvgIcon {...props}>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d={newsPath} />
		</SvgIcon>
	);
}

export function SendIcon(props: SvgProps) {
	return (
		<SvgIcon {...props}>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d={sendPath} />
		</SvgIcon>
	);
}

export function SpinnerIcon(props: SvgProps) {
	return (
		<SvgIcon fill='none' stroke='none' {...props}>
			<circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
			<path className='opacity-75' fill='currentColor' d={spinnerPath} />
		</SvgIcon>
	);
}

export function FacebookIcon(props: SvgProps) {
	return (
		<SvgIcon fill='currentColor' stroke='none' {...props}>
			<path d={facebookPath} />
		</SvgIcon>
	);
}

export function InstagramIcon(props: SvgProps) {
	return (
		<SvgIcon fill='currentColor' stroke='none' {...props}>
			<path d={instagramPath} />
		</SvgIcon>
	);
}

export function SchoolIcon(props: SvgProps) {
	return (
		<SvgIcon {...props}>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d={schoolPath1} />
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d={schoolPath2} />
		</SvgIcon>
	);
}

export function PinnedIcon(props: SvgProps) {
	return (
		<SvgIcon viewBox='0 0 24 24' fill='currentColor' stroke='none' {...props}>
			<path d={pinnedPath} />
		</SvgIcon>
	);
}
