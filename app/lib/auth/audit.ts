import {type NextRequest} from 'next/server';
import {db, auditLogs} from '@lib/db';

/** Records a login or logout; never lets a logging failure break the flow. */
export async function logSessionEvent(
  request: NextRequest,
  actionType: 'login' | 'logout',
  user: {id: string; email: string; name?: string | null},
): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      actionType,
      resourceType: 'session',
      resourceId: null,
      userId: user.id,
      userEmail: user.email,
      userName: user.name ?? null,
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null,
      userAgent: request.headers.get('user-agent'),
      requestPath: request.nextUrl.pathname,
      requestMethod: request.method,
      dataBefore: null,
      dataAfter: null,
    });
  } catch (error) {
    console.error(`Failed to log ${actionType} event:`, error);
  }
}
