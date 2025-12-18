/**
 * Reusable skeleton components for loading states
 * Use with Next.js loading.tsx files for non-blocking page renders
 */

// eslint-disable-next-line import-x/extensions
import {gradients} from '@/styles/tokens';

type SkeletonWrapperProperties = {
	label: string;
	children: React.ReactNode;
};

function SkeletonWrapper({label, children}: Readonly<SkeletonWrapperProperties>) {
	return (
		<div aria-busy='true' aria-label={label}>
			{children}
			<span className='sr-only' role='status' aria-live='polite'>
				Bezig met laden...
			</span>
		</div>
	);
}

// Page header with title and optional action button
export function PageHeaderSkeleton({showButton = true}: {showButton?: boolean}) {
	return (
		<div className='flex justify-between items-center mb-8 animate-pulse'>
			<div className='h-9 bg-gray-200 rounded w-48' />
			{showButton && <div className='h-12 bg-gray-200 rounded w-36' />}
		</div>
	);
}

// Table with configurable row count
export function TableSkeleton({rows = 5}: {rows?: number}) {
	return (
		<div className='bg-white rounded-xl shadow-md overflow-hidden animate-pulse'>
			{/* Search/filter bar */}
			<div className='p-4 border-b border-gray-200 flex flex-wrap gap-4'>
				<div className='h-10 bg-gray-200 rounded w-64' />
				<div className='h-10 bg-gray-200 rounded w-40' />
			</div>
			{/* Table rows */}
			<div className='divide-y divide-gray-100'>
				{Array.from({length: rows}).map((_, index) => (
					<div key={index} className='px-6 py-4'>
						<div className='flex items-center gap-4'>
							<div className='h-4 bg-gray-200 rounded w-4' />
							<div className='h-4 bg-gray-200 rounded flex-1 max-w-xs' />
							<div className='h-4 bg-gray-200 rounded w-24' />
							<div className='h-6 bg-gray-200 rounded-full w-16' />
							<div className='h-8 bg-gray-200 rounded w-20 ml-auto' />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

// Grid of cards
export function CardGridSkeleton({cards = 3}: {cards?: number}) {
	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse'>
			{Array.from({length: cards}).map((_, index) => (
				<div key={index} className='bg-white rounded-xl shadow-md p-5'>
					<div className='h-5 bg-gray-200 rounded w-3/4 mb-3' />
					<div className='h-4 bg-gray-200 rounded w-1/2 mb-4' />
					<div className='flex gap-2'>
						<div className='h-8 bg-gray-200 rounded flex-1' />
						<div className='h-8 bg-gray-200 rounded w-8' />
					</div>
				</div>
			))}
		</div>
	);
}

// Form fields
export function FormSkeleton({fields = 5}: {fields?: number}) {
	return (
		<div className='bg-white rounded-xl shadow-md p-6 max-w-2xl animate-pulse'>
			<div className='space-y-6'>
				{Array.from({length: fields}).map((_, index) => (
					<div key={index}>
						<div className='h-4 bg-gray-200 rounded w-24 mb-2' />
						<div className='h-10 bg-gray-200 rounded w-full' />
					</div>
				))}
				{/* Rich text editor placeholder */}
				<div>
					<div className='h-4 bg-gray-200 rounded w-24 mb-2' />
					<div className='h-48 bg-gray-200 rounded w-full' />
				</div>
				{/* Submit button */}
				<div className='flex gap-3 pt-4'>
					<div className='h-12 bg-gray-200 rounded w-32' />
					<div className='h-12 bg-gray-200 rounded w-24' />
				</div>
			</div>
		</div>
	);
}

// Dashboard statistics cards
export function StatsCardsSkeleton({count = 4}: {count?: number}) {
	return (
		<div className='grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 animate-pulse'>
			{Array.from({length: count}).map((_, index) => (
				<div key={index} className='bg-white p-4 sm:p-5 rounded-xl shadow-md'>
					<div className='flex items-center justify-between mb-2'>
						<div className='w-5 h-5 bg-gray-200 rounded' />
						<div className='h-4 bg-gray-200 rounded w-12' />
					</div>
					<div className='h-8 bg-gray-200 rounded w-12 mb-1' />
					<div className='h-3 bg-gray-200 rounded w-16' />
				</div>
			))}
		</div>
	);
}

// Content list (for dashboard sections)
export function ContentListSkeleton({items = 3}: {items?: number}) {
	return (
		<div className='bg-white rounded-xl shadow-md overflow-hidden animate-pulse'>
			<div className='p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between'>
				<div className='h-5 bg-gray-200 rounded w-40' />
				<div className='h-4 bg-gray-200 rounded w-24' />
			</div>
			<div className='divide-y divide-gray-50'>
				{Array.from({length: items}).map((_, index) => (
					<div key={index} className='p-3 sm:p-4'>
						<div className='flex items-start justify-between gap-2'>
							<div className='flex-1'>
								<div className='h-4 bg-gray-200 rounded w-3/4 mb-2' />
								<div className='h-3 bg-gray-200 rounded w-1/2' />
							</div>
							<div className='h-4 bg-gray-200 rounded w-16' />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

// Back link + detail content
export function DetailPageSkeleton() {
	return (
		<div className='animate-pulse'>
			{/* Back link */}
			<div className='h-5 bg-gray-200 rounded w-32 mb-6' />
			{/* Content card */}
			<div className='bg-white rounded-xl shadow-md p-6'>
				<div className='h-7 bg-gray-200 rounded w-2/3 mb-4' />
				<div className='space-y-3'>
					<div className='h-4 bg-gray-200 rounded w-full' />
					<div className='h-4 bg-gray-200 rounded w-full' />
					<div className='h-4 bg-gray-200 rounded w-3/4' />
				</div>
				<div className='mt-6 pt-4 border-t border-gray-100'>
					<div className='h-4 bg-gray-200 rounded w-48' />
				</div>
			</div>
		</div>
	);
}

// Public page hero section - matches Hero component with gradient background
export function HeroSkeleton({size = 'medium'}: {size?: 'compact' | 'small' | 'medium' | 'large'}) {
	const sizeClasses = {
		compact: 'py-12 md:py-16',
		small: 'py-16 md:py-20',
		medium: 'py-20 md:py-28',
		large: 'py-28 md:py-36',
	};

	return (
		<section
			className={`relative overflow-hidden ${sizeClasses[size]}`}
			style={{background: gradients.primary}}
		>
			{/* Decorative elements matching Hero */}
			<div className='absolute inset-0 overflow-hidden pointer-events-none' aria-hidden='true'>
				<div className='absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full' />
				<div className='absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-white/5 rounded-full' />
			</div>
			{/* Content skeleton */}
			<div className='relative z-10 max-w-4xl mx-auto px-6 text-center animate-pulse'>
				<div className='h-10 md:h-12 bg-white/20 rounded w-3/4 mx-auto mb-4' />
				<div className='h-5 md:h-6 bg-white/15 rounded w-1/2 mx-auto mb-8' />
				<div className='h-12 bg-white/20 rounded-lg w-40 mx-auto' />
			</div>
		</section>
	);
}

// InfoCard skeleton - matches centered card with icon, title, description
export function InfoCardSkeleton() {
	return (
		<div className='p-8 bg-white shadow-md text-center animate-pulse'>
			{/* Icon circle */}
			<div className='w-16 h-16 bg-gray-200 rounded-full mx-auto mb-6' />
			{/* Title */}
			<div className='h-6 bg-gray-200 rounded w-2/3 mx-auto mb-3' />
			{/* Description - 2 lines */}
			<div className='space-y-2'>
				<div className='h-4 bg-gray-200 rounded w-full' />
				<div className='h-4 bg-gray-200 rounded w-4/5 mx-auto' />
			</div>
			{/* Optional link */}
			<div className='h-8 bg-gray-200 rounded w-24 mx-auto mt-4' />
		</div>
	);
}

// InfoCard grid skeleton - shows multiple InfoCards in a grid
export function InfoCardGridSkeleton({cards = 3}: {cards?: number}) {
	return (
		<div className='py-12 px-6'>
			<div className='max-w-6xl mx-auto'>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{Array.from({length: cards}).map((_, index) => (
						<InfoCardSkeleton key={index} />
					))}
				</div>
			</div>
		</div>
	);
}

// HomepageDashboard skeleton - matches 2-column layout with colored headers
export function HomepageDashboardSkeleton() {
	return (
		<section className='py-12 px-6 bg-gray-50' aria-busy='true' aria-label='Dashboard wordt geladen'>
			<div className='max-w-6xl mx-auto'>
				<div className='grid md:grid-cols-2 gap-6 animate-pulse'>
					{/* Activiteiten card */}
					<div className='bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col'>
						<div className='bg-gradient-to-r from-brand-primary-500 to-brand-primary-600 px-6 py-3'>
							<div className='h-5 bg-white/30 rounded w-40' />
						</div>
						<div className='p-4 flex-grow'>
							<div className='space-y-3'>
								{[1, 2, 3].map(i => (
									<div key={i} className='flex items-center gap-3 p-2'>
										<div className='w-12 h-12 bg-gray-200 rounded-lg' />
										<div className='flex-grow'>
											<div className='h-4 bg-gray-200 rounded w-3/4 mb-1' />
											<div className='h-3 bg-gray-200 rounded w-1/2' />
										</div>
										<div className='h-5 bg-gray-200 rounded-full w-16' />
									</div>
								))}
							</div>
						</div>
						<div className='px-6 pb-4 border-t border-gray-100 pt-3'>
							<div className='h-8 bg-gray-200 rounded w-40' />
						</div>
					</div>

					{/* Nieuws card */}
					<div className='bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col'>
						<div className='bg-gradient-to-r from-brand-secondary-400 to-brand-secondary-500 px-6 py-3'>
							<div className='h-5 bg-white/30 rounded w-32' />
						</div>
						<div className='p-4 flex-grow'>
							<div className='space-y-3'>
								{[1, 2, 3].map(i => (
									<div key={i} className='p-2'>
										<div className='h-4 bg-gray-200 rounded w-3/4 mb-1' />
										<div className='h-3 bg-gray-200 rounded w-1/3 mb-2' />
										<div className='h-3 bg-gray-200 rounded w-full' />
									</div>
								))}
							</div>
						</div>
						<div className='px-6 pb-4 border-t border-gray-100 pt-3'>
							<div className='h-8 bg-gray-200 rounded w-36' />
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

// Generic section skeleton for Builder pages
export function SectionsSkeleton({count = 2}: {count?: number}) {
	return (
		<div className='space-y-12 py-8 animate-pulse'>
			{Array.from({length: count}).map((_, index) => (
				<div key={index} className='py-12 px-6'>
					<div className='max-w-6xl mx-auto'>
						{/* Section could be InfoCards, text, or other content */}
						<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
							{[1, 2, 3].map(i => (
								<div key={i} className='p-8 bg-white shadow-md text-center'>
									<div className='w-16 h-16 bg-gray-200 rounded-full mx-auto mb-6' />
									<div className='h-6 bg-gray-200 rounded w-2/3 mx-auto mb-3' />
									<div className='h-4 bg-gray-200 rounded w-full mb-2' />
									<div className='h-4 bg-gray-200 rounded w-4/5 mx-auto' />
								</div>
							))}
						</div>
					</div>
				</div>
			))}
		</div>
	);
}

// Article/News detail page
export function ArticleSkeleton() {
	return (
		<SkeletonWrapper label='Artikel wordt geladen'>
			<div className='py-16 px-6 animate-pulse'>
				<article className='max-w-3xl mx-auto'>
					{/* Header */}
					<div className='h-10 bg-gray-200 rounded w-3/4 mb-4' />
					<div className='flex gap-4 mb-8'>
						<div className='h-4 bg-gray-200 rounded w-32' />
						<div className='h-4 bg-gray-200 rounded w-24' />
					</div>
					{/* Featured image */}
					<div className='h-64 bg-gray-200 rounded-xl mb-8' />
					{/* Content */}
					<div className='space-y-4'>
						<div className='h-4 bg-gray-200 rounded w-full' />
						<div className='h-4 bg-gray-200 rounded w-full' />
						<div className='h-4 bg-gray-200 rounded w-3/4' />
						<div className='h-4 bg-gray-200 rounded w-full' />
						<div className='h-4 bg-gray-200 rounded w-5/6' />
					</div>
				</article>
			</div>
		</SkeletonWrapper>
	);
}

// Activity detail page
export function ActivityDetailSkeleton() {
	return (
		<SkeletonWrapper label='Activiteit wordt geladen'>
			<div className='py-16 px-6 animate-pulse'>
				<div className='max-w-4xl mx-auto'>
					{/* Header */}
					<div className='h-10 bg-gray-200 rounded w-2/3 mb-4' />
					{/* Meta info */}
					<div className='flex flex-wrap gap-4 mb-8'>
						<div className='h-6 bg-gray-200 rounded w-32' />
						<div className='h-6 bg-gray-200 rounded w-24' />
						<div className='h-6 bg-gray-200 rounded w-40' />
					</div>
					{/* Image */}
					<div className='h-80 bg-gray-200 rounded-xl mb-8' />
					{/* Content */}
					<div className='space-y-4'>
						<div className='h-4 bg-gray-200 rounded w-full' />
						<div className='h-4 bg-gray-200 rounded w-full' />
						<div className='h-4 bg-gray-200 rounded w-2/3' />
					</div>
				</div>
			</div>
		</SkeletonWrapper>
	);
}

// Submissions with tabs
export function SubmissionsPageSkeleton() {
	return (
		<div className='animate-pulse'>
			<PageHeaderSkeleton showButton={false} />
			{/* Tabs */}
			<div className='flex gap-4 mb-6'>
				<div className='h-10 bg-gray-200 rounded w-32' />
				<div className='h-10 bg-gray-200 rounded w-32' />
			</div>
			{/* Bulk actions */}
			<div className='flex gap-2 mb-4'>
				<div className='h-9 bg-gray-200 rounded w-28' />
				<div className='h-9 bg-gray-200 rounded w-28' />
				<div className='h-9 bg-gray-200 rounded w-28' />
			</div>
			<TableSkeleton rows={8} />
		</div>
	);
}

// Settings/Decorations page
export function SettingsSkeleton() {
	return (
		<div className='animate-pulse'>
			<PageHeaderSkeleton showButton={false} />
			<div className='bg-white rounded-xl shadow-md p-6 max-w-xl'>
				<div className='space-y-6'>
					{/* Toggle */}
					<div className='flex items-center justify-between'>
						<div>
							<div className='h-5 bg-gray-200 rounded w-40 mb-1' />
							<div className='h-4 bg-gray-200 rounded w-64' />
						</div>
						<div className='h-6 bg-gray-200 rounded-full w-12' />
					</div>
					{/* Date inputs */}
					<div className='grid grid-cols-2 gap-4'>
						<div>
							<div className='h-4 bg-gray-200 rounded w-24 mb-2' />
							<div className='h-10 bg-gray-200 rounded w-full' />
						</div>
						<div>
							<div className='h-4 bg-gray-200 rounded w-24 mb-2' />
							<div className='h-10 bg-gray-200 rounded w-full' />
						</div>
					</div>
					{/* Submit */}
					<div className='h-10 bg-gray-200 rounded w-32' />
				</div>
			</div>
		</div>
	);
}

// Dashboard skeleton - only the data-dependent content (header/quick create shown immediately)
export function DashboardSkeleton() {
	return (
		<SkeletonWrapper label='Dashboard wordt geladen'>
			<div className='space-y-6 sm:space-y-8 animate-pulse'>
				{/* Stats */}
				<StatsCardsSkeleton />
				{/* Content lists */}
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
					<ContentListSkeleton items={5} />
					<ContentListSkeleton items={5} />
					<ContentListSkeleton items={5} />
					<ContentListSkeleton items={4} />
				</div>
			</div>
		</SkeletonWrapper>
	);
}

// Full page loading for public site - matches typical homepage structure
export function PublicPageSkeleton() {
	return (
		<SkeletonWrapper label='Pagina wordt geladen'>
			<HeroSkeleton />
			<InfoCardGridSkeleton cards={3} />
			<HomepageDashboardSkeleton />
		</SkeletonWrapper>
	);
}
