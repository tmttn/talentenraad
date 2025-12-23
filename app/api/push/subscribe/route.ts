import {type NextRequest, NextResponse} from 'next/server';
import {headers} from 'next/headers';
import {db, pushSubscriptions} from '@lib/db';
import {eq} from 'drizzle-orm';

type SubscriptionData = {
	endpoint: string;
	keys: {
		p256dh: string;
		auth: string;
	};
	topics?: string[];
};

export async function POST(request: NextRequest) {
	try {
		const subscription = await request.json() as SubscriptionData;

		if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
			return NextResponse.json({error: 'Invalid subscription'}, {status: 400});
		}

		const headersList = await headers();
		const userAgent = headersList.get('user-agent');

		// Upsert subscription
		await db.insert(pushSubscriptions)
			.values({
				endpoint: subscription.endpoint,
				p256dh: subscription.keys.p256dh,
				auth: subscription.keys.auth,
				userAgent,
				topics: subscription.topics ?? ['algemeen'],
			})
			.onConflictDoUpdate({
				target: pushSubscriptions.endpoint,
				set: {
					p256dh: subscription.keys.p256dh,
					auth: subscription.keys.auth,
					userAgent,
					topics: subscription.topics ?? ['algemeen'],
					lastUsedAt: new Date(),
				},
			});

		return NextResponse.json({success: true});
	} catch (error) {
		console.error('Push subscription error:', error);
		return NextResponse.json({error: 'Failed to save subscription'}, {status: 500});
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const {endpoint} = await request.json() as {endpoint: string};

		if (!endpoint) {
			return NextResponse.json({error: 'Endpoint required'}, {status: 400});
		}

		await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));

		return NextResponse.json({success: true});
	} catch (error) {
		console.error('Push unsubscribe error:', error);
		return NextResponse.json({error: 'Failed to unsubscribe'}, {status: 500});
	}
}
