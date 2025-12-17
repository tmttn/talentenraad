import {db} from '@/lib/db';
import {UsersManager} from './users-manager';

function getProtectedEmails(): string[] {
	const emails = process.env.ADMIN_EMAILS ?? '';
	return emails.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
}

export default async function UsersAdminPage() {
	const allUsers = await db.query.users.findMany({
		orderBy: (users, {desc}) => [desc(users.createdAt)],
	});

	const protectedEmails = getProtectedEmails();

	return (
		<div>
			<h1 className='text-3xl font-bold text-gray-800 mb-8'>Gebruikers</h1>
			<UsersManager initialUsers={allUsers} protectedEmails={protectedEmails} />
		</div>
	);
}
