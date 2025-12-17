'use client';

import {useState, type FormEvent, type ChangeEvent} from 'react';
import {useRouter} from 'next/navigation';
import {SpinnerIcon, ErrorIcon, ShieldIcon, PencilIcon, TrashIcon} from '@/components/ui/icons';
import type {User} from '@/lib/db/schema';
import {DeleteDialog} from '@/features/admin/delete-dialog';

type UsersManagerProps = {
	initialUsers: User[];
};

const inputStyles = [
	'w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-900',
	'focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none',
	'transition-colors duration-200 text-base',
].join(' ');

type FormData = {
	email: string;
	name: string;
	isAdmin: boolean;
};

const emptyForm: FormData = {
	email: '',
	name: '',
	isAdmin: true,
};

export function UsersManager({initialUsers}: UsersManagerProps) {
	const router = useRouter();
	const [users, setUsers] = useState<User[]>(initialUsers);
	const [isCreating, setIsCreating] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [formData, setFormData] = useState<FormData>(emptyForm);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [deleteUser, setDeleteUser] = useState<User | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleEdit = (user: User) => {
		setEditingId(user.id);
		setFormData({
			email: user.email,
			name: user.name ?? '',
			isAdmin: user.isAdmin,
		});
		setIsCreating(false);
	};

	const handleCreate = () => {
		setIsCreating(true);
		setEditingId(null);
		setFormData(emptyForm);
	};

	const handleCancel = () => {
		setIsCreating(false);
		setEditingId(null);
		setFormData(emptyForm);
		setError(null);
	};

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		setIsSubmitting(true);
		setError(null);

		try {
			if (!formData.email.trim()) {
				throw new Error('E-mail is verplicht');
			}

			const url = editingId
				? `/api/admin/users/${editingId}`
				: '/api/admin/users';

			const body = editingId
				? {name: formData.name || undefined, isAdmin: formData.isAdmin}
				: {email: formData.email, name: formData.name || undefined, isAdmin: formData.isAdmin};

			const response = await fetch(url, {
				method: editingId ? 'PUT' : 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify(body),
			});

			const data = await response.json() as {error?: string; user?: User};

			if (!response.ok) {
				throw new Error(data.error ?? 'Opslaan mislukt');
			}

			handleCancel();
			router.refresh();

			// Update local state
			if (editingId && data.user) {
				setUsers(previous => previous.map(u => u.id === editingId ? data.user! : u));
			} else if (data.user) {
				setUsers(previous => [data.user!, ...previous]);
			}
		} catch (submitError) {
			setError(submitError instanceof Error ? submitError.message : 'Er is een fout opgetreden');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDelete = async () => {
		if (!deleteUser) return;

		const response = await fetch(`/api/admin/users/${deleteUser.id}`, {
			method: 'DELETE',
		});

		const data = await response.json() as {error?: string};

		if (!response.ok) {
			setError(data.error ?? 'Verwijderen mislukt');
			setDeleteUser(null);
			return;
		}

		setUsers(previous => previous.filter(u => u.id !== deleteUser.id));
		setDeleteUser(null);
		router.refresh();
	};

	const handleToggleAdmin = async (user: User) => {
		const response = await fetch(`/api/admin/users/${user.id}`, {
			method: 'PUT',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({isAdmin: !user.isAdmin}),
		});

		const data = await response.json() as {error?: string; user?: User};

		if (!response.ok) {
			setError(data.error ?? 'Status wijzigen mislukt');
			return;
		}

		if (data.user) {
			setUsers(previous => previous.map(u => u.id === user.id ? data.user! : u));
		}

		router.refresh();
	};

	const renderForm = () => (
		<form onSubmit={handleSubmit} className='bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6'>
			<h2 className='text-lg sm:text-xl font-bold text-gray-800 mb-4'>
				{editingId ? 'Gebruiker bewerken' : 'Nieuwe gebruiker'}
			</h2>

			{error && (
				<div className='mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 flex items-start gap-3'>
					<ErrorIcon size='md' className='text-red-500 flex-shrink-0 mt-0.5' />
					<span>{error}</span>
				</div>
			)}

			<div className='space-y-4'>
				<div>
					<label htmlFor='email' className='block text-sm font-semibold text-gray-800 mb-2'>
						E-mail <span className='text-red-500'>*</span>
					</label>
					<input
						type='email'
						id='email'
						value={formData.email}
						onChange={(e: ChangeEvent<HTMLInputElement>) => {
							setFormData(previous => ({...previous, email: e.target.value}));
						}}
						required
						disabled={Boolean(editingId)}
						className={`${inputStyles} ${editingId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
						placeholder='gebruiker@voorbeeld.be'
					/>
					{editingId && (
						<p className='mt-1 text-sm text-gray-500'>E-mail kan niet worden gewijzigd</p>
					)}
				</div>

				<div>
					<label htmlFor='name' className='block text-sm font-semibold text-gray-800 mb-2'>
						Naam
					</label>
					<input
						type='text'
						id='name'
						value={formData.name}
						onChange={(e: ChangeEvent<HTMLInputElement>) => {
							setFormData(previous => ({...previous, name: e.target.value}));
						}}
						className={inputStyles}
						placeholder='Volledige naam'
					/>
				</div>

				<div>
					<label className='flex items-center gap-3 cursor-pointer py-1'>
						<input
							type='checkbox'
							checked={formData.isAdmin}
							onChange={(e: ChangeEvent<HTMLInputElement>) => {
								setFormData(previous => ({...previous, isAdmin: e.target.checked}));
							}}
							className='w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary'
						/>
						<span className='text-gray-700'>Administrator</span>
					</label>
					<p className='mt-1 text-sm text-gray-500'>
						Administrators hebben toegang tot het admin dashboard
					</p>
				</div>
			</div>

			<div className='mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4'>
				<button
					type='button'
					onClick={handleCancel}
					disabled={isSubmitting}
					className='w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50'
				>
					Annuleren
				</button>
				<button
					type='submit'
					disabled={isSubmitting}
					className='w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2'
				>
					{isSubmitting ? (
						<>
							<SpinnerIcon size='sm' className='animate-spin' />
							Bezig...
						</>
					) : (
						'Opslaan'
					)}
				</button>
			</div>
		</form>
	);

	const formatDate = (date: Date) => new Date(date).toLocaleDateString('nl-BE', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	});

	return (
		<div>
			{!isCreating && !editingId && (
				<button
					type='button'
					onClick={handleCreate}
					className='mb-6 px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover transition-colors'
				>
					Nieuwe gebruiker
				</button>
			)}

			{(isCreating || editingId) && renderForm()}

			{error && !isCreating && !editingId && (
				<div className='mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800'>
					{error}
				</div>
			)}

			<div className='bg-white rounded-xl shadow-md overflow-hidden'>
				<div className='overflow-x-auto'>
					<table className='w-full min-w-[600px]'>
						<thead className='bg-gray-50 border-b border-gray-200'>
							<tr>
								<th className='px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
									Gebruiker
								</th>
								<th className='px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
									Status
								</th>
								<th className='px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
									Aangemaakt
								</th>
								<th className='px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider'>
									Acties
								</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-gray-200'>
							{users.length === 0 ? (
								<tr>
									<td colSpan={4} className='px-4 sm:px-6 py-8 text-center text-gray-500'>
										Geen gebruikers gevonden
									</td>
								</tr>
							) : (
								users.map(user => (
									<tr key={user.id} className='hover:bg-gray-50'>
										<td className='px-4 sm:px-6 py-4'>
											<button
												type='button'
												onClick={() => {
													handleEdit(user);
												}}
												className='text-left group'
											>
												<p className='font-medium text-gray-900 group-hover:text-primary transition-colors'>{user.name ?? '-'}</p>
												<p className='text-sm text-gray-500 break-all'>{user.email}</p>
											</button>
										</td>
										<td className='px-4 sm:px-6 py-4'>
											<span className={`px-2 py-1 text-xs font-medium rounded whitespace-nowrap ${
												user.isAdmin
													? 'bg-green-100 text-green-800'
													: 'bg-gray-100 text-gray-600'
											}`}>
												{user.isAdmin ? 'Administrator' : 'Gebruiker'}
											</span>
										</td>
										<td className='px-4 sm:px-6 py-4 text-sm text-gray-500 whitespace-nowrap'>
											{formatDate(user.createdAt)}
										</td>
										<td className='px-4 sm:px-6 py-4 text-right'>
											<div className='flex justify-end gap-1'>
												<button
													type='button'
													onClick={() => {
														void handleToggleAdmin(user);
													}}
													title={user.isAdmin ? 'Admin rechten verwijderen' : 'Admin maken'}
													className='p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300'
												>
													<ShieldIcon size='md' />
												</button>
												<button
													type='button'
													onClick={() => {
														handleEdit(user);
													}}
													title='Bewerken'
													className='p-2 rounded-lg text-primary hover:text-primary-hover hover:bg-primary/10 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary/30'
												>
													<PencilIcon size='md' />
												</button>
												<button
													type='button'
													onClick={() => {
														setDeleteUser(user);
													}}
													title='Verwijderen'
													className='p-2 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-300'
												>
													<TrashIcon size='md' />
												</button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{deleteUser && (
				<DeleteDialog
					title='Gebruiker verwijderen?'
					message={`Weet je zeker dat je ${deleteUser.email} wilt verwijderen?`}
					onConfirm={handleDelete}
					onCancel={() => {
						setDeleteUser(null);
					}}
				/>
			)}
		</div>
	);
}
