import {desc, isNull} from 'drizzle-orm';
import {db, submissions} from '@/lib/db';
import {SubmissionsTable} from '@/features/admin/submissions-table';

export default async function SubmissionsPage() {
	const allSubmissions = await db.query.submissions.findMany({
		orderBy: [desc(submissions.createdAt)],
		where: isNull(submissions.archivedAt),
	});

	return (
		<div>
			<div className='flex justify-between items-center mb-8'>
				<h1 className='text-3xl font-bold text-gray-800'>Berichten</h1>
				<p className='text-gray-500'>
					{allSubmissions.length} bericht{allSubmissions.length === 1
						? ''
						: 'en'}
				</p>
			</div>

			{allSubmissions.length > 0
				? (
					<SubmissionsTable submissions={allSubmissions} />
				)
				: (
					<div className='bg-white rounded-xl shadow-md p-12 text-center'>
						<p className='text-gray-500 text-lg'>Nog geen berichten ontvangen.</p>
					</div>
				)}
		</div>
	);
}
