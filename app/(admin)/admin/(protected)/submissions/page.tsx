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
			<div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-6 sm:mb-8'>
				<h1 className='text-2xl sm:text-3xl font-bold text-gray-800'>Berichten</h1>
				<p className='text-gray-500 text-sm sm:text-base'>
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
					<div className='bg-white rounded-xl shadow-md p-8 sm:p-12 text-center'>
						<svg className='w-12 h-12 mx-auto text-gray-300 mb-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4' />
						</svg>
						<p className='text-gray-500 text-base sm:text-lg'>Nog geen berichten ontvangen.</p>
					</div>
				)}
		</div>
	);
}
