'use client';

import type {ComponentType} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
	FacebookIcon,
	InstagramIcon,
	LinkedinIcon,
	TwitterIcon,
	YoutubeIcon,
	type IconProperties,
} from '@components/ui';
import {Icicles} from '@components/seasonal-decorations';

type NavigationLink = {
	text: string;
	url: string;
};

type NavigationGroup = {
	title: string;
	links: NavigationLink[];
};

type SocialLink = {
	platform: 'facebook' | 'instagram' | 'twitter' | 'youtube' | 'linkedin';
	url: string;
};

type SiteFooterProperties = {
	logoUrl?: string;
	tagline?: string;
	address?: {
		street?: string;
		city?: string;
	};
	email?: string;
	navigationGroups?: NavigationGroup[];
	socialLinks?: SocialLink[];
	copyrightText?: string;
};

const defaultNavigationGroups: NavigationGroup[] = [
	{
		title: 'Navigatie',
		links: [
			{url: '/', text: 'Home'},
			{url: '/kalender', text: 'Kalender'},
			{url: '/nieuws', text: 'Nieuws'},
		],
	},
	{
		title: 'Over Ons',
		links: [
			{url: '/over-ons', text: 'Het Team'},
			{url: '/contact', text: 'Contact'},
			{url: '/admin/login', text: 'Inloggen'},
		],
	},
	{
		title: 'School',
		links: [
			{url: 'https://talentenhuis.be', text: 'Het Talentenhuis'},
			{url: 'https://facebook.com/talentenhuis', text: 'Facebook'},
			{url: 'https://instagram.com/talentenhuis', text: 'Instagram'},
		],
	},
];

const defaultSocialLinks: SocialLink[] = [
	{platform: 'facebook', url: 'https://facebook.com/talentenhuis'},
	{platform: 'instagram', url: 'https://instagram.com/talentenhuis'},
];

const socialIconComponents: Record<string, ComponentType<IconProperties>> = {
	facebook: FacebookIcon,
	instagram: InstagramIcon,
	linkedin: LinkedinIcon,
	twitter: TwitterIcon,
	youtube: YoutubeIcon,
};

export function SiteFooter({
	logoUrl = '/Logo.png',
	tagline = 'De ouderraad van Het Talentenhuis\nSchool met een hart voor ieder kind',
	address = {street: 'Zonhoevestraat 32', city: '3740 Bilzen-Hoeselt'},
	email = 'voorzitterouderraad@talentenhuis.be',
	navigationGroups,
	socialLinks,
	copyrightText = 'Talentenraad Het Talentenhuis. Alle rechten voorbehouden.',
}: Readonly<SiteFooterProperties>) {
	const groups = navigationGroups ?? defaultNavigationGroups;
	const socials = socialLinks ?? defaultSocialLinks;

	return (
		<footer role="contentinfo" className="bg-gray-100">
			{/* Seasonal icicles decoration */}
			<Icicles />
			<div className="max-w-[1280px] mx-auto px-6 py-12">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
					{/* Logo and info */}
					<div className="md:col-span-1">
						<Link href="/" className="block mb-4">
							<Image
								src={logoUrl}
								alt="Talentenraad Logo"
								width={150}
								height={100}
								className="h-16 w-auto"
							/>
						</Link>
						<p className="text-gray-600 text-sm whitespace-pre-line">
							{tagline}
						</p>
						{address && (
							<div className="mt-4 text-sm text-gray-500">
								{address.street && <p>{address.street}</p>}
								{address.city && <p>{address.city}</p>}
							</div>
						)}
						{email && (
							<div className="mt-4">
								<a
									href={`mailto:${email}`}
									className="text-sm text-primary hover:underline focus:underline focus:outline-none"
								>
									{email}
								</a>
							</div>
						)}
					</div>

					{/* Navigation columns */}
					{groups.map((group, index) => (
						<nav key={group.title} aria-labelledby={`footer-nav-${index}`}>
							<h3 id={`footer-nav-${index}`} className="font-bold text-gray-800 mb-4">{group.title}</h3>
							<ul className="space-y-2">
								{group.links.map(link => (
									<li key={link.url}>
										<Link
											href={link.url}
											className="text-gray-600 hover:text-primary focus:text-primary focus:outline-none focus:underline transition-colors text-sm"
											{...(link.url.startsWith('http')
												? {
													target: '_blank',
													rel: 'noopener noreferrer',
													'aria-label': `${link.text} (opent in nieuw venster)`,
												}
												: {})}
										>
											{link.text}
											{link.url.startsWith('http') && (
												<span className="sr-only"> (opent in nieuw venster)</span>
											)}
										</Link>
									</li>
								))}
							</ul>
						</nav>
					))}
				</div>

				{/* Bottom bar */}
				<div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
					<p className="text-gray-500 text-sm">
						© {new Date().getFullYear()} {copyrightText}
					</p>
					<div className="flex gap-4">
						{socials.map(social => (
							<a
								key={social.platform}
								href={social.url}
								target="_blank"
								rel="noopener noreferrer"
								className="text-gray-400 hover:text-primary focus:text-primary focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2 rounded transition-colors"
								aria-label={`${social.platform} (opent in nieuw venster)`}
							>
								{(() => {
									const IconComponent = socialIconComponents[social.platform];
									return IconComponent ? <IconComponent size='md' /> : null;
								})()}
							</a>
						))}
					</div>
				</div>
			</div>
		</footer>
	);
}

export const SiteFooterInfo = {
	name: 'SiteFooter',
	component: SiteFooter,
	inputs: [
		{
			name: 'logoUrl',
			type: 'file',
			allowedFileTypes: ['jpeg', 'jpg', 'png', 'svg', 'webp'],
			helperText: 'Logo afbeelding',
			defaultValue: '/Logo.png',
		},
		{
			name: 'tagline',
			type: 'longText',
			helperText: 'Korte beschrijving onder het logo',
			defaultValue: 'De ouderraad van Het Talentenhuis\nSchool met een hart voor ieder kind',
		},
		{
			name: 'address',
			type: 'object',
			helperText: 'Adres informatie',
			subFields: [
				{
					name: 'street',
					type: 'string',
					helperText: 'Straat en huisnummer',
				},
				{
					name: 'city',
					type: 'string',
					helperText: 'Postcode en plaats',
				},
			],
			defaultValue: {street: 'Zonhoevestraat 32', city: '3740 Bilzen-Hoeselt'},
		},
		{
			name: 'email',
			type: 'email',
			helperText: 'Contact e-mailadres',
			defaultValue: 'voorzitterouderraad@talentenhuis.be',
		},
		{
			name: 'navigationGroups',
			type: 'list',
			helperText: 'Navigatie groepen',
			subFields: [
				{
					name: 'title',
					type: 'string',
					helperText: 'Groep titel',
					required: true,
				},
				{
					name: 'links',
					type: 'list',
					helperText: 'Links in deze groep',
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
				},
			],
		},
		{
			name: 'socialLinks',
			type: 'list',
			helperText: 'Sociale media links',
			subFields: [
				{
					name: 'platform',
					type: 'string',
					enum: ['facebook', 'instagram', 'twitter', 'youtube', 'linkedin'],
					helperText: 'Social media platform',
					required: true,
				},
				{
					name: 'url',
					type: 'url',
					helperText: 'Profiel URL',
					required: true,
				},
			],
		},
		{
			name: 'copyrightText',
			type: 'string',
			helperText: 'Copyright tekst (jaar wordt automatisch toegevoegd)',
			defaultValue: 'Talentenraad Het Talentenhuis. Alle rechten voorbehouden.',
		},
	],
};
