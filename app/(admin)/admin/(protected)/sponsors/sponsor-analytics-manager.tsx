'use client';

import {useState, useMemo} from 'react';
import {
	BarChart3,
	MousePointerClick,
	Eye,
	TrendingUp,
	Calendar,
	Building2,
	ArrowUpDown,
	ArrowUp,
	ArrowDown,
} from 'lucide-react';
import type {SponsorAnalytics} from '@lib/db/schema';

type SponsorAnalyticsManagerProperties = {
	initialAnalytics: SponsorAnalytics[];
};

type AggregatedSponsor = {
	sponsorId: string;
	sponsorName: string;
	totalImpressions: number;
	totalClicks: number;
	ctr: number;
	lastSeen: Date;
	dailyData: Array<{
		date: Date;
		impressions: number;
		clicks: number;
	}>;
};

type SortField = 'name' | 'impressions' | 'clicks' | 'ctr';
type SortDirection = 'asc' | 'desc';

function formatNumber(value: number): string {
	if (value >= 1_000_000) {
		return `${(value / 1_000_000).toFixed(1)}M`;
	}

	if (value >= 1000) {
		return `${(value / 1000).toFixed(1)}K`;
	}

	return value.toString();
}

function formatDate(date: Date): string {
	return new Intl.DateTimeFormat('nl-NL', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	}).format(date);
}

export function SponsorAnalyticsManager({initialAnalytics}: Readonly<SponsorAnalyticsManagerProperties>) {
	const [sortField, setSortField] = useState<SortField>('impressions');
	const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
	const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

	// Filter by date range
	const filteredAnalytics = useMemo(() => {
		if (dateRange === 'all') {
			return initialAnalytics;
		}

		const now = new Date();
		const daysAgo = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
		const cutoff = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

		return initialAnalytics.filter(a => new Date(a.date) >= cutoff);
	}, [initialAnalytics, dateRange]);

	// Aggregate by sponsor
	const aggregatedSponsors = useMemo(() => {
		const sponsorMap = new Map<string, AggregatedSponsor>();

		for (const record of filteredAnalytics) {
			const existing = sponsorMap.get(record.sponsorId);

			if (existing) {
				existing.totalImpressions += record.impressions;
				existing.totalClicks += record.clicks;
				if (new Date(record.date) > existing.lastSeen) {
					existing.lastSeen = new Date(record.date);
				}

				existing.dailyData.push({
					date: new Date(record.date),
					impressions: record.impressions,
					clicks: record.clicks,
				});
			} else {
				sponsorMap.set(record.sponsorId, {
					sponsorId: record.sponsorId,
					sponsorName: record.sponsorName,
					totalImpressions: record.impressions,
					totalClicks: record.clicks,
					ctr: 0,
					lastSeen: new Date(record.date),
					dailyData: [{
						date: new Date(record.date),
						impressions: record.impressions,
						clicks: record.clicks,
					}],
				});
			}
		}

		// Calculate CTR
		for (const sponsor of sponsorMap.values()) {
			sponsor.ctr = sponsor.totalImpressions > 0
				? (sponsor.totalClicks / sponsor.totalImpressions) * 100
				: 0;
		}

		return [...sponsorMap.values()];
	}, [filteredAnalytics]);

	// Sort sponsors
	const sortedSponsors = useMemo(() => {
		const sorted = [...aggregatedSponsors];

		sorted.sort((a, b) => {
			let comparison = 0;

			switch (sortField) {
				case 'name': {
					comparison = a.sponsorName.localeCompare(b.sponsorName);
					break;
				}

				case 'impressions': {
					comparison = a.totalImpressions - b.totalImpressions;
					break;
				}

				case 'clicks': {
					comparison = a.totalClicks - b.totalClicks;
					break;
				}

				case 'ctr': {
					comparison = a.ctr - b.ctr;
					break;
				}
			}

			return sortDirection === 'desc' ? -comparison : comparison;
		});

		return sorted;
	}, [aggregatedSponsors, sortField, sortDirection]);

	// Calculate totals
	const totals = useMemo(() => {
		const totalImpressions = aggregatedSponsors.reduce((sum, s) => sum + s.totalImpressions, 0);
		const totalClicks = aggregatedSponsors.reduce((sum, s) => sum + s.totalClicks, 0);
		const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

		return {
			sponsors: aggregatedSponsors.length,
			impressions: totalImpressions,
			clicks: totalClicks,
			ctr: avgCtr,
		};
	}, [aggregatedSponsors]);

	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
		} else {
			setSortField(field);
			setSortDirection('desc');
		}
	};

	const getSortIcon = (field: SortField) => {
		if (sortField !== field) {
			return <ArrowUpDown className='w-4 h-4 text-gray-400' />;
		}

		return sortDirection === 'desc'
			? <ArrowDown className='w-4 h-4 text-primary' />
			: <ArrowUp className='w-4 h-4 text-primary' />;
	};

	if (initialAnalytics.length === 0) {
		return (
			<div className='text-center py-12'>
				<BarChart3 className='w-12 h-12 text-gray-400 mx-auto mb-4' />
				<h2 className='text-lg font-medium text-gray-900 mb-2'>Geen analytics data</h2>
				<p className='text-gray-500'>
					Er is nog geen sponsor analytics data verzameld. Voeg sponsors toe en plaats de SponsorBanner component op pagina&apos;s.
				</p>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			{/* Date Range Filter */}
			<div className='flex items-center gap-2'>
				<Calendar className='w-5 h-5 text-gray-500' />
				<span className='text-sm text-gray-600'>Periode:</span>
				<div className='flex gap-1'>
					{(['7d', '30d', '90d', 'all'] as const).map(range => (
						<button
							key={range}
							type='button'
							onClick={() => setDateRange(range)}
							className={`px-3 py-1.5 text-sm rounded-button transition-colors ${
								dateRange === range
									? 'bg-primary text-white'
									: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
							}`}
						>
							{range === '7d' ? '7 dagen' : range === '30d' ? '30 dagen' : range === '90d' ? '90 dagen' : 'Alles'}
						</button>
					))}
				</div>
			</div>

			{/* Summary Cards */}
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
				<div className='bg-white rounded-card p-6 shadow-sm border border-gray-100'>
					<div className='flex items-center gap-3'>
						<div className='p-3 bg-blue-100 rounded-button'>
							<Building2 className='w-5 h-5 text-blue-600' />
						</div>
						<div>
							<p className='text-sm text-gray-500'>Sponsors</p>
							<p className='text-2xl font-bold text-gray-900'>{totals.sponsors}</p>
						</div>
					</div>
				</div>

				<div className='bg-white rounded-card p-6 shadow-sm border border-gray-100'>
					<div className='flex items-center gap-3'>
						<div className='p-3 bg-green-100 rounded-button'>
							<Eye className='w-5 h-5 text-green-600' />
						</div>
						<div>
							<p className='text-sm text-gray-500'>Impressies</p>
							<p className='text-2xl font-bold text-gray-900'>{formatNumber(totals.impressions)}</p>
						</div>
					</div>
				</div>

				<div className='bg-white rounded-card p-6 shadow-sm border border-gray-100'>
					<div className='flex items-center gap-3'>
						<div className='p-3 bg-purple-100 rounded-button'>
							<MousePointerClick className='w-5 h-5 text-purple-600' />
						</div>
						<div>
							<p className='text-sm text-gray-500'>Clicks</p>
							<p className='text-2xl font-bold text-gray-900'>{formatNumber(totals.clicks)}</p>
						</div>
					</div>
				</div>

				<div className='bg-white rounded-card p-6 shadow-sm border border-gray-100'>
					<div className='flex items-center gap-3'>
						<div className='p-3 bg-amber-100 rounded-button'>
							<TrendingUp className='w-5 h-5 text-amber-600' />
						</div>
						<div>
							<p className='text-sm text-gray-500'>CTR (gemiddeld)</p>
							<p className='text-2xl font-bold text-gray-900'>{totals.ctr.toFixed(2)}%</p>
						</div>
					</div>
				</div>
			</div>

			{/* Sponsor Table */}
			<div className='bg-white rounded-card shadow-sm border border-gray-100 overflow-hidden'>
				<div className='overflow-x-auto'>
					<table className='w-full'>
						<thead>
							<tr className='bg-gray-50 border-b border-gray-200'>
								<th className='text-left px-6 py-4'>
									<button
										type='button'
										onClick={() => handleSort('name')}
										className='flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900'
									>
										Sponsor
										{getSortIcon('name')}
									</button>
								</th>
								<th className='text-right px-6 py-4'>
									<button
										type='button'
										onClick={() => handleSort('impressions')}
										className='flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 ml-auto'
									>
										Impressies
										{getSortIcon('impressions')}
									</button>
								</th>
								<th className='text-right px-6 py-4'>
									<button
										type='button'
										onClick={() => handleSort('clicks')}
										className='flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 ml-auto'
									>
										Clicks
										{getSortIcon('clicks')}
									</button>
								</th>
								<th className='text-right px-6 py-4'>
									<button
										type='button'
										onClick={() => handleSort('ctr')}
										className='flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 ml-auto'
									>
										CTR
										{getSortIcon('ctr')}
									</button>
								</th>
								<th className='text-right px-6 py-4'>
									<span className='text-sm font-medium text-gray-600'>Laatst gezien</span>
								</th>
							</tr>
						</thead>
						<tbody>
							{sortedSponsors.map(sponsor => (
								<tr key={sponsor.sponsorId} className='border-b border-gray-100 hover:bg-gray-50'>
									<td className='px-6 py-4'>
										<div className='flex items-center gap-3'>
											<div className='w-10 h-10 rounded-button bg-gray-100 flex items-center justify-center'>
												<Building2 className='w-5 h-5 text-gray-500' />
											</div>
											<div>
												<p className='font-medium text-gray-900'>{sponsor.sponsorName}</p>
												<p className='text-xs text-gray-500 font-mono'>{sponsor.sponsorId.slice(0, 8)}...</p>
											</div>
										</div>
									</td>
									<td className='px-6 py-4 text-right'>
										<span className='font-medium text-gray-900'>{formatNumber(sponsor.totalImpressions)}</span>
									</td>
									<td className='px-6 py-4 text-right'>
										<span className='font-medium text-gray-900'>{formatNumber(sponsor.totalClicks)}</span>
									</td>
									<td className='px-6 py-4 text-right'>
										<span className={`inline-flex px-2 py-1 text-sm font-medium rounded ${
											sponsor.ctr >= 2
												? 'bg-green-100 text-green-700'
												: sponsor.ctr >= 1
													? 'bg-amber-100 text-amber-700'
													: 'bg-gray-100 text-gray-700'
										}`}>
											{sponsor.ctr.toFixed(2)}%
										</span>
									</td>
									<td className='px-6 py-4 text-right'>
										<span className='text-sm text-gray-500'>{formatDate(sponsor.lastSeen)}</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
