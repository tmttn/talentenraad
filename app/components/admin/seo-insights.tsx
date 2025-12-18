'use client';

import {
	Search,
	AlertTriangle,
	CheckCircle,
	Info,
	TrendingUp,
	FileText,
	Image as ImageIcon,
} from 'lucide-react';
import {
	analyzeSeo,
	getSeoScoreColor,
	getSeoScoreBgColor,
	getSeoScoreLabel,
	type SeoAnalysis,
	type SeoIssue,
} from '@/lib/seo';

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
		<div className='bg-white rounded-xl shadow-md overflow-hidden'>
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
				{/* Quick Stats */}
				<div className='grid grid-cols-3 gap-3'>
					<div className='text-center p-3 bg-gray-50 rounded-lg'>
						<FileText className='w-5 h-5 mx-auto text-gray-500 mb-1' />
						<p className='text-xs text-gray-500'>Titel</p>
						<p className='text-sm font-medium text-gray-800'>
							{title ? `${title.length} tekens` : 'Ontbreekt'}
						</p>
					</div>
					<div className='text-center p-3 bg-gray-50 rounded-lg'>
						<FileText className='w-5 h-5 mx-auto text-gray-500 mb-1' />
						<p className='text-xs text-gray-500'>Beschrijving</p>
						<p className='text-sm font-medium text-gray-800'>
							{description ? `${description.length} tekens` : 'Ontbreekt'}
						</p>
					</div>
					<div className='text-center p-3 bg-gray-50 rounded-lg'>
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
				</div>

				{/* Issues */}
				{showDetails && analysis.issues.length > 0 && (
					<div className='space-y-2'>
						<h4 className='text-sm font-medium text-gray-700'>Aandachtspunten</h4>
						{analysis.issues.map((issue, index) => (
							<div
								key={index}
								className={`flex items-start gap-2 p-2 rounded-lg border ${getIssueColor(issue.type)}`}
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
								className='flex items-start gap-2 p-2 rounded-lg bg-blue-50 border border-blue-200'
							>
								<Info className='w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5' />
								<span className='text-sm text-gray-700'>{suggestion}</span>
							</div>
						))}
					</div>
				)}

				{/* All good message */}
				{analysis.issues.length === 0 && analysis.suggestions.length === 0 && (
					<div className='flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200'>
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
		<div className='bg-white p-4 rounded-xl shadow-md'>
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

type ContentSeoSummaryProperties = {
	news: Array<{title?: string; description?: string; image?: string}>;
	activities: Array<{title?: string; description?: string; image?: string}>;
};

export function ContentSeoSummary({news, activities}: Readonly<ContentSeoSummaryProperties>) {
	const allItems = [...news, ...activities];
	const analyses = allItems.map(item => analyzeSeo(item));

	const totalScore = analyses.length > 0
		? Math.round(analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length)
		: 0;
	const errorCount = analyses.reduce((sum, a) => sum + a.issues.filter(i => i.type === 'error').length, 0);
	const warningCount = analyses.reduce((sum, a) => sum + a.issues.filter(i => i.type === 'warning').length, 0);
	const missingImages = allItems.filter(item => !item.image).length;

	return (
		<div className='bg-white rounded-xl shadow-md overflow-hidden'>
			<div className='p-4 sm:p-5 border-b border-gray-100'>
				<h3 className='font-semibold text-gray-800 flex items-center gap-2'>
					<Search className='w-4 h-4 text-primary' />
					SEO Overzicht
				</h3>
			</div>

			<div className='p-4 sm:p-5'>
				{/* Overall Score */}
				<div className='flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-xl'>
					<div>
						<p className='text-sm text-gray-500'>Gemiddelde SEO Score</p>
						<p className='text-2xl font-bold text-gray-800'>{totalScore}/100</p>
					</div>
					<div className={`w-16 h-16 rounded-full flex items-center justify-center ${getSeoScoreBgColor(totalScore)}`}>
						<span className={`text-xl font-bold ${getSeoScoreColor(totalScore)}`}>
							{getSeoScoreLabel(totalScore).charAt(0)}
						</span>
					</div>
				</div>

				{/* Stats Grid */}
				<div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
					<div className='text-center p-3 bg-gray-50 rounded-lg'>
						<p className='text-2xl font-bold text-gray-800'>{allItems.length}</p>
						<p className='text-xs text-gray-500'>Content items</p>
					</div>
					<div className='text-center p-3 bg-red-50 rounded-lg'>
						<p className='text-2xl font-bold text-red-600'>{errorCount}</p>
						<p className='text-xs text-gray-500'>Fouten</p>
					</div>
					<div className='text-center p-3 bg-yellow-50 rounded-lg'>
						<p className='text-2xl font-bold text-yellow-600'>{warningCount}</p>
						<p className='text-xs text-gray-500'>Waarschuwingen</p>
					</div>
					<div className='text-center p-3 bg-blue-50 rounded-lg'>
						<p className='text-2xl font-bold text-blue-600'>{missingImages}</p>
						<p className='text-xs text-gray-500'>Zonder afbeelding</p>
					</div>
				</div>

				{/* Category Breakdown */}
				<div className='mt-4 grid grid-cols-2 gap-3'>
					<SeoOverviewCard items={news} label='Nieuws' />
					<SeoOverviewCard items={activities} label='Activiteiten' />
				</div>
			</div>
		</div>
	);
}
