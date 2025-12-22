import {Suspense} from 'react';
import {count, isNull, desc} from 'drizzle-orm';
import Link from 'next/link';
// eslint-disable-next-line n/prefer-global/process
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';
import {
	Inbox,
	Mail,
	Plus,
	Calendar,
	Newspaper,
	Megaphone,
	ArrowRight,
	Clock,
	MapPin,
	Star,
	AlertCircle,
	Info,
	FileText,
	Users,
	Zap,
	Sparkles,
	Search,
	TrendingUp,
	ChevronRight,
} from 'lucide-react';
import {db, submissions} from '@/lib/db';
import {listContent} from '@/lib/builder-admin';
import type {Activity as ActivityType, NewsItem, Announcement} from '@/lib/builder-types';
import {DashboardSkeleton} from '@components/skeletons';
import {analyzeSeo, getSeoScoreColor, getSeoScoreBgColor, getSeoScoreLabel} from '@/lib/seo';

function getGreeting(): string {
	const hour = new Date().getHours();
	if (hour < 12) return 'Goedemorgen';
	if (hour < 18) return 'Goedemiddag';
	return 'Goedenavond';
}

function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleDateString('nl-BE', {
		day: 'numeric',
		month: 'short',
	});
}

function formatDateTime(date: Date): string {
	return date.toLocaleDateString('nl-BE', {
		day: 'numeric',
		month: 'short',
		hour: '2-digit',
		minute: '2-digit',
	});
}

function getAnnouncementTypeColor(type: string): string {
	switch (type) {
		case 'belangrijk': {
			return 'bg-red-100 text-red-800 border-red-200';
		}

		case 'waarschuwing': {
			return 'bg-yellow-100 text-yellow-800 border-yellow-200';
		}

		default: {
			return 'bg-blue-100 text-blue-800 border-blue-200';
		}
	}
}

function AnnouncementIcon({type}: {readonly type: string}) {
	switch (type) {
		case 'belangrijk': {
			return <AlertCircle className='w-4 h-4' />;
		}

		case 'waarschuwing': {
			return <AlertCircle className='w-4 h-4' />;
		}

		default: {
			return <Info className='w-4 h-4' />;
		}
	}
}

function getCategoryColor(category: string): string {
	switch (category) {
		case 'feest': {
			return 'bg-pink-100 text-pink-800';
		}

		case 'activiteit': {
			return 'bg-green-100 text-green-800';
		}

		case 'nieuws': {
			return 'bg-blue-100 text-blue-800';
		}

		default: {
			return 'bg-gray-100 text-gray-800';
		}
	}
}

type DashboardData = {
	totalCount: number;
	unreadCount: number;
	recentSubmissions: Array<{
		id: string;
		name: string;
		email: string;
		phone: string | null;
		subject: string;
		message: string;
		createdAt: Date;
		readAt: Date | null;
		archivedAt: Date | null;
	}>;
	activities: ActivityType[];
	news: NewsItem[];
	announcements: Announcement[];
};

async function fetchDashboardData(): Promise<DashboardData> {
	// Default values for when database is unavailable
	let totalCount = 0;
	let unreadCount = 0;
	let recentSubmissions: DashboardData['recentSubmissions'] = [];

	// Skip database calls during build phase
	if (!isBuildPhase) {
		try {
			const [totalResult] = await db.select({count: count()}).from(submissions);
			const [unreadResult] = await db.select({count: count()})
				.from(submissions)
				.where(isNull(submissions.readAt));

			// Fetch recent unread submissions
			recentSubmissions = await db.select()
				.from(submissions)
				.where(isNull(submissions.archivedAt))
				.orderBy(desc(submissions.createdAt))
				.limit(5);

			totalCount = totalResult.count;
			unreadCount = unreadResult.count;
		} catch {
			// Silently fail - dashboard will show zeros for submissions
		}
	}

	// Fetch latest content from Builder.io
	let activities: ActivityType[] = [];
	let news: NewsItem[] = [];
	let announcements: Announcement[] = [];

	try {
		const [activitiesData, newsData, announcementsData] = await Promise.all([
			listContent('activiteit'),
			listContent('nieuws'),
			listContent('aankondiging'),
		]);
		activities = activitiesData.slice(0, 5);
		news = newsData.slice(0, 5);
		announcements = announcementsData.filter(a => a.data.actief);
	} catch {
		// Silently handle Builder.io errors - dashboard will still work
	}

	return {
		totalCount,
		unreadCount,
		recentSubmissions,
		activities,
		news,
		announcements,
	};
}

function DashboardHeader() {
	const greeting = getGreeting();

	return (
		<>
			{/* Header with greeting */}
			<div>
				<h1 className='text-2xl sm:text-3xl font-bold text-gray-800'>{greeting}!</h1>
				<p className='text-gray-500 mt-1'>Hier is een overzicht van je website.</p>
			</div>

			{/* Quick Create Buttons */}
			<div className='bg-white p-4 sm:p-5 rounded-card shadow-base'>
				<h2 className='text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2'>
					<Plus className='w-4 h-4' />
					Snel aanmaken
				</h2>
				<div className='flex flex-wrap gap-2'>
					<Link
						href='/admin/nieuws/new'
						className='inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary-text font-medium rounded-button hover:bg-primary/20 transition-colors text-sm'
					>
						<Newspaper className='w-4 h-4' />
						Nieuwsbericht
					</Link>
					<Link
						href='/admin/activiteiten/new'
						className='inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 font-medium rounded-button hover:bg-green-200 transition-colors text-sm'
					>
						<Calendar className='w-4 h-4' />
						Activiteit
					</Link>
					<Link
						href='/admin/aankondigingen'
						className='inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 font-medium rounded-button hover:bg-yellow-200 transition-colors text-sm'
					>
						<Megaphone className='w-4 h-4' />
						Aankondiging
					</Link>
				</div>
			</div>
		</>
	);
}

function SeoQuickOverview({news, activities}: Readonly<{news: NewsItem[]; activities: ActivityType[]}>) {
	// Calculate SEO stats
	const allItems = [
		...news.map(item => ({title: item.data.titel, description: item.data.samenvatting, image: item.data.afbeelding})),
		...activities.map(item => ({title: item.data.titel, description: item.data.samenvatting, image: item.data.afbeelding})),
	];
	const analyses = allItems.map(item => analyzeSeo(item));
	const avgScore = analyses.length > 0
		? Math.round(analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length)
		: 0;
	const perfectCount = analyses.filter(a => a.score === 100).length;
	const needsAttention = analyses.filter(a => a.score < 80).length;

	return (
		<Link
			href='/admin/seo'
			className='block bg-white rounded-card shadow-base hover:shadow-elevated transition-shadow overflow-hidden group'
		>
			<div className='p-4 sm:p-5'>
				<div className='flex items-center justify-between mb-4'>
					<div className='flex items-center gap-2'>
						<Search className='w-5 h-5 text-primary' />
						<h3 className='font-semibold text-gray-800'>SEO Overzicht</h3>
					</div>
					<div className='flex items-center gap-2 text-primary-text text-sm font-medium group-hover:underline'>
						Volledig dashboard
						<ChevronRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
					</div>
				</div>

				<div className='grid grid-cols-4 gap-4'>
					{/* Score Ring */}
					<div className='flex flex-col items-center'>
						<div className={`w-16 h-16 rounded-full flex items-center justify-center ${getSeoScoreBgColor(avgScore)}`}>
							<span className={`text-xl font-bold ${getSeoScoreColor(avgScore)}`}>{avgScore}</span>
						</div>
						<p className='text-xs text-gray-500 mt-2'>Gem. Score</p>
					</div>

					{/* Stats */}
					<div className='flex flex-col items-center justify-center'>
						<p className='text-2xl font-bold text-gray-800'>{allItems.length}</p>
						<p className='text-xs text-gray-500'>Content items</p>
					</div>

					<div className='flex flex-col items-center justify-center'>
						<p className='text-2xl font-bold text-green-600'>{perfectCount}</p>
						<p className='text-xs text-gray-500'>Perfect</p>
					</div>

					<div className='flex flex-col items-center justify-center'>
						<p className='text-2xl font-bold text-yellow-600'>{needsAttention}</p>
						<p className='text-xs text-gray-500'>Aandacht nodig</p>
					</div>
				</div>

				{needsAttention > 0 && (
					<div className='mt-4 flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 px-3 py-2 rounded-button'>
						<TrendingUp className='w-4 h-4' />
						<span>{needsAttention} item{needsAttention !== 1 ? 's' : ''} kunnen verbeterd worden</span>
					</div>
				)}
			</div>
		</Link>
	);
}

function QuickLinks() {
	return (
		<div className='bg-white rounded-card shadow-base overflow-hidden'>
			<div className='p-4 sm:p-5 border-b border-gray-100'>
				<h2 className='font-semibold text-gray-800 flex items-center gap-2'>
					<Zap className='w-4 h-4 text-purple-500' />
					Snelle links
				</h2>
			</div>
			<div className='p-3 sm:p-4 grid grid-cols-2 gap-2'>
				<Link
					href='/admin/submissions'
					className='flex items-center gap-3 p-3 rounded-button hover:bg-gray-50 transition-colors'
				>
					<div className='w-10 h-10 bg-primary/10 rounded-button flex items-center justify-center'>
						<FileText className='w-5 h-5 text-primary' />
					</div>
					<div>
						<p className='font-medium text-gray-800 text-sm'>Berichten</p>
						<p className='text-xs text-gray-500'>Inbox beheren</p>
					</div>
				</Link>
				<Link
					href='/admin/gebruikers'
					className='flex items-center gap-3 p-3 rounded-button hover:bg-gray-50 transition-colors'
				>
					<div className='w-10 h-10 bg-blue-100 rounded-button flex items-center justify-center'>
						<Users className='w-5 h-5 text-blue-600' />
					</div>
					<div>
						<p className='font-medium text-gray-800 text-sm'>Gebruikers</p>
						<p className='text-xs text-gray-500'>Beheerders</p>
					</div>
				</Link>
				<Link
					href='/admin/decoraties'
					className='flex items-center gap-3 p-3 rounded-button hover:bg-gray-50 transition-colors'
				>
					<div className='w-10 h-10 bg-pink-100 rounded-button flex items-center justify-center'>
						<Sparkles className='w-5 h-5 text-pink-500' />
					</div>
					<div>
						<p className='font-medium text-gray-800 text-sm'>Decoraties</p>
						<p className='text-xs text-gray-500'>Seizoensversiering</p>
					</div>
				</Link>
				<Link
					href='/'
					target='_blank'
					rel='noopener noreferrer'
					className='flex items-center gap-3 p-3 rounded-button hover:bg-gray-50 transition-colors'
				>
					<div className='w-10 h-10 bg-green-100 rounded-button flex items-center justify-center'>
						<ArrowRight className='w-5 h-5 text-green-600' />
					</div>
					<div>
						<p className='font-medium text-gray-800 text-sm'>Website</p>
						<p className='text-xs text-gray-500'>Bekijk live site</p>
					</div>
				</Link>
			</div>
		</div>
	);
}

async function DashboardContent() {
	const data = await fetchDashboardData();

	return (
		<>
			{/* Active Announcements Alert */}
			{data.announcements.length > 0 && (
				<div className='space-y-2'>
					{data.announcements.map(announcement => (
						<div
							key={announcement.id}
							className={`p-3 rounded-button border flex items-center gap-3 ${getAnnouncementTypeColor(announcement.data.type)}`}
						>
							<AnnouncementIcon type={announcement.data.type} />
							<span className='flex-1 text-sm font-medium'>{announcement.data.tekst}</span>
							<Link
								href='/admin/aankondigingen'
								className='text-xs underline hover:no-underline'
							>
								Beheren
							</Link>
						</div>
					))}
				</div>
			)}

			{/* Statistics Cards */}
			<div className='grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4'>
				<Link href='/admin/submissions' className='bg-white p-4 sm:p-5 rounded-card shadow-base hover:shadow-elevated transition-shadow group'>
					<div className='flex items-center justify-between mb-2'>
						<Inbox className='w-5 h-5 text-gray-500 group-hover:text-primary transition-colors' />
						<span className='text-xs text-gray-500'>totaal</span>
					</div>
					<p className='text-2xl sm:text-3xl font-bold text-gray-800'>{data.totalCount}</p>
					<p className='text-xs text-gray-500 mt-1'>Berichten</p>
				</Link>
				<Link href='/admin/submissions' className='bg-white p-4 sm:p-5 rounded-card shadow-base hover:shadow-elevated transition-shadow group'>
					<div className='flex items-center justify-between mb-2'>
						<Mail className='w-5 h-5 text-primary' />
						{data.unreadCount > 0 && (
							<span className='bg-primary text-white text-xs px-2 py-0.5 rounded-full'>nieuw</span>
						)}
					</div>
					<p className='text-2xl sm:text-3xl font-bold text-primary'>{data.unreadCount}</p>
					<p className='text-xs text-gray-500 mt-1'>Ongelezen</p>
				</Link>
				<Link href='/admin/nieuws' className='bg-white p-4 sm:p-5 rounded-card shadow-base hover:shadow-elevated transition-shadow group'>
					<div className='flex items-center justify-between mb-2'>
						<Newspaper className='w-5 h-5 text-gray-500 group-hover:text-blue-500 transition-colors' />
					</div>
					<p className='text-2xl sm:text-3xl font-bold text-gray-800'>{data.news.length > 0 ? data.news.length : '0'}</p>
					<p className='text-xs text-gray-500 mt-1'>Nieuwsberichten</p>
				</Link>
				<Link href='/admin/activiteiten' className='bg-white p-4 sm:p-5 rounded-card shadow-base hover:shadow-elevated transition-shadow group'>
					<div className='flex items-center justify-between mb-2'>
						<Calendar className='w-5 h-5 text-gray-500 group-hover:text-green-500 transition-colors' />
					</div>
					<p className='text-2xl sm:text-3xl font-bold text-gray-800'>{data.activities.length > 0 ? data.activities.length : '0'}</p>
					<p className='text-xs text-gray-500 mt-1'>Activiteiten</p>
				</Link>
			</div>

			{/* SEO Quick Overview */}
			<SeoQuickOverview news={data.news} activities={data.activities} />

			{/* Content Lists Grid */}
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
				{/* Recent Submissions */}
				<div className='bg-white rounded-card shadow-base overflow-hidden'>
					<div className='p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between'>
						<h2 className='font-semibold text-gray-800 flex items-center gap-2'>
							<Mail className='w-4 h-4 text-primary' />
							Recente berichten
						</h2>
						<Link href='/admin/submissions' className='text-primary-text text-sm hover:underline flex items-center gap-1'>
							Alles bekijken
							<ArrowRight className='w-3 h-3' />
						</Link>
					</div>
					<div className='divide-y divide-gray-50'>
						{data.recentSubmissions.length === 0 ? (
							<div className='p-4 text-center text-gray-500 text-sm'>
								Geen berichten
							</div>
						) : (
							data.recentSubmissions.map(submission => (
								<Link
									key={submission.id}
									href={`/admin/submissions/${submission.id}`}
									className={`block p-3 sm:p-4 hover:bg-gray-50 transition-colors ${!submission.readAt ? 'bg-primary/5' : ''}`}
								>
									<div className='flex items-start justify-between gap-2'>
										<div className='flex-1 min-w-0'>
											<div className='flex items-center gap-2'>
												{!submission.readAt && (
													<span className='w-2 h-2 bg-primary rounded-full flex-shrink-0' />
												)}
												<span className='font-medium text-gray-800 truncate text-sm'>
													{submission.name}
												</span>
											</div>
											<p className='text-xs text-gray-500 mt-0.5 truncate'>
												{submission.subject} - {submission.message.slice(0, 50)}...
											</p>
										</div>
										<span className='text-xs text-gray-500 whitespace-nowrap'>
											{formatDateTime(submission.createdAt)}
										</span>
									</div>
								</Link>
							))
						)}
					</div>
				</div>

				{/* Upcoming Activities */}
				<div className='bg-white rounded-card shadow-base overflow-hidden'>
					<div className='p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between'>
						<h2 className='font-semibold text-gray-800 flex items-center gap-2'>
							<Calendar className='w-4 h-4 text-green-500' />
							Komende activiteiten
						</h2>
						<Link href='/admin/activiteiten' className='text-primary-text text-sm hover:underline flex items-center gap-1'>
							Alles bekijken
							<ArrowRight className='w-3 h-3' />
						</Link>
					</div>
					<div className='divide-y divide-gray-50'>
						{data.activities.length === 0 ? (
							<div className='p-4 text-center text-gray-500 text-sm'>
								Geen activiteiten
							</div>
						) : (
							data.activities.map(activity => (
								<Link
									key={activity.id}
									href={`/admin/activiteiten/${activity.id}`}
									className='block p-3 sm:p-4 hover:bg-gray-50 transition-colors'
								>
									<div className='flex items-start justify-between gap-2'>
										<div className='flex-1 min-w-0'>
											<div className='flex items-center gap-2'>
												{activity.data.vastgepind && (
													<Star className='w-3 h-3 text-yellow-500 fill-yellow-500 flex-shrink-0' />
												)}
												<span className='font-medium text-gray-800 truncate text-sm'>
													{activity.data.titel}
												</span>
												<span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(activity.data.categorie)}`}>
													{activity.data.categorie}
												</span>
											</div>
											<div className='flex items-center gap-3 mt-1 text-xs text-gray-500'>
												<span className='flex items-center gap-1'>
													<Clock className='w-3 h-3' />
													{formatDate(activity.data.datum)}
													{activity.data.tijd && ` om ${activity.data.tijd}`}
												</span>
												{activity.data.locatie && (
													<span className='flex items-center gap-1 truncate'>
														<MapPin className='w-3 h-3' />
														{activity.data.locatie}
													</span>
												)}
											</div>
										</div>
										{activity.published !== 'published' && (
											<span className='text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full'>
												concept
											</span>
										)}
									</div>
								</Link>
							))
						)}
					</div>
				</div>

				{/* Latest News */}
				<div className='bg-white rounded-card shadow-base overflow-hidden'>
					<div className='p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between'>
						<h2 className='font-semibold text-gray-800 flex items-center gap-2'>
							<Newspaper className='w-4 h-4 text-blue-500' />
							Laatste nieuws
						</h2>
						<Link href='/admin/nieuws' className='text-primary-text text-sm hover:underline flex items-center gap-1'>
							Alles bekijken
							<ArrowRight className='w-3 h-3' />
						</Link>
					</div>
					<div className='divide-y divide-gray-50'>
						{data.news.length === 0 ? (
							<div className='p-4 text-center text-gray-500 text-sm'>
								Geen nieuwsberichten
							</div>
						) : (
							data.news.map(item => (
								<Link
									key={item.id}
									href={`/admin/nieuws/${item.id}`}
									className='block p-3 sm:p-4 hover:bg-gray-50 transition-colors'
								>
									<div className='flex items-start justify-between gap-2'>
										<div className='flex-1 min-w-0'>
											<div className='flex items-center gap-2'>
												{item.data.vastgepind && (
													<Star className='w-3 h-3 text-yellow-500 fill-yellow-500 flex-shrink-0' />
												)}
												<span className='font-medium text-gray-800 truncate text-sm'>
													{item.data.titel}
												</span>
											</div>
											<p className='text-xs text-gray-500 mt-0.5 truncate'>
												{item.data.samenvatting}
											</p>
										</div>
										<div className='flex items-center gap-2'>
											{item.published !== 'published' && (
												<span className='text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full'>
													concept
												</span>
											)}
											<span className='text-xs text-gray-500 whitespace-nowrap'>
												{formatDate(item.data.datum)}
											</span>
										</div>
									</div>
								</Link>
							))
						)}
					</div>
				</div>

				{/* Quick Links */}
				<QuickLinks />
			</div>
		</>
	);
}

export default function AdminDashboardPage() {
	return (
		<div className='space-y-6 sm:space-y-8'>
			<DashboardHeader />
			<Suspense fallback={<DashboardSkeleton />}>
				<DashboardContent />
			</Suspense>
		</div>
	);
}
