import {type NextRequest, NextResponse} from 'next/server';
import {auth0, isAdminEmail} from '@/lib/auth0';
import {db, users} from '@/lib/db';
import {eq} from 'drizzle-orm';
import {sendInvitationEmail} from '@/lib/email/resend';

export async function GET() {
	const session = await auth0.getSession();

	if (!session?.user) {
		return NextResponse.json({error: 'Unauthorized'}, {status: 401});
	}

	if (!isAdminEmail(session.user.email)) {
		// Also check if user is admin in database
		const currentUser = await db.query.users.findFirst({
			where: eq(users.email, session.user.email?.toLowerCase() ?? ''),
		});

		if (!currentUser?.isAdmin) {
			return NextResponse.json({error: 'Forbidden'}, {status: 403});
		}
	}

	try {
		const allUsers = await db.query.users.findMany({
			orderBy: (users, {desc}) => [desc(users.createdAt)],
		});

		return NextResponse.json({users: allUsers});
	} catch (error) {
		console.error('Error listing users:', error);
		return NextResponse.json({error: 'Failed to fetch users'}, {status: 500});
	}
}

export async function POST(request: NextRequest) {
	const session = await auth0.getSession();

	if (!session?.user) {
		return NextResponse.json({error: 'Unauthorized'}, {status: 401});
	}

	if (!isAdminEmail(session.user.email)) {
		const currentUser = await db.query.users.findFirst({
			where: eq(users.email, session.user.email?.toLowerCase() ?? ''),
		});

		if (!currentUser?.isAdmin) {
			return NextResponse.json({error: 'Forbidden'}, {status: 403});
		}
	}

	try {
		const body = await request.json() as {
			email: string;
			name?: string;
			isAdmin?: boolean;
		};

		if (!body.email?.trim()) {
			return NextResponse.json({error: 'Email is required'}, {status: 400});
		}

		const email = body.email.toLowerCase().trim();

		// Check if user already exists
		const existingUser = await db.query.users.findFirst({
			where: eq(users.email, email),
		});

		if (existingUser) {
			return NextResponse.json({error: 'User already exists'}, {status: 400});
		}

		const [newUser] = await db.insert(users).values({
			email,
			name: body.name?.trim() ?? undefined,
			isAdmin: body.isAdmin ?? false,
			invitedAt: new Date(),
		}).returning();

		// Send invitation email
		try {
			await sendInvitationEmail({
				email: newUser.email,
				name: newUser.name ?? undefined,
				inviterName: session.user.name ?? session.user.email ?? undefined,
			});
		} catch (error) {
			console.error('Failed to send invitation email:', error);
			return NextResponse.json({
				success: true,
				user: newUser,
				warning: 'Gebruiker aangemaakt maar uitnodigingsmail kon niet worden verstuurd. Controleer de Resend configuratie.',
			});
		}

		return NextResponse.json({success: true, user: newUser});
	} catch (error) {
		console.error('Error creating user:', error);
		return NextResponse.json({error: 'Failed to create user'}, {status: 500});
	}
}
