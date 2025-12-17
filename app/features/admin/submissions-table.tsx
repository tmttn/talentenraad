'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import type {Submission} from '@/lib/db/index.js';

type SubmissionsTableProperties = {
	submissions: Submission[];
};

const subjectLabels: Record<string, string> = {
	vraag: 'Algemene vraag',
	activiteit: 'Vraag over activiteit',
	lidmaatschap: 'Lid worden',
	sponsoring: 'Sponsoring',
	anders: 'Anders',
};

export function SubmissionsTable({submissions}: Readonly<SubmissionsTableProperties>) {
	const router = useRouter();
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [isProcessing, setIsProcessing] = useState(false);

	const formatDate = (date: Date) => new Intl.DateTimeFormat('nl-BE', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date);

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedIds(new Set(submissions.map(s => s.id)));
		} else {
			setSelectedIds(new Set());
		}
	};

	const handleSelect = (id: string, checked: boolean) => {
		const newIds = new Set(selectedIds);
		if (checked) {
			newIds.add(id);
		} else {
			newIds.delete(id);
		}

		setSelectedIds(newIds);
	};

	const handleBulkAction = async (action: 'markRead' | 'markUnread' | 'archive' | 'delete') => {
		if (selectedIds.size === 0) {
			return;
		}

		const confirmMessage = action === 'delete'
			? `Weet je zeker dat je ${selectedIds.size} bericht(en) wilt verwijderen?`
			: undefined;

		// eslint-disable-next-line no-alert
		if (confirmMessage && !confirm(confirmMessage)) {
			return;
		}

		setIsProcessing(true);
		try {
			const response = await fetch('/api/admin/submissions', {
				method: 'PATCH',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({ids: [...selectedIds], action}),
			});

			if (response.ok) {
				setSelectedIds(new Set());
				router.refresh();
			}
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<div>
			{selectedIds.size > 0 && (
				<div className='mb-4 p-3 sm:p-4 bg-white rounded-xl shadow-md flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4'>
					<span className='text-sm text-gray-600 font-medium'>
						{selectedIds.size} geselecteerd
					</span>
					<div className='flex flex-wrap gap-2'>
						<button
							type='button'
							disabled={isProcessing}
							onClick={() => {
								void handleBulkAction('markRead');
							}}
							className='px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50'
						>
							Gelezen
						</button>
						<button
							type='button'
							disabled={isProcessing}
							onClick={() => {
								void handleBulkAction('markUnread');
							}}
							className='px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50'
						>
							Ongelezen
						</button>
						<button
							type='button'
							disabled={isProcessing}
							onClick={() => {
								void handleBulkAction('archive');
							}}
							className='px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50'
						>
							Archiveren
						</button>
						<button
							type='button'
							disabled={isProcessing}
							onClick={() => {
								void handleBulkAction('delete');
							}}
							className='px-3 py-2 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors disabled:opacity-50'
						>
							Verwijderen
						</button>
					</div>
				</div>
			)}

			<div className='bg-white rounded-xl shadow-md overflow-hidden'>
				<div className='overflow-x-auto'>
					<table className='w-full min-w-[700px]'>
						<thead className='bg-gray-50 border-b border-gray-200'>
							<tr>
								<th className='px-4 sm:px-6 py-4 text-left w-12'>
									<input
										type='checkbox'
										checked={selectedIds.size === submissions.length && submissions.length > 0}
										onChange={event => {
											handleSelectAll(event.target.checked);
										}}
										className='rounded border-gray-300 text-primary focus:ring-primary w-4 h-4'
									/>
								</th>
								<th className='px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
									Status
								</th>
								<th className='px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
									Van
								</th>
								<th className='px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
									Onderwerp
								</th>
								<th className='px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
									Datum
								</th>
								<th className='px-4 sm:px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
									Acties
								</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-gray-200'>
							{submissions.map(submission => (
								<tr
									key={submission.id}
									className={`hover:bg-gray-50 ${submission.readAt ? '' : 'bg-primary/5'}`}
								>
									<td className='px-4 sm:px-6 py-4'>
										<input
											type='checkbox'
											checked={selectedIds.has(submission.id)}
											onChange={event => {
												handleSelect(submission.id, event.target.checked);
											}}
											className='rounded border-gray-300 text-primary focus:ring-primary w-4 h-4'
										/>
									</td>
									<td className='px-4 sm:px-6 py-4'>
										{submission.readAt
											? <span className='text-gray-400 text-sm'>Gelezen</span>
											: <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary'>Nieuw</span>}
									</td>
									<td className='px-4 sm:px-6 py-4'>
										<p className='font-medium text-gray-800'>{submission.name}</p>
										<p className='text-sm text-gray-500'>{submission.email}</p>
									</td>
									<td className='px-4 sm:px-6 py-4 text-sm text-gray-600'>
										{subjectLabels[submission.subject] ?? submission.subject}
									</td>
									<td className='px-4 sm:px-6 py-4 text-sm text-gray-500 whitespace-nowrap'>
										{formatDate(submission.createdAt)}
									</td>
									<td className='px-4 sm:px-6 py-4 text-right'>
										<a
											href={`/admin/submissions/${submission.id}`}
											className='text-primary hover:text-primary-hover font-medium text-sm'
										>
											Bekijken
										</a>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
