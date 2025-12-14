'use client';

import Image from 'next/image';
import Link from 'next/link';

const footerNavigation = [
	{
		title: 'Navigatie',
		links: [
			{url: '/', text: 'Home'},
			{url: '/activiteiten', text: 'Activiteiten'},
			{url: '/nieuws', text: 'Nieuws'},
			{url: '/kalender', text: 'Kalender'},
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

export function SiteFooter() {
	return (
		<footer role='contentinfo' className='bg-gray-100'>
			<div className='max-w-[1280px] mx-auto px-6 py-12'>
				<div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
					{/* Logo and info */}
					<div className='md:col-span-1'>
						<Link href='/' className='block mb-4'>
							<Image
								src='/Logo.png'
								alt='Talentenraad Logo'
								width={150}
								height={100}
								className='h-16 w-auto'
							/>
						</Link>
						<p className='text-gray-600 text-sm'>
							De ouderraad van Het Talentenhuis<br />
							School met een hart voor ieder kind
						</p>
						<div className='mt-4 text-sm text-gray-500'>
							<p>Zonhoevestraat 32</p>
							<p>3740 Bilzen-Hoeselt</p>
						</div>
						<div className='mt-4'>
							<a
								href='mailto:voorzitterouderraad@talentenhuis.be'
								className='text-sm text-[#ea247b] hover:underline focus:underline focus:outline-none'
							>
								voorzitterouderraad@talentenhuis.be
							</a>
						</div>
					</div>

					{/* Navigation columns */}
					{footerNavigation.map((group, index) => (
						<nav key={group.title} aria-labelledby={`footer-nav-${index}`}>
							<h3 id={`footer-nav-${index}`} className='font-bold text-gray-800 mb-4'>{group.title}</h3>
							<ul className='space-y-2'>
								{group.links.map(link => (
									<li key={link.url}>
										<Link
											href={link.url}
											className='text-gray-600 hover:text-[#ea247b] focus:text-[#ea247b] focus:outline-none focus:underline transition-colors text-sm'
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
												<span className='sr-only'> (opent in nieuw venster)</span>
											)}
										</Link>
									</li>
								))}
							</ul>
						</nav>
					))}
				</div>

				{/* Bottom bar */}
				<div className='border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4'>
					<p className='text-gray-500 text-sm'>
						© {new Date().getFullYear()} Talentenraad Het Talentenhuis. Alle rechten voorbehouden.
					</p>
					<div className='flex gap-4'>
						<a
							href='https://facebook.com/talentenhuis'
							target='_blank'
							rel='noopener noreferrer'
							className='text-gray-400 hover:text-[#ea247b] focus:text-[#ea247b] focus:outline-none focus:ring-2 focus:ring-[#ea247b] focus:ring-offset-2 rounded transition-colors'
							aria-label='Facebook (opent in nieuw venster)'
						>
							<svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
								<path d='M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z' />
							</svg>
						</a>
						<a
							href='https://instagram.com/talentenhuis'
							target='_blank'
							rel='noopener noreferrer'
							className='text-gray-400 hover:text-[#ea247b] focus:text-[#ea247b] focus:outline-none focus:ring-2 focus:ring-[#ea247b] focus:ring-offset-2 rounded transition-colors'
							aria-label='Instagram (opent in nieuw venster)'
						>
							<svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
								<path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' />
							</svg>
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
}
