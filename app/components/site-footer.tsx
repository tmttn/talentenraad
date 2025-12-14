'use client';

import Image from 'next/image';
import Link from 'next/link';

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

const socialIcons: Record<string, React.ReactNode> = {
	facebook: (
		<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
			<path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
		</svg>
	),
	instagram: (
		<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
			<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
		</svg>
	),
	twitter: (
		<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
			<path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
		</svg>
	),
	youtube: (
		<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
			<path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
		</svg>
	),
	linkedin: (
		<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
			<path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
		</svg>
	),
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
									className="text-sm text-[#ea247b] hover:underline focus:underline focus:outline-none"
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
											className="text-gray-600 hover:text-[#ea247b] focus:text-[#ea247b] focus:outline-none focus:underline transition-colors text-sm"
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
								className="text-gray-400 hover:text-[#ea247b] focus:text-[#ea247b] focus:outline-none focus:ring-2 focus:ring-[#ea247b] focus:ring-offset-2 rounded transition-colors"
								aria-label={`${social.platform} (opent in nieuw venster)`}
							>
								{socialIcons[social.platform]}
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
