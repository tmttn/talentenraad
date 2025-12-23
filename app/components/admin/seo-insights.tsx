'use client';

import {useState} from 'react';
import Link from 'next/link';
import {
	Search,
	AlertTriangle,
	CheckCircle,
	Info,
	TrendingUp,
	FileText,
	Image as ImageIcon,
	ChevronDown,
	ChevronRight,
	ExternalLink,
	Zap,
	Target,
	BarChart3,
	ArrowUpRight,
	Edit3,
} from 'lucide-react';
import {
	analyzeSeo,
	getSeoScoreColor,
	getSeoScoreBgColor,
	getSeoScoreLabel,
	type SeoAnalysis,
	type SeoIssue,
	type FieldScore,
} from '@lib/seo';

type SeoInsightsProperties = {
	title?: string;
	description?: string;
	image?: string;
	content?: string;
	showDetails?: boolean;
};

function IssueIcon({type}: Readonly<{type: SeoIssue['type']}>) {
	switch (type) {
		case 'error': {
			return <AlertTriangle className='w-4 h-4 text-red-500' />;
		}

		case 'warning': {
			return <AlertTriangle className='w-4 h-4 text-yellow-500' />;
		}

		default: {
			return <Info className='w-4 h-4 text-blue-500' />;
		}
	}
}

function getIssueColor(type: SeoIssue['type']): string {
	switch (type) {
		case 'error': {
			return 'bg-red-50 border-red-200';
		}

		case 'warning': {
			return 'bg-yellow-50 border-yellow-200';
		}

		default: {
			return 'bg-blue-50 border-blue-200';
		}
	}
}

function getFieldStatusColor(status: FieldScore['status']): string {
	switch (status) {
		case 'good': {
			return 'bg-green-500';
		}

		case 'warning': {
			return 'bg-yellow-500';
		}

		case 'error':
		case 'missing': {
			return 'bg-red-500';
		}

		default: {
			return 'bg-gray-300';
		}
	}
}

function FieldProgressBar({fieldScore, label}: Readonly<{fieldScore: FieldScore; label: string}>) {
	const percentage = (fieldScore.score / fieldScore.maxScore) * 100;

	return (
		<div className='space-y-1'>
			<div className='flex items-center justify-between text-xs'>
				<span className='text-gray-600'>{label}</span>
				<span className='font-medium text-gray-800'>{fieldScore.score}/{fieldScore.maxScore}</span>
			</div>
			<div className='h-2 bg-gray-200 rounded-full overflow-hidden'>
				<div
					className={`h-full rounded-full transition-all ${getFieldStatusColor(fieldScore.status)}`}
					style={{width: `${percentage}%`}}
				/>
			</div>
			{fieldScore.recommendation && (
				<p className='text-xs text-gray-500'>{fieldScore.recommendation}</p>
			)}
		</div>
	);
}

export function SeoScore({score}: Readonly<{score: number}>) {
	return (
		<div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${getSeoScoreBgColor(score)}`}>
			<TrendingUp className={`w-4 h-4 ${getSeoScoreColor(score)}`} />
			<span className={`text-sm font-semibold ${getSeoScoreColor(score)}`}>
				{score}/100
			</span>
			<span className={`text-xs ${getSeoScoreColor(score)}`}>
				({getSeoScoreLabel(score)})
			</span>
		</div>
	);
}

export function SeoInsights({
	title,
	description,
	image,
	content,
	showDetails = true,
}: Readonly<SeoInsightsProperties>) {
	const analysis = analyzeSeo({title, description, image, content});

	return (
		<div className='bg-white rounded-card shadow-base overflow-hidden'>
			<div className='p-4 sm:p-5 border-b border-gray-100'>
				<div className='flex items-center justify-between'>
					<h3 className='font-semibold text-gray-800 flex items-center gap-2'>
						<Search className='w-4 h-4 text-primary' />
						SEO Analyse
					</h3>
					<SeoScore score={analysis.score} />
				</div>
			</div>

			<div className='p-4 sm:p-5 space-y-4'>
				{/* Field Progress Bars */}
				<div className='space-y-3'>
					<FieldProgressBar fieldScore={analysis.fieldScores.title} label='Titel' />
					<FieldProgressBar fieldScore={analysis.fieldScores.description} label='Samenvatting' />
					<FieldProgressBar fieldScore={analysis.fieldScores.image} label='Afbeelding' />
					{analysis.fieldScores.content && (
						<FieldProgressBar fieldScore={analysis.fieldScores.content} label='Inhoud' />
					)}
				</div>

				{/* Quick Stats */}
				<div className={`grid gap-3 ${content ? 'grid-cols-4' : 'grid-cols-3'}`}>
					<div className='text-center p-3 bg-gray-50 rounded-button'>
						<FileText className='w-5 h-5 mx-auto text-gray-500 mb-1' />
						<p className='text-xs text-gray-500'>Titel</p>
						<p className='text-sm font-medium text-gray-800'>
							{title ? `${title.length} tekens` : 'Ontbreekt'}
						</p>
					</div>
					<div className='text-center p-3 bg-gray-50 rounded-button'>
						<FileText className='w-5 h-5 mx-auto text-gray-500 mb-1' />
						<p className='text-xs text-gray-500'>Samenvatting</p>
						<p className='text-sm font-medium text-gray-800'>
							{description ? `${description.length} tekens` : 'Ontbreekt'}
						</p>
					</div>
					<div className='text-center p-3 bg-gray-50 rounded-button'>
						<ImageIcon className='w-5 h-5 mx-auto text-gray-500 mb-1' />
						<p className='text-xs text-gray-500'>Afbeelding</p>
						<p className='text-sm font-medium text-gray-800'>
							{image ? (
								<CheckCircle className='w-4 h-4 mx-auto text-green-500' />
							) : (
								'Ontbreekt'
							)}
						</p>
					</div>
					{content !== undefined && (
						<div className='text-center p-3 bg-gray-50 rounded-button'>
							<FileText className='w-5 h-5 mx-auto text-gray-500 mb-1' />
							<p className='text-xs text-gray-500'>Inhoud</p>
							<p className='text-sm font-medium text-gray-800'>
								{content ? (
									<CheckCircle className='w-4 h-4 mx-auto text-green-500' />
								) : (
									'Ontbreekt'
								)}
							</p>
						</div>
					)}
				</div>

				{/* Quick Wins */}
				{showDetails && analysis.quickWins.length > 0 && (
					<div className='space-y-2'>
						<h4 className='text-sm font-medium text-gray-700 flex items-center gap-2'>
							<Zap className='w-4 h-4 text-yellow-500' />
							Snelle verbeteringen
						</h4>
						{analysis.quickWins.map((win, index) => (
							<div
								key={index}
								className='flex items-center justify-between p-2 rounded-button bg-yellow-50 border border-yellow-200'
							>
								<span className='text-sm text-gray-700'>{win.action}</span>
								<span className='text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full'>
									+{win.impact} punten
								</span>
							</div>
						))}
					</div>
				)}

				{/* Issues */}
				{showDetails && analysis.issues.length > 0 && (
					<div className='space-y-2'>
						<h4 className='text-sm font-medium text-gray-700'>Aandachtspunten</h4>
						{analysis.issues.map((issue, index) => (
							<div
								key={index}
								className={`flex items-start gap-2 p-2 rounded-button border ${getIssueColor(issue.type)}`}
							>
								<IssueIcon type={issue.type} />
								<span className='text-sm text-gray-700'>{issue.message}</span>
							</div>
						))}
					</div>
				)}

				{/* Suggestions */}
				{showDetails && analysis.suggestions.length > 0 && (
					<div className='space-y-2'>
						<h4 className='text-sm font-medium text-gray-700'>Suggesties</h4>
						{analysis.suggestions.map((suggestion, index) => (
							<div
								key={index}
								className='flex items-start gap-2 p-2 rounded-button bg-blue-50 border border-blue-200'
							>
								<Info className='w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5' />
								<span className='text-sm text-gray-700'>{suggestion}</span>
							</div>
						))}
					</div>
				)}

				{/* All good message */}
				{analysis.issues.length === 0 && analysis.suggestions.length === 0 && (
					<div className='flex items-center gap-2 p-3 rounded-button bg-green-50 border border-green-200'>
						<CheckCircle className='w-5 h-5 text-green-500' />
						<span className='text-sm text-green-700'>
							Uitstekend! Alle SEO-vereisten zijn vervuld.
						</span>
					</div>
				)}
			</div>
		</div>
	);
}

type SeoOverviewCardProperties = {
	items: Array<{
		title?: string;
		description?: string;
		image?: string;
	}>;
	label: string;
};

export function SeoOverviewCard({items, label}: Readonly<SeoOverviewCardProperties>) {
	const analyses = items.map(item => analyzeSeo(item));
	const averageScore = analyses.length > 0
		? Math.round(analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length)
		: 0;
	const itemsWithIssues = analyses.filter(a => a.issues.some(i => i.type === 'error' || i.type === 'warning')).length;
	const goodItems = analyses.filter(a => a.score >= 80).length;

	return (
		<div className='bg-white p-4 rounded-card shadow-base'>
			<div className='flex items-center justify-between mb-3'>
				<h4 className='text-sm font-medium text-gray-700'>{label}</h4>
				<SeoScore score={averageScore} />
			</div>
			<div className='grid grid-cols-3 gap-2 text-center'>
				<div>
					<p className='text-lg font-bold text-gray-800'>{items.length}</p>
					<p className='text-xs text-gray-500'>Totaal</p>
				</div>
				<div>
					<p className='text-lg font-bold text-green-600'>{goodItems}</p>
					<p className='text-xs text-gray-500'>Goed</p>
				</div>
				<div>
					<p className='text-lg font-bold text-yellow-600'>{itemsWithIssues}</p>
					<p className='text-xs text-gray-500'>Aandacht</p>
				</div>
			</div>
		</div>
	);
}

// Enhanced content item type with ID and type for linking
type ContentItemWithMeta = {
	id: string;
	type: 'nieuws' | 'activiteiten';
	title?: string;
	description?: string;
	image?: string;
};

type SeoAuditPanelProperties = {
	items: ContentItemWithMeta[];
	maxItems?: number;
};

export function SeoAuditPanel({items, maxItems = 5}: Readonly<SeoAuditPanelProperties>) {
	const [isExpanded, setIsExpanded] = useState(false);

	// Analyze all items and sort by score (worst first)
	const analyzedItems = items
		.map(item => ({
			...item,
			analysis: analyzeSeo({title: item.title, description: item.description, image: item.image}),
		}))
		.filter(item => item.analysis.score < 100)
		.sort((a, b) => a.analysis.score - b.analysis.score);

	const displayItems = isExpanded ? analyzedItems : analyzedItems.slice(0, maxItems);
	const hasMore = analyzedItems.length > maxItems;

	if (analyzedItems.length === 0) {
		return (
			<div className='bg-white rounded-card shadow-base overflow-hidden'>
				<div className='p-4 sm:p-5 border-b border-gray-100'>
					<h3 className='font-semibold text-gray-800 flex items-center gap-2'>
						<Target className='w-4 h-4 text-green-500' />
						SEO Audit
					</h3>
				</div>
				<div className='p-6 text-center'>
					<CheckCircle className='w-12 h-12 text-green-500 mx-auto mb-3' />
					<p className='text-gray-800 font-medium'>Alle content is geoptimaliseerd!</p>
					<p className='text-sm text-gray-500 mt-1'>Er zijn geen SEO-problemen gevonden.</p>
				</div>
			</div>
		);
	}

	return (
		<div className='bg-white rounded-card shadow-base overflow-hidden'>
			<div className='p-4 sm:p-5 border-b border-gray-100'>
				<div className='flex items-center justify-between'>
					<h3 className='font-semibold text-gray-800 flex items-center gap-2'>
						<Target className='w-4 h-4 text-primary' />
						SEO Audit - Items die aandacht nodig hebben
					</h3>
					<span className='text-sm text-gray-500'>
						{analyzedItems.length} item{analyzedItems.length !== 1 ? 's' : ''}
					</span>
				</div>
			</div>

			<div className='divide-y divide-gray-50'>
				{displayItems.map(item => (
					<div key={item.id} className='p-4 hover:bg-gray-50 transition-colors'>
						<div className='flex items-start justify-between gap-4'>
							<div className='flex-1 min-w-0'>
								<div className='flex items-center gap-2 mb-1'>
									<span className={`text-xs px-2 py-0.5 rounded-full ${
										item.type === 'nieuws' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
									}`}>
										{item.type === 'nieuws' ? 'Nieuws' : 'Activiteit'}
									</span>
									<SeoScore score={item.analysis.score} />
								</div>
								<h4 className='font-medium text-gray-800 truncate'>
									{item.title ?? 'Geen titel'}
								</h4>

								{/* Quick wins for this item */}
								{item.analysis.quickWins.length > 0 && (
									<div className='mt-2 flex flex-wrap gap-1'>
										{item.analysis.quickWins.slice(0, 3).map((win, index) => (
											<span
												key={index}
												className='inline-flex items-center gap-1 text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full'
											>
												<Zap className='w-3 h-3' />
												{win.action}
												<span className='font-medium'>+{win.impact}</span>
											</span>
										))}
									</div>
								)}
							</div>

							<Link
								href={`/admin/${item.type}/${item.id}`}
								className='flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary-text text-sm font-medium rounded-button hover:bg-primary/20 transition-colors'
							>
								<Edit3 className='w-4 h-4' />
								Bewerken
							</Link>
						</div>
					</div>
				))}
			</div>

			{hasMore && (
				<button
					onClick={() => setIsExpanded(!isExpanded)}
					className='w-full p-3 text-center text-sm text-primary-text hover:bg-gray-50 transition-colors flex items-center justify-center gap-1'
				>
					{isExpanded ? (
						<>
							<ChevronDown className='w-4 h-4' />
							Minder tonen
						</>
					) : (
						<>
							<ChevronRight className='w-4 h-4' />
							{analyzedItems.length - maxItems} meer tonen
						</>
					)}
				</button>
			)}
		</div>
	);
}

type IssueBreakdownProperties = {
	items: ContentItemWithMeta[];
};

export function SeoIssueBreakdown({items}: Readonly<IssueBreakdownProperties>) {
	// Count issues by field
	const issuesByField = {
		title: {missing: 0, warning: 0, items: [] as ContentItemWithMeta[]},
		description: {missing: 0, warning: 0, items: [] as ContentItemWithMeta[]},
		image: {missing: 0, warning: 0, items: [] as ContentItemWithMeta[]},
	};

	for (const item of items) {
		const analysis = analyzeSeo({title: item.title, description: item.description, image: item.image});

		if (analysis.fieldScores.title.status === 'missing') {
			issuesByField.title.missing++;
			issuesByField.title.items.push(item);
		} else if (analysis.fieldScores.title.status === 'warning') {
			issuesByField.title.warning++;
			issuesByField.title.items.push(item);
		}

		if (analysis.fieldScores.description.status === 'missing') {
			issuesByField.description.missing++;
			issuesByField.description.items.push(item);
		} else if (analysis.fieldScores.description.status === 'warning') {
			issuesByField.description.warning++;
			issuesByField.description.items.push(item);
		}

		if (analysis.fieldScores.image.status === 'missing') {
			issuesByField.image.missing++;
			issuesByField.image.items.push(item);
		}
	}

	const totalIssues = Object.values(issuesByField).reduce(
		(sum, field) => sum + field.missing + field.warning,
		0,
	);

	if (totalIssues === 0) {
		return null;
	}

	return (
		<div className='bg-white rounded-card shadow-base overflow-hidden'>
			<div className='p-4 sm:p-5 border-b border-gray-100'>
				<h3 className='font-semibold text-gray-800 flex items-center gap-2'>
					<BarChart3 className='w-4 h-4 text-primary' />
					Problemen per veld
				</h3>
			</div>

			<div className='p-4 sm:p-5 space-y-4'>
				{/* Title Issues */}
				{(issuesByField.title.missing > 0 || issuesByField.title.warning > 0) && (
					<IssueFieldRow
						icon={<FileText className='w-5 h-5' />}
						label='Titel'
						missing={issuesByField.title.missing}
						warning={issuesByField.title.warning}
						items={issuesByField.title.items}
					/>
				)}

				{/* Description Issues */}
				{(issuesByField.description.missing > 0 || issuesByField.description.warning > 0) && (
					<IssueFieldRow
						icon={<FileText className='w-5 h-5' />}
						label='Samenvatting'
						missing={issuesByField.description.missing}
						warning={issuesByField.description.warning}
						items={issuesByField.description.items}
					/>
				)}

				{/* Image Issues */}
				{issuesByField.image.missing > 0 && (
					<IssueFieldRow
						icon={<ImageIcon className='w-5 h-5' />}
						label='Afbeelding'
						missing={issuesByField.image.missing}
						warning={0}
						items={issuesByField.image.items}
					/>
				)}
			</div>
		</div>
	);
}

type IssueFieldRowProperties = {
	icon: React.ReactNode;
	label: string;
	missing: number;
	warning: number;
	items: ContentItemWithMeta[];
};

function IssueFieldRow({icon, label, missing, warning, items}: Readonly<IssueFieldRowProperties>) {
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<div className='border border-gray-200 rounded-button overflow-hidden'>
			<button
				onClick={() => setIsExpanded(!isExpanded)}
				className='w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors'
			>
				<div className='flex items-center gap-3'>
					<div className='text-gray-500'>{icon}</div>
					<span className='font-medium text-gray-800'>{label}</span>
				</div>
				<div className='flex items-center gap-3'>
					{missing > 0 && (
						<span className='inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full'>
							{missing} ontbreekt
						</span>
					)}
					{warning > 0 && (
						<span className='inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full'>
							{warning} waarschuwing{warning !== 1 ? 'en' : ''}
						</span>
					)}
					{isExpanded ? (
						<ChevronDown className='w-4 h-4 text-gray-400' />
					) : (
						<ChevronRight className='w-4 h-4 text-gray-400' />
					)}
				</div>
			</button>

			{isExpanded && (
				<div className='border-t border-gray-200 divide-y divide-gray-100'>
					{items.slice(0, 5).map(item => (
						<Link
							key={item.id}
							href={`/admin/${item.type}/${item.id}`}
							className='flex items-center justify-between p-3 hover:bg-gray-50 transition-colors'
						>
							<div className='flex items-center gap-2'>
								<span className={`text-xs px-1.5 py-0.5 rounded ${
									item.type === 'nieuws' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
								}`}>
									{item.type === 'nieuws' ? 'N' : 'A'}
								</span>
								<span className='text-sm text-gray-700 truncate max-w-[200px]'>
									{item.title ?? 'Geen titel'}
								</span>
							</div>
							<ArrowUpRight className='w-4 h-4 text-gray-400' />
						</Link>
					))}
					{items.length > 5 && (
						<div className='p-2 text-center text-xs text-gray-500'>
							En nog {items.length - 5} meer...
						</div>
					)}
				</div>
			)}
		</div>
	);
}

type ContentSeoSummaryProperties = {
	news: Array<{id: string; title?: string; description?: string; image?: string}>;
	activities: Array<{id: string; title?: string; description?: string; image?: string}>;
};

export function ContentSeoSummary({news, activities}: Readonly<ContentSeoSummaryProperties>) {
	const allItems: ContentItemWithMeta[] = [
		...news.map(item => ({...item, type: 'nieuws' as const})),
		...activities.map(item => ({...item, type: 'activiteiten' as const})),
	];
	const analyses = allItems.map(item => analyzeSeo({title: item.title, description: item.description, image: item.image}));

	const totalScore = analyses.length > 0
		? Math.round(analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length)
		: 0;
	const errorCount = analyses.reduce((sum, a) => sum + a.issues.filter(i => i.type === 'error').length, 0);
	const warningCount = analyses.reduce((sum, a) => sum + a.issues.filter(i => i.type === 'warning').length, 0);
	const missingImages = allItems.filter(item => !item.image).length;
	const perfectItems = analyses.filter(a => a.score === 100).length;
	const needsAttention = analyses.filter(a => a.score < 80).length;

	// Calculate potential score improvement
	const totalQuickWinPoints = analyses.reduce(
		(sum, a) => sum + a.quickWins.reduce((wsum, w) => wsum + w.impact, 0),
		0,
	);
	const potentialScore = Math.min(100, totalScore + Math.round(totalQuickWinPoints / analyses.length));

	return (
		<div className='space-y-4'>
			{/* Main SEO Overview Card */}
			<div className='bg-white rounded-card shadow-base overflow-hidden'>
				<div className='p-4 sm:p-5 border-b border-gray-100'>
					<h3 className='font-semibold text-gray-800 flex items-center gap-2'>
						<Search className='w-4 h-4 text-primary' />
						SEO Overzicht
					</h3>
				</div>

				<div className='p-4 sm:p-5'>
					{/* Overall Score with Improvement Potential */}
					<div className='flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-card'>
						<div className='flex-1'>
							<p className='text-sm text-gray-500'>Gemiddelde SEO Score</p>
							<div className='flex items-baseline gap-2'>
								<p className='text-2xl font-bold text-gray-800'>{totalScore}/100</p>
								{potentialScore > totalScore && (
									<span className='text-sm text-green-600 flex items-center gap-1'>
										<ArrowUpRight className='w-4 h-4' />
										→ {potentialScore} mogelijk
									</span>
								)}
							</div>
						</div>
						<div className={`w-16 h-16 rounded-full flex items-center justify-center ${getSeoScoreBgColor(totalScore)}`}>
							<span className={`text-xl font-bold ${getSeoScoreColor(totalScore)}`}>
								{getSeoScoreLabel(totalScore).charAt(0)}
							</span>
						</div>
					</div>

					{/* Stats Grid */}
					<div className='grid grid-cols-2 sm:grid-cols-5 gap-3'>
						<div className='text-center p-3 bg-gray-50 rounded-button'>
							<p className='text-2xl font-bold text-gray-800'>{allItems.length}</p>
							<p className='text-xs text-gray-500'>Content items</p>
						</div>
						<div className='text-center p-3 bg-green-50 rounded-lg'>
							<p className='text-2xl font-bold text-green-600'>{perfectItems}</p>
							<p className='text-xs text-gray-500'>Perfect</p>
						</div>
						<div className='text-center p-3 bg-yellow-50 rounded-lg'>
							<p className='text-2xl font-bold text-yellow-600'>{needsAttention}</p>
							<p className='text-xs text-gray-500'>Aandacht nodig</p>
						</div>
						<div className='text-center p-3 bg-red-50 rounded-lg'>
							<p className='text-2xl font-bold text-red-600'>{errorCount}</p>
							<p className='text-xs text-gray-500'>Fouten</p>
						</div>
						<div className='text-center p-3 bg-blue-50 rounded-lg'>
							<p className='text-2xl font-bold text-blue-600'>{missingImages}</p>
							<p className='text-xs text-gray-500'>Zonder afbeelding</p>
						</div>
					</div>

					{/* Category Breakdown */}
					<div className='mt-4 grid grid-cols-2 gap-3'>
						<SeoOverviewCard
							items={news.map(item => ({title: item.title, description: item.description, image: item.image}))}
							label='Nieuws'
						/>
						<SeoOverviewCard
							items={activities.map(item => ({title: item.title, description: item.description, image: item.image}))}
							label='Activiteiten'
						/>
					</div>
				</div>
			</div>

			{/* Issue Breakdown */}
			<SeoIssueBreakdown items={allItems} />

			{/* SEO Audit Panel */}
			<SeoAuditPanel items={allItems} maxItems={5} />
		</div>
	);
}
