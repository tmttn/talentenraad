import {type NextRequest, NextResponse} from 'next/server';
import {auth0, isAdminEmail} from '@/lib/auth0';
import {db, users} from '@/lib/db';
import {eq} from 'drizzle-orm';
import {sendInvitationEmail} from '@/lib/email/resend';
import {logAudit, createAuditContext} from '@/lib/audit';
import {computeDataDiff} from '@/lib/audit/helpers';

type RouteContext = {
	params: Promise<{id: string}>;
};

async function checkAdminAccess(session: Awaited<ReturnType<typeof auth0.getSession>>): Promise<boolean> {
	if (!session?.user) return false;

	if (isAdminEmail(session.user.email)) return true;

	const currentUser = await db.query.users.findFirst({
		where: eq(users.email, session.user.email?.toLowerCase() ?? ''),
	});

	return currentUser?.isAdmin ?? false;
}

export async function GET(
	_request: NextRequest,
	context: RouteContext,
) {
	const session = await auth0.getSession();

	if (!await checkAdminAccess(session)) {
		return NextResponse.json({error: 'Forbidden'}, {status: 403});
	}

	const {id} = await context.params;

	try {
		const user = await db.query.users.findFirst({
			where: eq(users.id, id),
		});

		if (!user) {
			return NextResponse.json({error: 'User not found'}, {status: 404});
		}

		return NextResponse.json({user});
	} catch (error) {
		console.error('Error fetching user:', error);
		return NextResponse.json({error: 'Failed to fetch user'}, {status: 500});
	}
}

export async function PUT(
	request: NextRequest,
	context: RouteContext,
) {
	const session = await auth0.getSession();

	if (!await checkAdminAccess(session)) {
		return NextResponse.json({error: 'Forbidden'}, {status: 403});
	}

	const {id} = await context.params;

	try {
		const body = await request.json() as {
			name?: string;
			isAdmin?: boolean;
			resendInvitation?: boolean;
		};

		// Check if user exists
		const existingUser = await db.query.users.findFirst({
			where: eq(users.id, id),
		});

		if (!existingUser) {
			return NextResponse.json({error: 'User not found'}, {status: 404});
		}

		// Handle resend invitation
		if (body.resendInvitation) {
			const [updatedUser] = await db.update(users)
				.set({
					invitedAt: new Date(),
					updatedAt: new Date(),
				})
				.where(eq(users.id, id))
				.returning();

			// Send invitation email
			try {
				await sendInvitationEmail({
					email: updatedUser.email,
					name: updatedUser.name ?? undefined,
					inviterName: session?.user?.name ?? session?.user?.email ?? undefined,
				});
			} catch (error) {
				console.error('Failed to send invitation email:', error);
				return NextResponse.json({
					error: 'Uitnodigingsmail kon niet worden verstuurd. Controleer de Resend configuratie.',
				}, {status: 500});
			}

			// Log audit event for resend invitation
			await logAudit({
				actionType: 'update',
				resourceType: 'user',
				resourceId: id,
				dataBefore: {invitedAt: existingUser.invitedAt},
				dataAfter: {invitedAt: updatedUser.invitedAt},
				metadata: {action: 'resend_invitation'},
				context: createAuditContext(request, session),
			});

			return NextResponse.json({success: true, user: updatedUser});
		}

		// Prevent removing admin from yourself
		if (session?.user?.email?.toLowerCase() === existingUser.email && body.isAdmin === false) {
			return NextResponse.json({error: 'Cannot remove admin from yourself'}, {status: 400});
		}

		// Prevent removing admin from protected admin emails
		if (isAdminEmail(existingUser.email) && body.isAdmin === false) {
			return NextResponse.json({error: 'Cannot remove admin from protected admin email'}, {status: 400});
		}

		const [updatedUser] = await db.update(users)
			.set({
				name: body.name !== undefined ? body.name : existingUser.name,
				isAdmin: body.isAdmin !== undefined ? body.isAdmin : existingUser.isAdmin,
				updatedAt: new Date(),
			})
			.where(eq(users.id, id))
			.returning();

		// Log audit event with before/after diff
		const diff = computeDataDiff(
			{name: existingUser.name, isAdmin: existingUser.isAdmin},
			{name: updatedUser.name, isAdmin: updatedUser.isAdmin},
		);
		if (diff.before ?? diff.after) {
			await logAudit({
				actionType: 'update',
				resourceType: 'user',
				resourceId: id,
				dataBefore: diff.before,
				dataAfter: diff.after,
				context: createAuditContext(request, session),
			});
		}

		return NextResponse.json({success: true, user: updatedUser});
	} catch (error) {
		console.error('Error updating user:', error);
		return NextResponse.json({error: 'Failed to update user'}, {status: 500});
	}
}

export async function DELETE(
	request: NextRequest,
	context: RouteContext,
) {
	const session = await auth0.getSession();

	if (!await checkAdminAccess(session)) {
		return NextResponse.json({error: 'Forbidden'}, {status: 403});
	}

	const {id} = await context.params;

	try {
		// Check if user exists
		const existingUser = await db.query.users.findFirst({
			where: eq(users.id, id),
		});

		if (!existingUser) {
			return NextResponse.json({error: 'User not found'}, {status: 404});
		}

		// Prevent deleting yourself
		if (session?.user?.email?.toLowerCase() === existingUser.email) {
			return NextResponse.json({error: 'Cannot delete yourself'}, {status: 400});
		}

		// Prevent deleting protected admin emails
		if (isAdminEmail(existingUser.email)) {
			return NextResponse.json({error: 'Cannot delete protected admin email'}, {status: 400});
		}

		await db.delete(users).where(eq(users.id, id));

		// Log audit event
		await logAudit({
			actionType: 'delete',
			resourceType: 'user',
			resourceId: id,
			dataBefore: {
				email: existingUser.email,
				name: existingUser.name,
				isAdmin: existingUser.isAdmin,
			},
			dataAfter: null,
			context: createAuditContext(request, session),
		});

		return NextResponse.json({success: true});
	} catch (error) {
		console.error('Error deleting user:', error);
		return NextResponse.json({error: 'Failed to delete user'}, {status: 500});
	}
}
