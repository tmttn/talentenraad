import {type NextRequest, NextResponse} from 'next/server';
import {auth0, verifyAdmin} from '@/lib/auth0';
import {listContent} from '@/lib/builder-admin';
import {db, users, submissions, auditLogs, pushSubscriptions, notificationHistory} from '@/lib/db';
import {isNull} from 'drizzle-orm';
import type {ContentType, ExportData, ExportMetadata} from '@/lib/data-export';
import type {BuilderModel} from '@/lib/builder-types';

const builderModels = new Set<ContentType>(['nieuws', 'activiteit', 'aankondiging']);

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
	const includeArchived = searchParameters.get('includeArchived') === 'true';

	if (!typesParam) {
		return NextResponse.json({error: 'Missing types parameter'}, {status: 400});
	}

	const types = typesParam.split(',') as ContentType[];

	// Validate all types
	const validTypes: ContentType[] = [
		'nieuws', 'activiteit', 'aankondiging',
		'users', 'submissions', 'auditLogs',
		'pushSubscriptions', 'notificationHistory',
	];

	for (const type of types) {
		if (!validTypes.includes(type)) {
			return NextResponse.json({error: `Invalid type: ${type}`}, {status: 400});
		}
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
