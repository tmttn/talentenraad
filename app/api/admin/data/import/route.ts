import {type NextRequest, NextResponse} from 'next/server';
import {auth0, verifyAdmin} from '@/lib/auth0';
import {createContent, updateContent, getContent} from '@/lib/builder-admin';
import {db, users, submissions, pushSubscriptions} from '@/lib/db';
import {eq} from 'drizzle-orm';
import {logAudit, createAuditContext} from '@/lib/audit';
import {
	type ContentType,
	type ExportData,
	type ImportResult,
	type ImportValidationResult,
	type ConflictItem,
	isValidExportData,
	exportOnlyTypes,
} from '@/lib/data-export';
import type {BuilderModel, Activity, NewsItem, Announcement} from '@/lib/builder-types';
import type {User, Submission, PushSubscription} from '@/lib/db/schema';

const builderModels = new Set<ContentType>(['nieuws', 'activiteit', 'aankondiging']);

function isBuilderModel(type: ContentType): type is BuilderModel {
	return builderModels.has(type);
}

type ImportRequestBody = {
	data: ExportData<unknown>;
	conflictStrategy: 'skip' | 'overwrite';
	preview?: boolean;
};

export async function POST(request: NextRequest) {
	const session = await auth0.getSession();

	if (!session?.user) {
		return NextResponse.json({error: 'Unauthorized'}, {status: 401});
	}

	if (!await verifyAdmin(session.user.email)) {
		return NextResponse.json({error: 'Forbidden'}, {status: 403});
	}

	try {
		const body = await request.json() as ImportRequestBody;

		if (!body.data) {
			return NextResponse.json({error: 'Missing data'}, {status: 400});
		}

		// Validate export data structure
		if (!isValidExportData(body.data)) {
			return NextResponse.json({error: 'Invalid export data format'}, {status: 400});
		}

		const {metadata, items} = body.data;
		const contentType = metadata.contentType;

		// Check if this type can be imported
		if (exportOnlyTypes.includes(contentType)) {
			return NextResponse.json({
				error: `${contentType} kan alleen worden geexporteerd, niet geimporteerd`,
			}, {status: 400});
		}

		// Preview mode - just validate and return summary
		if (body.preview) {
			const validation = await validateImport(contentType, items);
			return NextResponse.json(validation);
		}

		// Actual import
		const result = await performImport(
			contentType,
			items,
			body.conflictStrategy,
			request,
			session,
		);

		return NextResponse.json(result);
	} catch (error) {
		console.error('Error importing data:', error);
		return NextResponse.json({error: 'Failed to import data'}, {status: 500});
	}
}

async function validateImport(
	contentType: ContentType,
	items: unknown[],
): Promise<ImportValidationResult> {
	const errors: string[] = [];
	const warnings: string[] = [];
	const conflicts: ConflictItem[] = [];
	let existingCount = 0;

	if (isBuilderModel(contentType)) {
		// Builder.io content validation
		for (const item of items as Array<Activity | NewsItem | Announcement>) {
			if (!item.id) {
				errors.push('Item missing id field');
				continue;
			}

			if (!item.data) {
				errors.push(`Item ${item.id} missing data field`);
				continue;
			}

			// Check if item already exists
			try {
				const existing = await getContent(contentType, item.id);
				if (existing) {
					existingCount++;
					conflicts.push({
						id: item.id,
						identifier: item.name ?? item.id,
						existingId: existing.id,
					});
				}
			} catch {
				// Item doesn't exist, that's fine
			}
		}
	} else {
		// Database content validation
		switch (contentType) {
			case 'users': {
				for (const item of items as Array<Omit<User, 'auth0Id'>>) {
					if (!item.email) {
						errors.push('User missing email field');
						continue;
					}

					const existing = await db.query.users.findFirst({
						where: eq(users.email, item.email.toLowerCase()),
					});

					if (existing) {
						existingCount++;
						conflicts.push({
							id: item.id ?? item.email,
							identifier: item.name ?? item.email,
							existingId: existing.id,
						});
					}
				}

				break;
			}

			case 'submissions': {
				for (const item of items as Submission[]) {
					if (!item.email || !item.message) {
						errors.push('Submission missing required fields');
						continue;
					}

					if (item.id) {
						const existing = await db.query.submissions.findFirst({
							where: eq(submissions.id, item.id),
						});

						if (existing) {
							existingCount++;
							conflicts.push({
								id: item.id,
								identifier: `${item.name} - ${item.subject}`,
								existingId: existing.id,
							});
						}
					}
				}

				break;
			}

			case 'pushSubscriptions': {
				for (const item of items as PushSubscription[]) {
					if (!item.endpoint) {
						errors.push('Push subscription missing endpoint');
						continue;
					}

					const existing = await db.query.pushSubscriptions.findFirst({
						where: eq(pushSubscriptions.endpoint, item.endpoint),
					});

					if (existing) {
						existingCount++;
						conflicts.push({
							id: item.id ?? item.endpoint,
							identifier: item.endpoint.slice(0, 50) + '...',
							existingId: existing.id,
						});
					}
				}

				break;
			}
		}
	}

	return {
		valid: errors.length === 0,
		errors,
		warnings,
		summary: {
			total: items.length,
			new: items.length - existingCount,
			existing: existingCount,
			conflicts,
		},
	};
}

async function performImport(
	contentType: ContentType,
	items: unknown[],
	conflictStrategy: 'skip' | 'overwrite',
	request: NextRequest,
	session: Awaited<ReturnType<typeof auth0.getSession>>,
): Promise<ImportResult> {
	let imported = 0;
	let skipped = 0;
	const errors: Array<{id: string; error: string}> = [];

	if (isBuilderModel(contentType)) {
		// Builder.io content import
		for (const item of items as Array<Activity | NewsItem | Announcement>) {
			try {
				// Check if exists
				let existing = null;
				try {
					existing = await getContent(contentType, item.id);
				} catch {
					// Doesn't exist
				}

				if (existing) {
					if (conflictStrategy === 'skip') {
						skipped++;
						continue;
					}

					// Overwrite
					await updateContent(contentType, item.id, item.data, {
						publish: item.published === 'published',
						name: item.name,
					});

					await logAudit({
						actionType: 'update',
						resourceType: `content:${contentType}`,
						resourceId: item.id,
						dataBefore: existing.data,
						dataAfter: item.data,
						metadata: {source: 'import', overwrite: true},
						context: createAuditContext(request, session),
					});
				} else {
					// Create new
					await createContent(contentType, item.data, {
						publish: item.published === 'published',
						name: item.name,
					});

					await logAudit({
						actionType: 'create',
						resourceType: `content:${contentType}`,
						resourceId: item.id,
						dataBefore: null,
						dataAfter: item.data,
						metadata: {source: 'import'},
						context: createAuditContext(request, session),
					});
				}

				imported++;
			} catch (error) {
				errors.push({
					id: item.id,
					error: error instanceof Error ? error.message : 'Unknown error',
				});
			}
		}
	} else {
		// Database content import
		switch (contentType) {
			case 'users': {
				for (const item of items as Array<Omit<User, 'auth0Id'>>) {
					try {
						const existing = await db.query.users.findFirst({
							where: eq(users.email, item.email.toLowerCase()),
						});

						if (existing) {
							if (conflictStrategy === 'skip') {
								skipped++;
								continue;
							}

							// Overwrite (update)
							await db.update(users)
								.set({
									name: item.name,
									isAdmin: item.isAdmin,
									updatedAt: new Date(),
								})
								.where(eq(users.id, existing.id));

							await logAudit({
								actionType: 'update',
								resourceType: 'user',
								resourceId: existing.id,
								dataBefore: existing,
								dataAfter: {...existing, name: item.name, isAdmin: item.isAdmin},
								metadata: {source: 'import', overwrite: true},
								context: createAuditContext(request, session),
							});
						} else {
							// Create new
							const [newUser] = await db.insert(users).values({
								email: item.email.toLowerCase(),
								name: item.name,
								isAdmin: item.isAdmin ?? false,
								invitedAt: item.invitedAt ? new Date(item.invitedAt) : new Date(),
							}).returning();

							await logAudit({
								actionType: 'create',
								resourceType: 'user',
								resourceId: newUser.id,
								dataBefore: null,
								dataAfter: newUser,
								metadata: {source: 'import'},
								context: createAuditContext(request, session),
							});
						}

						imported++;
					} catch (error) {
						errors.push({
							id: item.email,
							error: error instanceof Error ? error.message : 'Unknown error',
						});
					}
				}

				break;
			}

			case 'submissions': {
				for (const item of items as Submission[]) {
					try {
						// For submissions, we always create new (no overwrite by ID)
						const [newSubmission] = await db.insert(submissions).values({
							name: item.name,
							email: item.email,
							phone: item.phone,
							subject: item.subject,
							message: item.message,
							createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
							readAt: item.readAt ? new Date(item.readAt) : null,
							archivedAt: item.archivedAt ? new Date(item.archivedAt) : null,
						}).returning();

						await logAudit({
							actionType: 'create',
							resourceType: 'submission',
							resourceId: newSubmission.id,
							dataBefore: null,
							dataAfter: newSubmission,
							metadata: {source: 'import'},
							context: createAuditContext(request, session),
						});

						imported++;
					} catch (error) {
						errors.push({
							id: item.id ?? item.email,
							error: error instanceof Error ? error.message : 'Unknown error',
						});
					}
				}

				break;
			}

			case 'pushSubscriptions': {
				for (const item of items as PushSubscription[]) {
					try {
						const existing = await db.query.pushSubscriptions.findFirst({
							where: eq(pushSubscriptions.endpoint, item.endpoint),
						});

						if (existing) {
							if (conflictStrategy === 'skip') {
								skipped++;
								continue;
							}

							// Overwrite
							await db.update(pushSubscriptions)
								.set({
									p256dh: item.p256dh,
									auth: item.auth,
									userAgent: item.userAgent,
									topics: item.topics,
								})
								.where(eq(pushSubscriptions.id, existing.id));
						} else {
							// Create new
							await db.insert(pushSubscriptions).values({
								endpoint: item.endpoint,
								p256dh: item.p256dh,
								auth: item.auth,
								userAgent: item.userAgent,
								topics: item.topics,
							});
						}

						imported++;
					} catch (error) {
						errors.push({
							id: item.endpoint.slice(0, 50),
							error: error instanceof Error ? error.message : 'Unknown error',
						});
					}
				}

				break;
			}
		}
	}

	return {
		success: errors.length === 0,
		imported,
		skipped,
		errors,
	};
}
