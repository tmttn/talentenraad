import {type NextRequest, NextResponse} from 'next/server';
import {db, sponsorAnalytics} from '@/lib/db';
import {eq, and, sql} from 'drizzle-orm';

type TrackEventType = 'impression' | 'click';

type TrackRequestBody = {
	sponsorId: string;
	sponsorName: string;
	eventType: TrackEventType;
};

// Truncate date to start of day (UTC)
function getDateTruncated(): Date {
	const now = new Date();
	return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

// POST: Track sponsor impression or click
export async function POST(request: NextRequest) {
	try {
		const body = await request.json() as TrackRequestBody;

		const {sponsorId, sponsorName, eventType} = body;

		if (!sponsorId || !sponsorName || !eventType) {
			return NextResponse.json(
				{error: 'sponsorId, sponsorName, and eventType are required'},
				{status: 400},
			);
		}

		if (!['impression', 'click'].includes(eventType)) {
			return NextResponse.json(
				{error: 'eventType must be "impression" or "click"'},
				{status: 400},
			);
		}

		const date = getDateTruncated();

		// Use upsert to increment the counter
		const incrementField = eventType === 'impression' ? 'impressions' : 'clicks';

		await db
			.insert(sponsorAnalytics)
			.values({
				sponsorId,
				sponsorName,
				date,
				impressions: eventType === 'impression' ? 1 : 0,
				clicks: eventType === 'click' ? 1 : 0,
			})
			.onConflictDoUpdate({
				target: [sponsorAnalytics.sponsorId, sponsorAnalytics.date],
				set: {
					[incrementField]: sql`${sponsorAnalytics[incrementField]} + 1`,
					updatedAt: new Date(),
				},
			});

		return NextResponse.json({success: true});
	} catch (error) {
		console.error('Error tracking sponsor event:', error);
		return NextResponse.json(
			{error: 'Failed to track event'},
			{status: 500},
		);
	}
}

// GET: Get sponsor analytics (for admin dashboard)
export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const sponsorId = searchParams.get('sponsorId');
		const startDate = searchParams.get('startDate');
		const endDate = searchParams.get('endDate');

		let query = db.select().from(sponsorAnalytics);

		if (sponsorId) {
			query = query.where(eq(sponsorAnalytics.sponsorId, sponsorId)) as typeof query;
		}

		// Note: Date filtering can be added with proper date range queries
		// For now, return all records for the sponsor

		const results = await query;

		// Aggregate totals
		const totals = results.reduce(
			(accumulator, record) => ({
				impressions: accumulator.impressions + record.impressions,
				clicks: accumulator.clicks + record.clicks,
			}),
			{impressions: 0, clicks: 0},
		);

		return NextResponse.json({
			records: results,
			totals,
			ctr: totals.impressions > 0
				? ((totals.clicks / totals.impressions) * 100).toFixed(2)
				: '0.00',
		});
	} catch (error) {
		console.error('Error getting sponsor analytics:', error);
		return NextResponse.json(
			{error: 'Failed to get analytics'},
			{status: 500},
		);
	}
}
