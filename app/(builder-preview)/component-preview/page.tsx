import Link from 'next/link';
import type {Metadata} from 'next';

export const metadata: Metadata = {
	title: 'Component Preview Index - Talentenraad',
	description: 'List of all available Builder.io custom components',
	robots: 'noindex, nofollow',
};

// All available components with their preview URLs
const components = [
	{name: 'Hero', slug: 'hero', category: 'Marketing'},
	{name: 'CTA Banner', slug: 'cta-banner', category: 'Marketing'},
	{name: 'Announcement Banner', slug: 'announcement-banner', category: 'Marketing'},
	{name: 'Newsletter Signup', slug: 'newsletter-signup', category: 'Marketing'},
	{name: 'Unified CTA', slug: 'unified-cta', category: 'Marketing'},
	{name: 'Info Card', slug: 'info-card', category: 'Info'},
	{name: 'Feature Grid', slug: 'feature-grid', category: 'Info'},
	{name: 'Activities List', slug: 'activities-list', category: 'Activiteiten'},
	{name: 'Activities Archive', slug: 'activities-archive', category: 'Activiteiten'},
	{name: 'Calendar Section', slug: 'calendar-section', category: 'Activiteiten'},
	{name: 'Event Card', slug: 'event-card', category: 'Activiteiten'},
	{name: 'News List', slug: 'news-list', category: 'Nieuws'},
	{name: 'News Card', slug: 'news-card', category: 'Nieuws'},
	{name: 'Team Grid', slug: 'team-grid', category: 'Team'},
	{name: 'Team Member', slug: 'team-member', category: 'Team'},
	{name: 'Contact Form', slug: 'contact-form', category: 'Contact'},
	{name: 'FAQ', slug: 'faq', category: 'FAQ'},
	{name: 'Homepage Dashboard', slug: 'homepage-dashboard', category: 'Dashboard'},
	{name: 'Section', slug: 'section', category: 'Layout'},
	{name: 'Typography', slug: 'typography', category: 'UI'},
	{name: 'CTA Button', slug: 'cta-button', category: 'UI'},
	{name: 'Decoration', slug: 'decoration', category: 'Decoratie'},
	{name: 'Divider', slug: 'divider', category: 'Decoratie'},
	{name: 'Site Header', slug: 'site-header', category: 'Layout'},
	{name: 'Site Footer', slug: 'site-footer', category: 'Layout'},
];

// Group components by category
const groupedComponents: Record<string, typeof components> = {};
for (const component of components) {
	groupedComponents[component.category] ||= [];
	groupedComponents[component.category].push(component);
}

export default function ComponentPreviewIndexPage() {
	return (
		<div className='min-h-screen bg-gray-50 py-12 px-4'>
			<div className='max-w-4xl mx-auto'>
				<h1 className='text-3xl font-bold text-gray-900 mb-2'>
					Builder.io Component Previews
				</h1>
				<p className='text-gray-600 mb-8'>
					Selecteer een component om te bekijken in isolatie. Deze pagina&apos;s kunnen gebruikt worden
					als preview URL&apos;s in Builder.io.
				</p>

				<div className='bg-white rounded-button shadow-subtle border border-gray-200 p-6 mb-8'>
					<h2 className='text-lg font-semibold text-gray-800 mb-2'>Preview URL Formaat</h2>
					<code className='text-sm bg-gray-100 px-3 py-2 rounded block'>
						https://your-site.com/component-preview/[component-slug]
					</code>
					<p className='text-sm text-gray-500 mt-2'>
						Query parameters kunnen worden gebruikt om props te overschrijven.
					</p>
				</div>

				{Object.entries(groupedComponents).map(([category, categoryComponents]) => (
					<div key={category} className='mb-8'>
						<h2 className='text-xl font-semibold text-gray-800 mb-4 border-b pb-2'>
							{category}
						</h2>
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
							{categoryComponents.map(component => (
								<Link
									key={component.slug}
									href={`/component-preview/${component.slug}`}
									className='block p-4 bg-white rounded-button border border-gray-200 hover:border-primary hover:shadow-base transition-all'
								>
									<h3 className='font-medium text-gray-900'>{component.name}</h3>
									<p className='text-sm text-gray-500 mt-1'>/component-preview/{component.slug}</p>
								</Link>
							))}
						</div>
					</div>
				))}

				<div className='bg-blue-50 rounded-button p-6 mt-8'>
					<h2 className='text-lg font-semibold text-blue-900 mb-2'>
						Builder.io Configuratie
					</h2>
					<p className='text-blue-800 text-sm mb-4'>
						Om deze preview URLs te gebruiken in Builder.io:
					</p>
					<ol className='text-blue-800 text-sm space-y-2 list-decimal list-inside'>
						<li>Ga naar Builder.io &rarr; Models</li>
						<li>Selecteer of maak een section model voor het component</li>
						<li>Stel de Preview URL in naar de corresponderende preview pagina</li>
						<li>Bijvoorbeeld: voor Hero, gebruik /component-preview/hero</li>
					</ol>
				</div>
			</div>
		</div>
	);
}
