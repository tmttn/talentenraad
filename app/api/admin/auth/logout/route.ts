import {type NextRequest, NextResponse} from 'next/server';
import {auth0} from '@lib/auth0';
import {db, auditLogs, users} from '@lib/db';
import {eq} from 'drizzle-orm';

export async function GET(request: NextRequest) {
	const session = await auth0.getSession();

	if (session?.user?.email) {
		try {
			// Look up user ID
			const user = await db.query.users.findFirst({
				where: eq(users.email, session.user.email.toLowerCase()),
			});

			// Log the logout event
			await db.insert(auditLogs).values({
				actionType: 'logout',
				resourceType: 'session',
				resourceId: null,
				userId: user?.id ?? null,
				userEmail: session.user.email.toLowerCase(),
				userName: session.user.name ?? null,
				ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null,
				userAgent: request.headers.get('user-agent'),
				requestPath: '/api/admin/auth/logout',
				requestMethod: 'GET',
				dataBefore: null,
				dataAfter: null,
			});
		} catch (error) {
			// Log error but don't prevent logout
			console.error('Failed to log logout event:', error);
		}
	}

	// Redirect to Auth0 logout
	return NextResponse.redirect(new URL('/auth/logout', request.url));
}
