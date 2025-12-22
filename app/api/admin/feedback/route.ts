import {NextResponse} from 'next/server';
import {inArray} from 'drizzle-orm';
import {db, feedback} from '@/lib/db';

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
