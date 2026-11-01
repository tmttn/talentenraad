import {type NextRequest, NextResponse} from 'next/server';
import {
  desc, eq, and, gte, lte, like, sql,
} from 'drizzle-orm';
import {guardAdminApi} from '@lib/auth/api-guard';
import {db, auditLogs, type AuditActionType} from '@lib/db';

export async function GET(request: NextRequest) {
  const guard = await guardAdminApi();

  if (guard.response) {
    return guard.response;
  }

  const {searchParams} = request.nextUrl;
  const page = Number(searchParams.get('page') ?? '1');
  const limit = Math.min(Number(searchParams.get('limit') ?? '50'), 100);
  const actionType = searchParams.get('actionType');
  const resourceType = searchParams.get('resourceType');
  const userEmail = searchParams.get('userEmail');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  const offset = (page - 1) * limit;

  // Build where conditions
  const conditions = [];

  if (actionType) {
    conditions.push(eq(auditLogs.actionType, actionType as AuditActionType));
  }

  if (resourceType) {
    conditions.push(eq(auditLogs.resourceType, resourceType));
  }

  if (userEmail) {
    conditions.push(like(auditLogs.userEmail, `%${userEmail}%`));
  }

  if (startDate) {
    conditions.push(gte(auditLogs.createdAt, new Date(startDate)));
  }

  if (endDate) {
    conditions.push(lte(auditLogs.createdAt, new Date(endDate)));
  }

  try {
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const logs = await db.query.auditLogs.findMany({
      where: whereClause,
      orderBy: [desc(auditLogs.createdAt)],
      limit,
      offset,
    });

    // Get total count for pagination
    const totalResult = await db
      .select({count: sql<number>`count(*)`})
      .from(auditLogs)
      .where(whereClause);

    const total = Number(totalResult[0]?.count ?? 0);

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({error: 'Failed to fetch audit logs'}, {status: 500});
  }
}
