import {Suspense} from 'react';
import {desc, isNull, isNotNull, and} from 'drizzle-orm';
import {db, submissions, feedback} from '@/lib/db';
import {SubmissionsPageSkeleton} from '@components/skeletons';
import {SubmissionsPageClient} from './submissions-page-client';

async function SubmissionsLoader() {
	const [inboxSubmissions, archivedSubmissions, feedbackItems] = await Promise.all([
		db.query.submissions.findMany({
			orderBy: [desc(submissions.createdAt)],
			where: isNull(submissions.archivedAt),
		}),
		db.query.submissions.findMany({
			orderBy: [desc(submissions.archivedAt)],
			where: isNotNull(submissions.archivedAt),
		}),
		db.query.feedback.findMany({
			orderBy: [desc(feedback.createdAt)],
		}),
	]);

	// Count unread items
	const unreadSubmissionsCount = inboxSubmissions.filter(s => !s.readAt).length;
	const unreadFeedbackCount = feedbackItems.filter(f => !f.readAt).length;

	return (
		<SubmissionsPageClient
			inboxSubmissions={inboxSubmissions}
			archivedSubmissions={archivedSubmissions}
			feedbackItems={feedbackItems}
			unreadCounts={{
				submissions: unreadSubmissionsCount,
				feedback: unreadFeedbackCount,
			}}
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
