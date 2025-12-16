import {count, isNotNull, isNull} from 'drizzle-orm';
import {db, submissions} from '@/lib/db';

export default async function AdminDashboardPage() {
	const [totalResult] = await db.select({count: count()}).from(submissions);
	const [unreadResult] = await db.select({count: count()})
		.from(submissions)
		.where(isNull(submissions.readAt));
	const [archivedResult] = await db.select({count: count()})
		.from(submissions)
		.where(isNotNull(submissions.archivedAt));

	return (
		<div>
			<h1 className='text-3xl font-bold text-gray-800 mb-8'>Dashboard</h1>
			<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
				<div className='bg-white p-6 rounded-xl shadow-md'>
					<h2 className='text-sm font-medium text-gray-500 mb-2'>Totaal berichten</h2>
					<p className='text-3xl font-bold text-gray-800'>{totalResult.count}</p>
				</div>
				<div className='bg-white p-6 rounded-xl shadow-md'>
					<h2 className='text-sm font-medium text-gray-500 mb-2'>Ongelezen</h2>
					<p className='text-3xl font-bold text-primary'>{unreadResult.count}</p>
				</div>
				<div className='bg-white p-6 rounded-xl shadow-md'>
					<h2 className='text-sm font-medium text-gray-500 mb-2'>Gearchiveerd</h2>
					<p className='text-3xl font-bold text-gray-400'>{archivedResult.count}</p>
				</div>
			</div>

			<div className='mt-12'>
				<h2 className='text-xl font-bold text-gray-800 mb-4'>Snelle acties</h2>
				<div className='flex gap-4'>
					<a
						href='/admin/submissions'
						className='px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover transition-colors'
					>
						Bekijk berichten
					</a>
					<a
						href='/'
						target='_blank'
						rel='noopener noreferrer'
						className='px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors'
					>
						Bekijk website
					</a>
				</div>
			</div>
		</div>
	);
}
