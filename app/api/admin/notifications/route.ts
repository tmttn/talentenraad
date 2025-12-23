import {type NextRequest, NextResponse} from 'next/server';
import webpush from 'web-push';
import {desc, inArray, sql} from 'drizzle-orm';
import {auth0, verifyAdmin} from '@lib/auth0';
import {db, pushSubscriptions, notificationHistory} from '@lib/db';
import {logAudit, createAuditContext} from '@lib/audit';

// Configure web-push with VAPID
// Note: VAPID keys must be URL-safe Base64 without "=" padding
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY?.replaceAll('=', '');
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY?.replaceAll('=', '');

let vapidConfigured = false;

if (vapidPublicKey && vapidPrivateKey) {
	try {
		webpush.setVapidDetails(
			'mailto:info@talentenraad.be',
			vapidPublicKey,
			vapidPrivateKey,
		);
		vapidConfigured = true;
	} catch (error) {
		console.error('Failed to configure VAPID:', error);
	}
}

type SendNotificationRequest = {
	title: string;
	body: string;
	url?: string;
	topic?: string;
};

export async function POST(request: NextRequest) {
	const session = await auth0.getSession();

	if (!session?.user) {
		return NextResponse.json({error: 'Unauthorized'}, {status: 401});
	}

	if (!await verifyAdmin(session.user.email)) {
		return NextResponse.json({error: 'Forbidden'}, {status: 403});
	}

	try {
		if (!vapidConfigured) {
			console.error('VAPID keys not configured');
			return NextResponse.json({error: 'Push notifications not configured (VAPID keys missing)'}, {status: 500});
		}

		const {title, body, url, topic} = await request.json() as SendNotificationRequest;

		if (!title || !body) {
			return NextResponse.json({error: 'Title and body required'}, {status: 400});
		}

		// Get all subscriptions
		const subscriptions = await db.query.pushSubscriptions.findMany();

		if (subscriptions.length === 0) {
			return NextResponse.json({
				success: true,
				sent: 0,
				failed: 0,
				message: 'Geen abonnees gevonden',
			});
		}

		// Get sender user
		const sender = await db.query.users.findFirst({
			where: (table, {eq}) => eq(table.email, session.user.email!),
		});

		// Track results
		let successCount = 0;
		let failureCount = 0;
		const failedEndpoints: string[] = [];
		const errors: Array<{endpoint: string; message: string; statusCode?: number; body?: string}> = [];

		// Send notifications
		const payload = JSON.stringify({
			title,
			body,
			url,
			icon: '/favicons/android-chrome-192x192.png',
		});

		await Promise.all(subscriptions.map(async sub => {
			try {
				await webpush.sendNotification(
					{
						endpoint: sub.endpoint,
						keys: {p256dh: sub.p256dh, auth: sub.auth},
					},
					payload,
				);
				successCount++;
			} catch (error) {
				failureCount++;
				const webPushError = error as {statusCode?: number; body?: string; message?: string};
				const errorInfo = {
					endpoint: sub.endpoint.slice(0, 50) + '...',
					message: error instanceof Error ? error.message : String(error),
					statusCode: webPushError.statusCode,
					body: webPushError.body,
				};
				errors.push(errorInfo);
				console.error('Push notification failed:', errorInfo);
				// Mark for cleanup if subscription is invalid:
				// - 410 Gone: subscription expired
				// - 404 Not Found: subscription doesn't exist
				// - 403 Forbidden: VAPID key mismatch (subscription created with different keys)
				if ([403, 404, 410].includes(webPushError.statusCode ?? 0)) {
					failedEndpoints.push(sub.endpoint);
				}
			}
		}));

		// Clean up invalid subscriptions
		if (failedEndpoints.length > 0) {
			await db.delete(pushSubscriptions).where(inArray(pushSubscriptions.endpoint, failedEndpoints));
		}

		// Log notification to history
		await db.insert(notificationHistory).values({
			title,
			body,
			url,
			topic,
			sentBy: sender?.id,
			recipientCount: subscriptions.length,
			successCount,
			failureCount,
		});

		// Log to audit trail
		await logAudit({
			actionType: 'create',
			resourceType: 'notification',
			dataAfter: {
				title,
				body,
				url,
				topic,
				recipientCount: subscriptions.length,
				successCount,
				failureCount,
				cleanedSubscriptions: failedEndpoints.length,
			},
			context: createAuditContext(request, session),
		});

		return NextResponse.json({
			success: true,
			sent: successCount,
			failed: failureCount,
			cleaned: failedEndpoints.length,
			// Include error details for debugging (only first 3)
			errors: errors.slice(0, 3),
		});
	} catch (error) {
		console.error('Send notification error:', error);
		return NextResponse.json({error: 'Failed to send notifications'}, {status: 500});
	}
}

export async function GET(request: NextRequest) {
	const session = await auth0.getSession();

	if (!session?.user) {
		return NextResponse.json({error: 'Unauthorized'}, {status: 401});
	}

	if (!await verifyAdmin(session.user.email)) {
		return NextResponse.json({error: 'Forbidden'}, {status: 403});
	}

	const searchParams = request.nextUrl.searchParams;
	const limit = Math.min(Number(searchParams.get('limit') ?? '20'), 100);

	try {
		const history = await db.query.notificationHistory.findMany({
			orderBy: [desc(notificationHistory.sentAt)],
			limit,
		});

		// Get subscriber count
		const subscriberCountResult = await db
			.select({count: sql<number>`count(*)`})
			.from(pushSubscriptions);

		const subscriberCount = Number(subscriberCountResult[0]?.count ?? 0);

		return NextResponse.json({
			history,
			subscriberCount,
		});
	} catch (error) {
		console.error('Error fetching notification history:', error);
		return NextResponse.json({error: 'Failed to fetch history'}, {status: 500});
	}
}
