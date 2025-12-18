import {Suspense} from 'react';
import {desc, isNull, isNotNull} from 'drizzle-orm';
import {db, submissions} from '@/lib/db';
import {SubmissionsPageSkeleton} from '@components/skeletons';
import {SubmissionsPageClient} from './submissions-page-client';

async function SubmissionsLoader() {
	const [inboxSubmissions, archivedSubmissions] = await Promise.all([
		db.query.submissions.findMany({
			orderBy: [desc(submissions.createdAt)],
			where: isNull(submissions.archivedAt),
		}),
		db.query.submissions.findMany({
			orderBy: [desc(submissions.archivedAt)],
			where: isNotNull(submissions.archivedAt),
		}),
	]);

	return (
		<SubmissionsPageClient
			inboxSubmissions={inboxSubmissions}
			archivedSubmissions={archivedSubmissions}
		/>
	);
}

export default function SubmissionsPage() {
	return (
		<Suspense fallback={<SubmissionsPageSkeleton />}>
			<SubmissionsLoader />
		</Suspense>
	);
}
