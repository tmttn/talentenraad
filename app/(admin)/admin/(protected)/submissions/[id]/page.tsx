import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {eq} from 'drizzle-orm';
import {db, submissions} from '@lib/db';
import {SubmissionActions} from '@features/admin/submission-actions';

export const metadata: Metadata = {
	title: 'Bericht details',
};

type PageProperties = {
	params: Promise<{id: string}>;
};

const subjectLabels: Record<string, string> = {
	vraag: 'Algemene vraag',
	activiteit: 'Vraag over activiteit',
	lidmaatschap: 'Lid worden',
	sponsoring: 'Sponsoring',
	anders: 'Anders',
};

export default async function SubmissionDetailPage({params}: Readonly<PageProperties>) {
	const {id} = await params;

	const submission = await db.query.submissions.findFirst({
		where: eq(submissions.id, id),
	});

	if (!submission) {
		notFound();
	}

	// Mark as read if not already
	if (!submission.readAt) {
		await db.update(submissions)
			.set({readAt: new Date()})
			.where(eq(submissions.id, id));
	}

	const formatDate = (date: Date) => new Intl.DateTimeFormat('nl-BE', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date);

	return (
		<div className='max-w-3xl'>
			<div className='mb-6'>
				<a
					href='/admin/submissions'
					className='text-gray-500 hover:text-gray-700 text-sm font-medium'
				>
					&larr; Terug naar berichten
				</a>
			</div>

			<div className='bg-white rounded-card shadow-base overflow-hidden'>
				<div className='p-6 border-b border-gray-200'>
					<div className='flex justify-between items-start'>
						<div>
							<h1 className='text-2xl font-bold text-gray-800'>{submission.name}</h1>
							<p className='text-gray-500 mt-1'>{submission.email}</p>
							{submission.phone && (
								<p className='text-gray-500'>{submission.phone}</p>
							)}
						</div>
						<SubmissionActions submissionId={submission.id} />
					</div>
				</div>

				<div className='p-6 border-b border-gray-200 bg-gray-50'>
					<div className='grid grid-cols-2 gap-4 text-sm'>
						<div>
							<span className='text-gray-500'>Onderwerp:</span>
							<span className='ml-2 font-medium text-gray-800'>
								{subjectLabels[submission.subject] ?? submission.subject}
							</span>
						</div>
						<div>
							<span className='text-gray-500'>Ontvangen:</span>
							<span className='ml-2 font-medium text-gray-800'>
								{formatDate(submission.createdAt)}
							</span>
						</div>
					</div>
				</div>

				<div className='p-6'>
					<h2 className='text-sm font-medium text-gray-500 mb-3'>Bericht</h2>
					<div className='prose max-w-none'>
						<p className='whitespace-pre-line text-gray-800'>{submission.message}</p>
					</div>
				</div>

				<div className='p-6 border-t border-gray-200 bg-gray-50'>
					<a
						href={`mailto:${submission.email}?subject=Re: ${subjectLabels[submission.subject] ?? submission.subject}`}
						className='inline-flex items-center px-4 py-2 bg-primary text-white font-medium rounded-button hover:bg-primary-hover transition-colors'
					>
						Beantwoorden via e-mail
					</a>
				</div>
			</div>
		</div>
	);
}
