import {Suspense} from 'react';
import {db} from '@/lib/db';
import {TableSkeleton} from '@components/skeletons';
import {UsersManager} from './users-manager';

function getProtectedEmails(): string[] {
	const emails = process.env.ADMIN_EMAILS ?? '';
	return emails.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
}

async function UsersLoader() {
	const allUsers = await db.query.users.findMany({
		orderBy: (users, {desc}) => [desc(users.createdAt)],
	});

	const protectedEmails = getProtectedEmails();

	return <UsersManager initialUsers={allUsers} protectedEmails={protectedEmails} />;
}

export default function UsersAdminPage() {
	return (
		<div>
			<h1 className='text-3xl font-bold text-gray-800 mb-8'>Gebruikers</h1>
			<Suspense fallback={<TableSkeleton rows={6} />}>
				<UsersLoader />
			</Suspense>
		</div>
	);
}
