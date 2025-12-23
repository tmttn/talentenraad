import {type NextRequest, NextResponse} from 'next/server';
import {auth0, verifyAdmin} from '@lib/auth0';
import {listContent, getContent} from '@lib/builder-admin';
import {
  db, users, submissions, auditLogs, pushSubscriptions, notificationHistory,
} from '@lib/db';
import {isNull, eq} from 'drizzle-orm';
import type {ContentType, ExportData, ExportMetadata} from '@lib/data-export';
import type {BuilderModel} from '@lib/builder-types';

const builderModels = new Set<ContentType>(['nieuws', 'activiteit', 'aankondiging', 'sponsor']);

function isBuilderModel(type: ContentType): type is BuilderModel {
  return builderModels.has(type);
}

export async function GET(request: NextRequest) {
  const session = await auth0.getSession();

  if (!session?.user) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  if (!await verifyAdmin(session.user.email)) {
    return NextResponse.json({error: 'Forbidden'}, {status: 403});
  }

  const searchParameters = request.nextUrl.searchParams;
  const typesParam = searchParameters.get('types');
  const idParam = searchParameters.get('id');
  const includeArchived = searchParameters.get('includeArchived') === 'true';

  if (!typesParam) {
    return NextResponse.json({error: 'Missing types parameter'}, {status: 400});
  }

  const types = typesParam.split(',') as ContentType[];

  // Validate all types
  const validTypes: ContentType[] = [
    'nieuws',
    'activiteit',
    'aankondiging',
    'sponsor',
    'users',
    'submissions',
    'auditLogs',
    'pushSubscriptions',
    'notificationHistory',
  ];

  for (const type of types) {
    if (!validTypes.includes(type)) {
      return NextResponse.json({error: `Invalid type: ${type}`}, {status: 400});
    }
  }

  // Single item export by ID
  if (idParam && types.length === 1) {
    return handleSingleItemExport(types[0], idParam);
  }

  try {
    const exports: Record<string, ExportData<unknown>> = {};

    for (const type of types) {
      if (isBuilderModel(type)) {
        // Builder.io content
        const items = await listContent(type);
        const metadata: ExportMetadata = {
          version: '1.0',
          exportDate: new Date().toISOString(),
          contentType: type,
          itemCount: items.length,
          source: 'builder',
        };
        exports[type] = {metadata, items};
      } else {
        // Database content
        let items: unknown[] = [];

        switch (type) {
          case 'users': {
            const allUsers = await db.query.users.findMany({
              orderBy: (users, {desc}) => [desc(users.createdAt)],
            });
            // Exclude auth0Id for security
            items = allUsers.map(({auth0Id: _, ...user}) => user);
            break;
          }

          case 'submissions': {
            const query = includeArchived
              ? db.query.submissions.findMany({
                orderBy: (submissions, {desc}) => [desc(submissions.createdAt)],
              })
              : db.query.submissions.findMany({
                where: isNull(submissions.archivedAt),
                orderBy: (submissions, {desc}) => [desc(submissions.createdAt)],
              });
            items = await query;
            break;
          }

          case 'auditLogs': {
            items = await db.query.auditLogs.findMany({
              orderBy: (auditLogs, {desc}) => [desc(auditLogs.createdAt)],
              limit: 1000, // Limit to prevent huge exports
            });
            break;
          }

          case 'pushSubscriptions': {
            items = await db.query.pushSubscriptions.findMany({
              orderBy: (pushSubscriptions, {desc}) => [desc(pushSubscriptions.createdAt)],
            });
            break;
          }

          case 'notificationHistory': {
            items = await db.query.notificationHistory.findMany({
              orderBy: (notificationHistory, {desc}) => [desc(notificationHistory.sentAt)],
            });
            break;
          }
        }

        const metadata: ExportMetadata = {
          version: '1.0',
          exportDate: new Date().toISOString(),
          contentType: type,
          itemCount: items.length,
          source: 'database',
        };
        exports[type] = {metadata, items};
      }
    }

    // If single type, return just that export for cleaner file
    if (types.length === 1) {
      const singleExport = exports[types[0]];
      const filename = `export-${types[0]}-${new Date().toISOString().split('T')[0]}.json`;

      return new NextResponse(JSON.stringify(singleExport, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    // Multiple types: return combined export
    const filename = `export-combined-${new Date().toISOString().split('T')[0]}.json`;

    return new NextResponse(JSON.stringify(exports, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json({error: 'Failed to export data'}, {status: 500});
  }
}

async function handleSingleItemExport(
  type: ContentType,
  id: string,
): Promise<NextResponse> {
  try {
    let item: unknown = null;
    let itemName = id;

    if (isBuilderModel(type)) {
      // Builder.io content
      const content = await getContent(type, id);
      if (!content) {
        return NextResponse.json({error: 'Item not found'}, {status: 404});
      }

      item = content;
      itemName = content.name ?? id;
    } else {
      // Database content
      switch (type) {
        case 'users': {
          const user = await db.query.users.findFirst({
            where: eq(users.id, id),
          });
          if (!user) {
            return NextResponse.json({error: 'User not found'}, {status: 404});
          }

          // Exclude auth0Id for security
          const {auth0Id: _, ...safeUser} = user;
          item = safeUser;
          itemName = user.name ?? user.email;
          break;
        }

        case 'submissions': {
          const submission = await db.query.submissions.findFirst({
            where: eq(submissions.id, id),
          });
          if (!submission) {
            return NextResponse.json({error: 'Submission not found'}, {status: 404});
          }

          item = submission;
          itemName = `${submission.name}-${submission.subject}`;
          break;
        }

        case 'auditLogs': {
          const log = await db.query.auditLogs.findFirst({
            where: eq(auditLogs.id, id),
          });
          if (!log) {
            return NextResponse.json({error: 'Audit log not found'}, {status: 404});
          }

          item = log;
          itemName = `${log.actionType}-${log.resourceType}`;
          break;
        }

        case 'pushSubscriptions': {
          const subscription = await db.query.pushSubscriptions.findFirst({
            where: eq(pushSubscriptions.id, id),
          });
          if (!subscription) {
            return NextResponse.json({error: 'Push subscription not found'}, {status: 404});
          }

          item = subscription;
          itemName = subscription.id;
          break;
        }

        case 'notificationHistory': {
          const notification = await db.query.notificationHistory.findFirst({
            where: eq(notificationHistory.id, id),
          });
          if (!notification) {
            return NextResponse.json({error: 'Notification not found'}, {status: 404});
          }

          item = notification;
          itemName = notification.title ?? notification.id;
          break;
        }
      }
    }

    const metadata: ExportMetadata = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      contentType: type,
      itemCount: 1,
      source: isBuilderModel(type) ? 'builder' : 'database',
    };

    const exportData: ExportData<unknown> = {
      metadata,
      items: [item],
    };

    // Sanitize filename
    const safeItemName = itemName
      .toLowerCase()
      .replaceAll(/[^a-z\d-]/g, '-')
      .replaceAll(/-+/g, '-')
      .slice(0, 50);

    const filename = `export-${type}-${safeItemName}-${new Date().toISOString().split('T')[0]}.json`;

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting single item:', error);
    return NextResponse.json({error: 'Failed to export item'}, {status: 500});
  }
}
