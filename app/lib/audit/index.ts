import {type NextRequest} from 'next/server';
import {eq, lt} from 'drizzle-orm';
import {db, auditLogs, users, type AuditActionType} from '@lib/db';

type AuditContext = {
	request: NextRequest;
	session: {
		user: {
			email?: string | null;
			name?: string | null;
			sub?: string;
		};
	} | null;
};

type LogAuditParams = {
	actionType: AuditActionType;
	resourceType: string;
	resourceId?: string | null;
	dataBefore?: Record<string, unknown> | null;
	dataAfter?: Record<string, unknown> | null;
	metadata?: Record<string, unknown> | null;
	context: AuditContext;
};

/**
 * Extract IP address from request headers.
 * Handles Vercel/proxy forwarded headers.
 */
function getIpAddress(request: NextRequest): string | null {
	// Check various headers in order of reliability
	const forwardedFor = request.headers.get('x-forwarded-for');
	if (forwardedFor) {
		// x-forwarded-for can contain multiple IPs, take the first (client)
		return forwardedFor.split(',')[0].trim();
	}

	const realIp = request.headers.get('x-real-ip');
	if (realIp) {
		return realIp;
	}

	// Vercel-specific header
	const vercelForwardedFor = request.headers.get('x-vercel-forwarded-for');
	if (vercelForwardedFor) {
		return vercelForwardedFor.split(',')[0].trim();
	}

	return null;
}

/**
 * Get user agent from request.
 */
function getUserAgent(request: NextRequest): string | null {
	return request.headers.get('user-agent');
}

/**
 * Log an audit event.
 */
export async function logAudit({
	actionType,
	resourceType,
	resourceId,
	dataBefore,
	dataAfter,
	metadata,
	context,
}: LogAuditParams): Promise<void> {
	try {
		const userEmail = context.session?.user?.email?.toLowerCase() ?? 'unknown';
		const userName = context.session?.user?.name ?? null;

		// Look up user ID from database
		let userId: string | null = null;
		if (userEmail !== 'unknown') {
			const user = await db.query.users.findFirst({
				where: eq(users.email, userEmail),
			});
			userId = user?.id ?? null;
		}

		await db.insert(auditLogs).values({
			actionType,
			resourceType,
			resourceId: resourceId ?? null,
			userId,
			userEmail,
			userName,
			ipAddress: getIpAddress(context.request),
			userAgent: getUserAgent(context.request),
			requestPath: context.request.nextUrl.pathname,
			requestMethod: context.request.method,
			dataBefore: dataBefore ?? null,
			dataAfter: dataAfter ?? null,
			metadata: metadata ?? null,
		});
	} catch (error) {
		// Log error but don't throw - audit logging should not break the main operation
		console.error('Failed to log audit event:', error);
	}
}

/**
 * Convenience wrapper for creating audit context.
 */
export function createAuditContext(
	request: NextRequest,
	session: AuditContext['session'],
): AuditContext {
	return {request, session};
}

/**
 * Clean up audit logs older than retention period.
 * @param retentionDays - Number of days to retain logs (default 90)
 */
export async function cleanupOldAuditLogs(retentionDays = 90): Promise<number> {
	const cutoffDate = new Date();
	cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

	const result = await db
		.delete(auditLogs)
		.where(lt(auditLogs.createdAt, cutoffDate))
		.returning({id: auditLogs.id});

	return result.length;
}

export type {AuditContext, LogAuditParams};
