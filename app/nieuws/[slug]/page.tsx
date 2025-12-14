import {notFound} from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// eslint-disable-next-line n/prefer-global/process
const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY!;

type NieuwsItem = {
	id: string;
	data: {
		titel: string;
		datum: string;
		samenvatting: string;
		inhoud?: string;
		afbeelding?: string;
	};
};

// Dynamic rendering to avoid SSG issues with Builder.io components
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getNieuwsItem(slug: string): Promise<NieuwsItem | undefined> {
	try {
		const url = new URL('https://cdn.builder.io/api/v3/content/nieuws');
		url.searchParams.set('apiKey', BUILDER_API_KEY);
		url.searchParams.set('limit', '100');

		const response = await fetch(url.toString(), {next: {revalidate: 60}});
		const data = await response.json();

		if (!data.results) {
			return undefined;
		}

		// Find item by ID or by slug generated from title
		const item = data.results.find((item: NieuwsItem) => {
			const itemSlug = generateSlug(item.data.titel);
			return item.id === slug || itemSlug === slug;
		});

		return item;
	} catch (error) {
		console.error('Error fetching nieuws item:', error);
		return undefined;
	}
}

function generateSlug(title: string): string {
	return title
		.toLowerCase()
		.normalize('NFD')
		.replaceAll(/[\u0300-\u036F]/g, '') // Remove diacritics
		.replaceAll(/[^a-z\d\s-]/g, '') // Remove special chars
		.replaceAll(/\s+/g, '-') // Replace spaces with -
		.replaceAll(/-+/g, '-') // Replace multiple - with single -
		.trim();
}

function formatDate(dateString: string) {
	const date = new Date(dateString);
	return date.toLocaleDateString('nl-BE', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
}

export async function generateMetadata({params}: {params: Promise<{slug: string}>}) {
	const {slug} = await params;
	const item = await getNieuwsItem(slug);

	if (!item) {
		return {title: 'Nieuws niet gevonden'};
	}

	return {
		title: `${item.data.titel} - Talentenraad`,
		description: item.data.samenvatting,
	};
}

type PageProperties = {
	params: Promise<{slug: string}>;
};

export default async function NieuwsDetailPage({params}: Readonly<PageProperties>) {
	const {slug} = await params;
	const item = await getNieuwsItem(slug);

	if (!item) {
		notFound();
	}

	return (
		<article className='py-12 px-6'>
			<div className='max-w-3xl mx-auto'>
				{/* Breadcrumb */}
				<nav className='mb-8' aria-label='Breadcrumb'>
					<ol className='flex items-center gap-2 text-sm text-gray-500'>
						<li>
							<Link href='/' className='hover:text-[#ea247b]'>Home</Link>
						</li>
						<li>/</li>
						<li>
							<Link href='/nieuws' className='hover:text-[#ea247b]'>Nieuws</Link>
						</li>
						<li>/</li>
						<li className='text-gray-800 font-medium truncate max-w-[200px]'>
							{item.data.titel}
						</li>
					</ol>
				</nav>

				{/* Header */}
				<header className='mb-8'>
					<time className='text-sm text-[#ea247b] font-semibold flex items-center gap-2 mb-4'>
						<svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
						</svg>
						{formatDate(item.data.datum)}
					</time>
					<h1 className='text-3xl md:text-4xl font-bold text-gray-800 mb-4'>
						{item.data.titel}
					</h1>
					<p className='text-xl text-gray-600 leading-relaxed'>
						{item.data.samenvatting}
					</p>
				</header>

				{/* Featured Image */}
				{item.data.afbeelding && (
					<div className='relative aspect-video rounded-2xl overflow-hidden mb-8'>
						<Image
							src={item.data.afbeelding}
							alt={item.data.titel}
							fill
							className='object-cover'
							priority
						/>
					</div>
				)}

				{/* Content */}
				{item.data.inhoud && (
					<div
						className='prose prose-lg max-w-none prose-headings:text-gray-800 prose-headings:font-bold prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-p:text-gray-600 prose-p:mb-4 prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4 prose-li:mb-1 prose-a:text-[#ea247b] prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-800'
						dangerouslySetInnerHTML={{__html: item.data.inhoud}}
					/>
				)}

				{/* Back link */}
				<div className='mt-12 pt-8 border-t border-gray-200'>
					<Link
						href='/nieuws'
						className='inline-flex items-center gap-2 text-[#ea247b] font-semibold hover:underline'
					>
						<svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 16l-4-4m0 0l4-4m-4 4h18' />
						</svg>
						Terug naar nieuws
					</Link>
				</div>
			</div>
		</article>
	);
}
