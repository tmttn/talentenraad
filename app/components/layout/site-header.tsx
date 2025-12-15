'use client';

import Image from 'next/image';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect, useRef, useState} from 'react';

type NavigationLink = {
	text: string;
	url: string;
};

type SiteHeaderProperties = {
	logoUrl?: string;
	logoAlt?: string;
	navigationLinks?: NavigationLink[];
};

const defaultLinks: NavigationLink[] = [
	{url: '/', text: 'Home'},
	{url: '/kalender', text: 'Kalender'},
	{url: '/nieuws', text: 'Nieuws'},
	{url: '/over-ons', text: 'Over Ons'},
	{url: '/contact', text: 'Contact'},
];

export function SiteHeader({
	logoUrl = '/Logo.png',
	logoAlt = 'Talentenraad Logo',
	navigationLinks,
}: Readonly<SiteHeaderProperties>) {
	const pathname = usePathname();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isSkipLinkVisible, setIsSkipLinkVisible] = useState(false);
	const hadRecentTabPress = useRef(false);
	const links = navigationLinks ?? defaultLinks;

	// Track Tab keypresses to distinguish intentional focus from programmatic focus
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Tab') {
				hadRecentTabPress.current = true;
				// Reset after a short delay
				setTimeout(() => {
					hadRecentTabPress.current = false;
				}, 100);
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, []);

	return (
		<>
			{/* Skip to main content link - only visible when focused via Tab keypress */}
			<a
				href="#main-content"
				className={`skip-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary ${isSkipLinkVisible ? 'skip-link-visible' : ''}`}
				onFocus={() => {
					// Only show if focus came from a Tab keypress
					if (hadRecentTabPress.current) {
						setIsSkipLinkVisible(true);
					}
				}}
				onBlur={() => {
					setIsSkipLinkVisible(false);
				}}
			>
				Ga naar hoofdinhoud
			</a>
			<header role="banner" className="bg-white shadow-sm sticky top-0 z-50">
				<div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
					<Link href="/" className="flex items-center gap-4">
						<Image
							src={logoUrl}
							alt={logoAlt}
							width={120}
							height={80}
							className="h-14 w-auto"
							priority
						/>
					</Link>
					<nav role="navigation" aria-label="Hoofdnavigatie" className="hidden md:flex items-center gap-8">
						{links.map(item => (
							<Link
								key={item.url}
								href={item.url}
								className={`font-medium transition-colors hover:text-primary focus:text-primary focus:outline-none focus:underline underline-offset-4 ${
									pathname === item.url
										? 'text-primary'
										: 'text-gray-600'
								}`}
								aria-current={pathname === item.url ? 'page' : undefined}
							>
								{item.text}
							</Link>
						))}
					</nav>
					<button
						type="button"
						className="md:hidden p-2 text-gray-600 hover:text-primary focus:text-primary focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2 rounded-lg transition-colors"
						aria-label={isMenuOpen ? 'Menu sluiten' : 'Menu openen'}
						aria-expanded={isMenuOpen}
						aria-controls="mobile-menu"
						onClick={() => {
							setIsMenuOpen(!isMenuOpen);
						}}
					>
						{isMenuOpen
							? (
								<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							)
							: (
								<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
								</svg>
							)}
					</button>
				</div>

				{/* Mobile menu with animation */}
				<nav
					id="mobile-menu"
					aria-label="Mobiele navigatie"
					className={`md:hidden border-t border-gray-100 bg-white overflow-hidden transition-all duration-300 ease-in-out ${
						isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
					}`}
					aria-hidden={!isMenuOpen}
				>
					<div className="px-6 py-4 space-y-1">
						{links.map((item, index) => (
							<Link
								key={item.url}
								href={item.url}
								onClick={() => {
									setIsMenuOpen(false);
								}}
								className={`block py-3 px-4 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-focus focus:ring-inset ${
									pathname === item.url
										? 'bg-primary/10 text-primary'
										: 'text-gray-600 hover:bg-gray-50 hover:text-primary'
								}`}
								style={{
									transitionDelay: isMenuOpen ? `${index * 50}ms` : '0ms',
									transform: isMenuOpen ? 'translateX(0)' : 'translateX(-10px)',
									opacity: isMenuOpen ? 1 : 0,
								}}
								aria-current={pathname === item.url ? 'page' : undefined}
								tabIndex={isMenuOpen ? 0 : -1}
							>
								{item.text}
							</Link>
						))}
					</div>
				</nav>
			</header>
		</>
	);
}

export const SiteHeaderInfo = {
	name: 'SiteHeader',
	component: SiteHeader,
	inputs: [
		{
			name: 'logoUrl',
			type: 'file',
			allowedFileTypes: ['jpeg', 'jpg', 'png', 'svg', 'webp'],
			helperText: 'Logo afbeelding',
			defaultValue: '/Logo.png',
		},
		{
			name: 'logoAlt',
			type: 'string',
			helperText: 'Alt tekst voor het logo',
			defaultValue: 'Talentenraad Logo',
		},
		{
			name: 'navigationLinks',
			type: 'list',
			helperText: 'Navigatie links',
			subFields: [
				{
					name: 'text',
					type: 'string',
					helperText: 'Link tekst',
					required: true,
				},
				{
					name: 'url',
					type: 'url',
					helperText: 'Link URL',
					required: true,
				},
			],
			defaultValue: [
				{url: '/', text: 'Home'},
				{url: '/kalender', text: 'Kalender'},
				{url: '/nieuws', text: 'Nieuws'},
				{url: '/over-ons', text: 'Over Ons'},
				{url: '/contact', text: 'Contact'},
			],
		},
	],
};
