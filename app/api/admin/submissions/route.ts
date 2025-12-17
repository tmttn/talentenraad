import {type NextRequest, NextResponse} from 'next/server';
import {auth0, isAdminEmail} from '@/lib/auth0';
import {db, submissions} from '@/lib/db';
import {inArray} from 'drizzle-orm';

type BulkActionRequest = {
	ids: string[];
	action: 'markRead' | 'markUnread' | 'archive' | 'unarchive' | 'delete';
};

export async function PATCH(request: NextRequest) {
	const session = await auth0.getSession();

	// Check authentication
	if (!session?.user) {
		return NextResponse.json({error: 'Unauthorized'}, {status: 401});
	}

	// Check admin access
	if (!isAdminEmail(session.user.email)) {
		return NextResponse.json({error: 'Forbidden'}, {status: 403});
	}

	try {
		const body = await request.json() as BulkActionRequest;

		if (!body.ids || body.ids.length === 0) {
			return NextResponse.json({error: 'No IDs provided'}, {status: 400});
		}

		switch (body.action) {
			case 'markRead': {
				await db.update(submissions)
					.set({readAt: new Date()})
					.where(inArray(submissions.id, body.ids));
				break;
			}

			case 'markUnread': {
				await db.update(submissions)
					.set({readAt: null})
					.where(inArray(submissions.id, body.ids));
				break;
			}

			case 'archive': {
				await db.update(submissions)
					.set({archivedAt: new Date()})
					.where(inArray(submissions.id, body.ids));
				break;
			}

			case 'unarchive': {
				await db.update(submissions)
					.set({archivedAt: null})
					.where(inArray(submissions.id, body.ids));
				break;
			}

			case 'delete': {
				await db.delete(submissions)
					.where(inArray(submissions.id, body.ids));
				break;
			}

			default: {
				return NextResponse.json({error: 'Invalid action'}, {status: 400});
			}
		}

		return NextResponse.json({success: true});
	} catch (error) {
		console.error('Admin submissions error:', error);
		return NextResponse.json(
			{error: 'Internal server error'},
			{status: 500},
		);
	}
}
