import {type NextRequest, NextResponse} from 'next/server';
import {auth0, isAdminEmail} from '@/lib/auth0';
import {db, users} from '@/lib/db';
import {eq} from 'drizzle-orm';

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
		};

		// Check if user exists
		const existingUser = await db.query.users.findFirst({
			where: eq(users.id, id),
		});

		if (!existingUser) {
			return NextResponse.json({error: 'User not found'}, {status: 404});
		}

		// Prevent removing admin from yourself
		if (session?.user?.email?.toLowerCase() === existingUser.email && body.isAdmin === false) {
			return NextResponse.json({error: 'Cannot remove admin from yourself'}, {status: 400});
		}

		const [updatedUser] = await db.update(users)
			.set({
				name: body.name !== undefined ? body.name : existingUser.name,
				isAdmin: body.isAdmin !== undefined ? body.isAdmin : existingUser.isAdmin,
				updatedAt: new Date(),
			})
			.where(eq(users.id, id))
			.returning();

		return NextResponse.json({success: true, user: updatedUser});
	} catch (error) {
		console.error('Error updating user:', error);
		return NextResponse.json({error: 'Failed to update user'}, {status: 500});
	}
}

export async function DELETE(
	_request: NextRequest,
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

		await db.delete(users).where(eq(users.id, id));

		return NextResponse.json({success: true});
	} catch (error) {
		console.error('Error deleting user:', error);
		return NextResponse.json({error: 'Failed to delete user'}, {status: 500});
	}
}
