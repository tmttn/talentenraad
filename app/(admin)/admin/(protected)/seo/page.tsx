'use client';

import {useState, useEffect, useMemo} from 'react';
import Link from 'next/link';
import {
	Search,
	TrendingUp,
	TrendingDown,
	AlertTriangle,
	CheckCircle,
	FileText,
	Image as ImageIcon,
	Calendar,
	Newspaper,
	Target,
	BarChart3,
	Zap,
	Filter,
	ArrowUpRight,
	RefreshCw,
	Award,
	Clock,
	Eye,
	Edit3,
	ChevronRight,
	Activity,
	PieChart,
} from 'lucide-react';
import {
	analyzeSeo,
	getSeoScoreColor,
	getSeoScoreBgColor,
	getSeoScoreLabel,
} from '@/lib/seo';

type ContentItem = {
	id: string;
	type: 'nieuws' | 'activiteiten';
	title?: string;
	description?: string;
	image?: string;
	content?: string;
	date?: string;
};

type FilterType = 'all' | 'nieuws' | 'activiteiten';
type SortType = 'score-asc' | 'score-desc' | 'date' | 'title';

function ScoreRing({score, size = 'md'}: Readonly<{score: number; size?: 'sm' | 'md' | 'lg'}>) {
	const sizes = {
		sm: {wrapper: 'w-12 h-12', text: 'text-sm', stroke: 3},
		md: {wrapper: 'w-20 h-20', text: 'text-xl', stroke: 4},
		lg: {wrapper: 'w-32 h-32', text: 'text-3xl', stroke: 6},
	};
	const {wrapper, text, stroke} = sizes[size];
	const circumference = 2 * Math.PI * 40;
	const strokeDashoffset = circumference - (score / 100) * circumference;

	const getColor = (s: number) => {
		if (s >= 80) return '#22c55e';
		if (s >= 60) return '#eab308';
		return '#ef4444';
	};

	return (
		<div className={`relative ${wrapper}`}>
			<svg className='w-full h-full transform -rotate-90'>
				<circle
					cx='50%'
					cy='50%'
					r='40%'
					fill='none'
					stroke='#e5e7eb'
					strokeWidth={stroke}
				/>
				<circle
					cx='50%'
					cy='50%'
					r='40%'
					fill='none'
					stroke={getColor(score)}
					strokeWidth={stroke}
					strokeLinecap='round'
					strokeDasharray={circumference}
					strokeDashoffset={strokeDashoffset}
					className='transition-all duration-1000 ease-out'
				/>
			</svg>
			<div className='absolute inset-0 flex items-center justify-center'>
				<span className={`font-bold ${text} ${getSeoScoreColor(score)}`}>{score}</span>
			</div>
		</div>
	);
}

function ContentScoreCard({item, analysis}: Readonly<{
	item: ContentItem;
	analysis: ReturnType<typeof analyzeSeo>;
}>) {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<div
			className='bg-white rounded-card shadow-base overflow-hidden hover:shadow-elevated transition-shadow'
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<div className='p-4'>
				<div className='flex items-start justify-between gap-3 mb-3'>
					<div className='flex items-center gap-2'>
						<span className={`text-xs px-2 py-0.5 rounded-full ${
							item.type === 'nieuws' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
						}`}>
							{item.type === 'nieuws' ? (
								<><Newspaper className='w-3 h-3 inline mr-1' />Nieuws</>
							) : (
								<><Calendar className='w-3 h-3 inline mr-1' />Activiteit</>
							)}
						</span>
					</div>
					<ScoreRing score={analysis.score} size='sm' />
				</div>

				<h3 className='font-medium text-gray-800 line-clamp-2 mb-2 min-h-[2.5rem]'>
					{item.title ?? <span className='text-red-500 italic'>Geen titel</span>}
				</h3>

				{/* Field status indicators */}
				<div className='flex gap-1 mb-3'>
					<div
						className={`flex-1 h-1.5 rounded-full ${
							analysis.fieldScores.title.status === 'good' ? 'bg-green-500' :
								analysis.fieldScores.title.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
						}`}
						title={`Titel: ${analysis.fieldScores.title.score}/${analysis.fieldScores.title.maxScore}`}
					/>
					<div
						className={`flex-1 h-1.5 rounded-full ${
							analysis.fieldScores.description.status === 'good' ? 'bg-green-500' :
								analysis.fieldScores.description.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
						}`}
						title={`Samenvatting: ${analysis.fieldScores.description.score}/${analysis.fieldScores.description.maxScore}`}
					/>
					<div
						className={`flex-1 h-1.5 rounded-full ${
							analysis.fieldScores.image.status === 'good' ? 'bg-green-500' : 'bg-red-500'
						}`}
						title={`Afbeelding: ${analysis.fieldScores.image.score}/${analysis.fieldScores.image.maxScore}`}
					/>
				</div>

				{/* Quick wins preview */}
				{analysis.quickWins.length > 0 && (
					<div className='mb-3'>
						<div className='flex items-center gap-1 text-xs text-yellow-700 bg-yellow-50 px-2 py-1 rounded-button'>
							<Zap className='w-3 h-3' />
							<span>{analysis.quickWins[0].action}</span>
							<span className='font-bold ml-auto'>+{analysis.quickWins[0].impact}</span>
						</div>
					</div>
				)}

				{/* Hover actions */}
				<div className={`flex gap-2 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
					<Link
						href={`/admin/${item.type}/${item.id}`}
						className='flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-primary/10 text-primary-text text-sm font-medium rounded-button hover:bg-primary/20 transition-colors'
					>
						<Edit3 className='w-4 h-4' />
						Bewerken
					</Link>
					<Link
						href={`/${item.type === 'nieuws' ? 'nieuws' : 'activiteiten'}/${item.id}`}
						target='_blank'
						className='flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-button hover:bg-gray-200 transition-colors'
					>
						<Eye className='w-4 h-4' />
					</Link>
				</div>
			</div>
		</div>
	);
}

function ScoreDistributionChart({items}: Readonly<{items: Array<{score: number; type: string}>}>) {
	const distribution = useMemo(() => {
		const ranges = [
			{label: '0-20', min: 0, max: 20, count: 0, color: 'bg-red-500'},
			{label: '21-40', min: 21, max: 40, count: 0, color: 'bg-orange-500'},
			{label: '41-60', min: 41, max: 60, count: 0, color: 'bg-yellow-500'},
			{label: '61-80', min: 61, max: 80, count: 0, color: 'bg-lime-500'},
			{label: '81-100', min: 81, max: 100, count: 0, color: 'bg-green-500'},
		];

		for (const item of items) {
			for (const range of ranges) {
				if (item.score >= range.min && item.score <= range.max) {
					range.count++;
					break;
				}
			}
		}

		const maxCount = Math.max(...ranges.map(r => r.count), 1);
		return ranges.map(r => ({...r, percentage: (r.count / maxCount) * 100}));
	}, [items]);

	return (
		<div className='space-y-2'>
			{distribution.map(range => (
				<div key={range.label} className='flex items-center gap-3'>
					<span className='text-xs text-gray-500 w-12'>{range.label}</span>
					<div className='flex-1 h-6 bg-gray-100 rounded-button overflow-hidden'>
						<div
							className={`h-full ${range.color} transition-all duration-500`}
							style={{width: `${range.percentage}%`}}
						/>
					</div>
					<span className='text-sm font-medium text-gray-700 w-8 text-right'>{range.count}</span>
				</div>
			))}
		</div>
	);
}

function TopIssuesPanel({items}: Readonly<{items: ContentItem[]}>) {
	const topIssues = useMemo(() => {
		const issues: Array<{
			type: 'missing_title' | 'short_title' | 'missing_description' | 'short_description' | 'missing_image';
			count: number;
			impact: number;
			label: string;
			icon: React.ReactNode;
		}> = [];

		let missingTitles = 0;
		let shortTitles = 0;
		let missingDescriptions = 0;
		let shortDescriptions = 0;
		let missingImages = 0;

		for (const item of items) {
			const analysis = analyzeSeo({title: item.title, description: item.description, image: item.image});
			if (analysis.fieldScores.title.status === 'missing') missingTitles++;
			else if (analysis.fieldScores.title.status === 'warning') shortTitles++;
			if (analysis.fieldScores.description.status === 'missing') missingDescriptions++;
			else if (analysis.fieldScores.description.status === 'warning') shortDescriptions++;
			if (analysis.fieldScores.image.status === 'missing') missingImages++;
		}

		if (missingTitles > 0) {
			issues.push({type: 'missing_title', count: missingTitles, impact: 25, label: 'Ontbrekende titels', icon: <FileText className='w-4 h-4' />});
		}

		if (missingDescriptions > 0) {
			issues.push({type: 'missing_description', count: missingDescriptions, impact: 25, label: 'Ontbrekende samenvattingen', icon: <FileText className='w-4 h-4' />});
		}

		if (missingImages > 0) {
			issues.push({type: 'missing_image', count: missingImages, impact: 15, label: 'Ontbrekende afbeeldingen', icon: <ImageIcon className='w-4 h-4' />});
		}

		if (shortTitles > 0) {
			issues.push({type: 'short_title', count: shortTitles, impact: 10, label: 'Te korte titels', icon: <FileText className='w-4 h-4' />});
		}

		if (shortDescriptions > 0) {
			issues.push({type: 'short_description', count: shortDescriptions, impact: 10, label: 'Te korte samenvattingen', icon: <FileText className='w-4 h-4' />});
		}

		return issues.sort((a, b) => (b.count * b.impact) - (a.count * a.impact));
	}, [items]);

	if (topIssues.length === 0) {
		return (
			<div className='text-center py-8'>
				<CheckCircle className='w-12 h-12 text-green-500 mx-auto mb-3' />
				<p className='text-gray-800 font-medium'>Geen SEO-problemen gevonden!</p>
				<p className='text-sm text-gray-500'>Alle content is geoptimaliseerd.</p>
			</div>
		);
	}

	return (
		<div className='space-y-3'>
			{topIssues.map(issue => (
				<div key={issue.type} className='flex items-center gap-3 p-3 bg-gray-50 rounded-button'>
					<div className='w-10 h-10 bg-red-100 rounded-button flex items-center justify-center text-red-600'>
						{issue.icon}
					</div>
					<div className='flex-1'>
						<p className='font-medium text-gray-800'>{issue.label}</p>
						<p className='text-sm text-gray-500'>{issue.count} item{issue.count !== 1 ? 's' : ''} - potentieel +{issue.impact * issue.count} punten</p>
					</div>
					<div className='text-right'>
						<span className='text-lg font-bold text-red-600'>{issue.count}</span>
					</div>
				</div>
			))}
		</div>
	);
}

export default function SeoDashboardPage() {
	const [allItems, setAllItems] = useState<ContentItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<FilterType>('all');
	const [sort, setSort] = useState<SortType>('score-asc');
	const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

	const fetchData = async () => {
		setLoading(true);
		try {
			const [newsResponse, activitiesResponse] = await Promise.all([
				fetch('/api/admin/content?model=nieuws'),
				fetch('/api/admin/content?model=activiteit'),
			]);

			const newsData = await newsResponse.json() as {results: Array<{id: string; data: {titel?: string; samenvatting?: string; afbeelding?: string; inhoud?: string; datum?: string}}>};
			const activitiesData = await activitiesResponse.json() as {results: Array<{id: string; data: {titel?: string; samenvatting?: string; afbeelding?: string; inhoud?: string; datum?: string}}>};

			const items: ContentItem[] = [
				...(newsData.results ?? []).map(item => ({
					id: item.id,
					type: 'nieuws' as const,
					title: item.data.titel,
					description: item.data.samenvatting,
					image: item.data.afbeelding,
					content: item.data.inhoud,
					date: item.data.datum,
				})),
				...(activitiesData.results ?? []).map(item => ({
					id: item.id,
					type: 'activiteiten' as const,
					title: item.data.titel,
					description: item.data.samenvatting,
					image: item.data.afbeelding,
					content: item.data.inhoud,
					date: item.data.datum,
				})),
			];

			setAllItems(items);
			setLastUpdated(new Date());
		} catch (error) {
			console.error('Failed to fetch SEO data:', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void fetchData();
	}, []);

	// Compute analyzed items with memoization
	const analyzedItems = useMemo(() =>
		allItems.map(item => ({
			item,
			analysis: analyzeSeo({title: item.title, description: item.description, image: item.image, content: item.content}),
		})),
	[allItems]);

	// Filter and sort items
	const filteredItems = useMemo(() => {
		let items = analyzedItems;

		// Apply filter
		if (filter !== 'all') {
			items = items.filter(({item}) => item.type === filter);
		}

		// Apply sort
		switch (sort) {
			case 'score-asc': {
				items = [...items].sort((a, b) => a.analysis.score - b.analysis.score);
				break;
			}

			case 'score-desc': {
				items = [...items].sort((a, b) => b.analysis.score - a.analysis.score);
				break;
			}

			case 'title': {
				items = [...items].sort((a, b) => (a.item.title ?? '').localeCompare(b.item.title ?? ''));
				break;
			}

			case 'date': {
				items = [...items].sort((a, b) => {
					const dateA = a.item.date ? new Date(a.item.date).getTime() : 0;
					const dateB = b.item.date ? new Date(b.item.date).getTime() : 0;
					return dateB - dateA;
				});
				break;
			}
		}

		return items;
	}, [analyzedItems, filter, sort]);

	// Statistics
	const stats = useMemo(() => {
		if (analyzedItems.length === 0) {
			return {
				avgScore: 0,
				perfectCount: 0,
				needsWork: 0,
				criticalCount: 0,
				newsAvg: 0,
				activitiesAvg: 0,
				totalQuickWinPoints: 0,
				potentialScore: 0,
			};
		}

		const scores = analyzedItems.map(({analysis}) => analysis.score);
		const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
		const perfectCount = scores.filter(s => s === 100).length;
		const needsWork = scores.filter(s => s < 80 && s >= 40).length;
		const criticalCount = scores.filter(s => s < 40).length;

		const newsItems = analyzedItems.filter(({item}) => item.type === 'nieuws');
		const activityItems = analyzedItems.filter(({item}) => item.type === 'activiteiten');
		const newsAvg = newsItems.length > 0
			? Math.round(newsItems.reduce((sum, {analysis}) => sum + analysis.score, 0) / newsItems.length)
			: 0;
		const activitiesAvg = activityItems.length > 0
			? Math.round(activityItems.reduce((sum, {analysis}) => sum + analysis.score, 0) / activityItems.length)
			: 0;

		const totalQuickWinPoints = analyzedItems.reduce(
			(sum, {analysis}) => sum + analysis.quickWins.reduce((wsum, w) => wsum + w.impact, 0),
			0,
		);
		const potentialScore = Math.min(100, avgScore + Math.round(totalQuickWinPoints / analyzedItems.length));

		return {avgScore, perfectCount, needsWork, criticalCount, newsAvg, activitiesAvg, totalQuickWinPoints, potentialScore};
	}, [analyzedItems]);

	if (loading) {
		return (
			<div className='space-y-6'>
				<div className='flex items-center justify-between'>
					<div>
						<h1 className='text-3xl font-bold text-gray-800'>SEO Dashboard</h1>
						<p className='text-gray-500 mt-1'>Content optimalisatie overzicht</p>
					</div>
				</div>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
					{[...Array(4) as undefined[]].map((_, index) => (
						<div key={index} className='bg-white rounded-card shadow-base p-6 animate-pulse'>
							<div className='h-4 bg-gray-200 rounded w-1/2 mb-4' />
							<div className='h-8 bg-gray-200 rounded w-1/3' />
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
				<div>
					<h1 className='text-3xl font-bold text-gray-800 flex items-center gap-2'>
						<Search className='w-8 h-8 text-primary' />
						SEO Dashboard
					</h1>
					<p className='text-gray-500 mt-1'>
						Analyseer en optimaliseer de vindbaarheid van je content
					</p>
				</div>
				<div className='flex items-center gap-3'>
					{lastUpdated && (
						<span className='text-sm text-gray-500 flex items-center gap-1'>
							<Clock className='w-4 h-4' />
							{lastUpdated.toLocaleTimeString('nl-BE', {hour: '2-digit', minute: '2-digit'})}
						</span>
					)}
					<button
						onClick={() => void fetchData()}
						className='flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary-text font-medium rounded-button hover:bg-primary/20 transition-colors'
					>
						<RefreshCw className='w-4 h-4' />
						Vernieuwen
					</button>
				</div>
			</div>

			{/* Overview Stats */}
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				{/* Main Score Card */}
				<div className='bg-white rounded-card shadow-base p-6 flex flex-col items-center justify-center'>
					<ScoreRing score={stats.avgScore} size='lg' />
					<h2 className='text-lg font-semibold text-gray-800 mt-4'>Gemiddelde SEO Score</h2>
					<p className={`text-sm ${getSeoScoreColor(stats.avgScore)}`}>{getSeoScoreLabel(stats.avgScore)}</p>
					{stats.potentialScore > stats.avgScore && (
						<div className='mt-3 flex items-center gap-1 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full'>
							<TrendingUp className='w-4 h-4' />
							<span>Potentieel: {stats.potentialScore}</span>
						</div>
					)}
				</div>

				{/* Stats Grid */}
				<div className='bg-white rounded-card shadow-base p-6'>
					<h3 className='font-semibold text-gray-800 mb-4 flex items-center gap-2'>
						<Activity className='w-4 h-4 text-primary' />
						Status Overzicht
					</h3>
					<div className='grid grid-cols-2 gap-4'>
						<div className='text-center p-3 bg-green-50 rounded-button'>
							<Award className='w-6 h-6 mx-auto text-green-600 mb-1' />
							<p className='text-2xl font-bold text-green-600'>{stats.perfectCount}</p>
							<p className='text-xs text-gray-600'>Perfect (100)</p>
						</div>
						<div className='text-center p-3 bg-yellow-50 rounded-button'>
							<AlertTriangle className='w-6 h-6 mx-auto text-yellow-600 mb-1' />
							<p className='text-2xl font-bold text-yellow-600'>{stats.needsWork}</p>
							<p className='text-xs text-gray-600'>Kan beter</p>
						</div>
						<div className='text-center p-3 bg-red-50 rounded-button'>
							<TrendingDown className='w-6 h-6 mx-auto text-red-600 mb-1' />
							<p className='text-2xl font-bold text-red-600'>{stats.criticalCount}</p>
							<p className='text-xs text-gray-600'>Kritiek</p>
						</div>
						<div className='text-center p-3 bg-blue-50 rounded-button'>
							<Zap className='w-6 h-6 mx-auto text-blue-600 mb-1' />
							<p className='text-2xl font-bold text-blue-600'>+{stats.totalQuickWinPoints}</p>
							<p className='text-xs text-gray-600'>Quick win punten</p>
						</div>
					</div>
				</div>

				{/* Category Comparison */}
				<div className='bg-white rounded-card shadow-base p-6'>
					<h3 className='font-semibold text-gray-800 mb-4 flex items-center gap-2'>
						<PieChart className='w-4 h-4 text-primary' />
						Per Categorie
					</h3>
					<div className='space-y-4'>
						<div>
							<div className='flex items-center justify-between mb-2'>
								<div className='flex items-center gap-2'>
									<Newspaper className='w-4 h-4 text-blue-600' />
									<span className='text-sm font-medium text-gray-700'>Nieuws</span>
								</div>
								<span className={`font-bold ${getSeoScoreColor(stats.newsAvg)}`}>{stats.newsAvg}</span>
							</div>
							<div className='h-2 bg-gray-200 rounded-full overflow-hidden'>
								<div
									className={`h-full transition-all duration-500 ${getSeoScoreBgColor(stats.newsAvg).replace('bg-', 'bg-').replace('-100', '-500')}`}
									style={{width: `${stats.newsAvg}%`, backgroundColor: stats.newsAvg >= 80 ? '#22c55e' : stats.newsAvg >= 60 ? '#eab308' : '#ef4444'}}
								/>
							</div>
						</div>
						<div>
							<div className='flex items-center justify-between mb-2'>
								<div className='flex items-center gap-2'>
									<Calendar className='w-4 h-4 text-green-600' />
									<span className='text-sm font-medium text-gray-700'>Activiteiten</span>
								</div>
								<span className={`font-bold ${getSeoScoreColor(stats.activitiesAvg)}`}>{stats.activitiesAvg}</span>
							</div>
							<div className='h-2 bg-gray-200 rounded-full overflow-hidden'>
								<div
									className='h-full transition-all duration-500'
									style={{width: `${stats.activitiesAvg}%`, backgroundColor: stats.activitiesAvg >= 80 ? '#22c55e' : stats.activitiesAvg >= 60 ? '#eab308' : '#ef4444'}}
								/>
							</div>
						</div>
					</div>
					<div className='mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500'>
						<p>Totaal: {allItems.length} items</p>
						<p>{analyzedItems.filter(({item}) => item.type === 'nieuws').length} nieuwsberichten, {analyzedItems.filter(({item}) => item.type === 'activiteiten').length} activiteiten</p>
					</div>
				</div>
			</div>

			{/* Secondary Stats Row */}
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
				{/* Score Distribution */}
				<div className='bg-white rounded-card shadow-base p-6'>
					<h3 className='font-semibold text-gray-800 mb-4 flex items-center gap-2'>
						<BarChart3 className='w-4 h-4 text-primary' />
						Score Verdeling
					</h3>
					<ScoreDistributionChart
						items={analyzedItems.map(({item, analysis}) => ({score: analysis.score, type: item.type}))}
					/>
				</div>

				{/* Top Issues */}
				<div className='bg-white rounded-card shadow-base p-6'>
					<h3 className='font-semibold text-gray-800 mb-4 flex items-center gap-2'>
						<Target className='w-4 h-4 text-primary' />
						Belangrijkste Problemen
					</h3>
					<TopIssuesPanel items={allItems} />
				</div>
			</div>

			{/* Content Grid */}
			<div className='bg-white rounded-card shadow-base overflow-hidden'>
				<div className='p-4 sm:p-6 border-b border-gray-100'>
					<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
						<h3 className='font-semibold text-gray-800 flex items-center gap-2'>
							<FileText className='w-4 h-4 text-primary' />
							Alle Content ({filteredItems.length} items)
						</h3>
						<div className='flex flex-wrap gap-2'>
							{/* Filter */}
							<div className='flex items-center gap-1 bg-gray-100 rounded-button p-1'>
								<button
									onClick={() => setFilter('all')}
									className={`px-3 py-1.5 text-sm rounded-button transition-colors ${
										filter === 'all' ? 'bg-white shadow-sm font-medium' : 'text-gray-600 hover:text-gray-800'
									}`}
								>
									Alles
								</button>
								<button
									onClick={() => setFilter('nieuws')}
									className={`px-3 py-1.5 text-sm rounded-button transition-colors ${
										filter === 'nieuws' ? 'bg-white shadow-sm font-medium' : 'text-gray-600 hover:text-gray-800'
									}`}
								>
									Nieuws
								</button>
								<button
									onClick={() => setFilter('activiteiten')}
									className={`px-3 py-1.5 text-sm rounded-button transition-colors ${
										filter === 'activiteiten' ? 'bg-white shadow-sm font-medium' : 'text-gray-600 hover:text-gray-800'
									}`}
								>
									Activiteiten
								</button>
							</div>
							{/* Sort */}
							<select
								value={sort}
								onChange={event => setSort(event.target.value as SortType)}
								className='px-3 py-1.5 text-sm bg-gray-100 rounded-button border-none focus:ring-2 focus:ring-primary'
							>
								<option value='score-asc'>Score (laag-hoog)</option>
								<option value='score-desc'>Score (hoog-laag)</option>
								<option value='date'>Datum (nieuwste)</option>
								<option value='title'>Titel (A-Z)</option>
							</select>
						</div>
					</div>
				</div>

				<div className='p-4 sm:p-6'>
					{filteredItems.length === 0 ? (
						<div className='text-center py-12'>
							<Filter className='w-12 h-12 text-gray-300 mx-auto mb-3' />
							<p className='text-gray-500'>Geen content gevonden met de huidige filter.</p>
						</div>
					) : (
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
							{filteredItems.map(({item, analysis}) => (
								<ContentScoreCard key={item.id} item={item} analysis={analysis} />
							))}
						</div>
					)}
				</div>
			</div>

			{/* Quick Action Footer */}
			<div className='bg-gradient-to-r from-primary/10 to-brand-primary-50 rounded-card p-6'>
				<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
					<div>
						<h3 className='font-semibold text-gray-800 mb-1'>Wil je de SEO direct verbeteren?</h3>
						<p className='text-sm text-gray-600'>
							Begin met de items die de laagste score hebben voor het beste resultaat.
						</p>
					</div>
					{filteredItems.length > 0 && filteredItems[0].analysis.score < 100 && (
						<Link
							href={`/admin/${filteredItems[0].item.type}/${filteredItems[0].item.id}`}
							className='inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-button hover:bg-primary/90 transition-colors'
						>
							Start met slechtste item
							<ChevronRight className='w-4 h-4' />
						</Link>
					)}
				</div>
			</div>
		</div>
	);
}
