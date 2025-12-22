import {NextResponse} from 'next/server';
import {inArray, isNull} from 'drizzle-orm';
import {db, feedback} from '@/lib/db';

/**
 * PATCH /api/admin/feedback
 * Mark feedback as read
 */
export async function PATCH(request: Request) {
	try {
		const body = await request.json() as {action?: string; ids?: string[]};

		if (body.action === 'markAllRead') {
			// Mark all unread feedback as read
			await db.update(feedback)
				.set({readAt: new Date()})
				.where(isNull(feedback.readAt));

			return NextResponse.json({success: true});
		}

		if (body.ids && Array.isArray(body.ids) && body.ids.length > 0) {
			// Mark specific feedback items as read
			await db.update(feedback)
				.set({readAt: new Date()})
				.where(inArray(feedback.id, body.ids));

			return NextResponse.json({success: true});
		}

		return NextResponse.json(
			{error: 'Invalid action or missing IDs'},
			{status: 400},
		);
	} catch (error) {
		console.error('Error marking feedback as read:', error);
		return NextResponse.json(
			{error: 'Failed to mark feedback as read'},
			{status: 500},
		);
	}
}

/**
 * DELETE /api/admin/feedback
 * Delete multiple feedback items
 */
export async function DELETE(request: Request) {
	try {
		const body = await request.json() as {ids?: string[]};

		if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
			return NextResponse.json(
				{error: 'IDs are required'},
				{status: 400},
			);
		}

		await db.delete(feedback).where(inArray(feedback.id, body.ids));

		return NextResponse.json({success: true});
	} catch (error) {
		console.error('Error deleting feedback:', error);
		return NextResponse.json(
			{error: 'Failed to delete feedback'},
			{status: 500},
		);
	}
}
