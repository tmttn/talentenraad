import type {Metadata} from 'next';
import {Suspense} from 'react';
import {desc} from 'drizzle-orm';
import {db, sponsorAnalytics} from '@lib/db';
import {TableSkeleton} from '@components/skeletons';
import {SponsorAnalyticsManager} from './sponsor-analytics-manager';

export const metadata: Metadata = {
	title: 'Sponsor Analytics',
};

async function SponsorAnalyticsLoader() {
	const analytics = await db.query.sponsorAnalytics.findMany({
		orderBy: [desc(sponsorAnalytics.date)],
		limit: 500,
	});

	return <SponsorAnalyticsManager initialAnalytics={analytics} />;
}

export default function SponsorAnalyticsPage() {
	return (
		<div>
			<h1 className='text-3xl font-bold text-gray-800 mb-8'>Sponsor Analytics</h1>
			<Suspense fallback={<TableSkeleton rows={10} />}>
				<SponsorAnalyticsLoader />
			</Suspense>
		</div>
	);
}
