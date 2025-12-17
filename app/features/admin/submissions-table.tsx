'use client';

import {useState, useMemo} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {toast} from 'sonner';
import {Eye} from 'lucide-react';
import type {Submission} from '@/lib/db/index.js';
import {TableFilters} from './table-filters';
import {TablePagination} from './table-pagination';
import {SortableHeader, useSorting, type SortDirection} from './sortable-header';

type SubmissionsTableProperties = {
	submissions: Submission[];
	isArchiveView?: boolean;
};

const subjectLabels: Record<string, string> = {
	vraag: 'Algemene vraag',
	activiteit: 'Vraag over activiteit',
	lidmaatschap: 'Lid worden',
	sponsoring: 'Sponsoring',
	anders: 'Anders',
};

const subjectOptions = [
	{value: 'vraag', label: 'Algemene vraag'},
	{value: 'activiteit', label: 'Vraag over activiteit'},
	{value: 'lidmaatschap', label: 'Lid worden'},
	{value: 'sponsoring', label: 'Sponsoring'},
	{value: 'anders', label: 'Anders'},
];

const statusOptions = [
	{value: 'unread', label: 'Ongelezen'},
	{value: 'read', label: 'Gelezen'},
];

export function SubmissionsTable({submissions, isArchiveView = false}: Readonly<SubmissionsTableProperties>) {
	const router = useRouter();
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [isProcessing, setIsProcessing] = useState(false);

	// Filter state
	const [searchQuery, setSearchQuery] = useState('');
	const [subjectFilter, setSubjectFilter] = useState('');
	const [statusFilter, setStatusFilter] = useState('');

	// Pagination state
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(25);

	// Sort state
	const {sortKey, sortDirection, handleSort} = useSorting<Submission>(submissions, 'createdAt', 'desc');

	const formatDate = (date: Date) => new Intl.DateTimeFormat('nl-BE', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date);

	// Filter, sort, and paginate submissions
	const filteredAndSortedSubmissions = useMemo(() => {
		let result = [...submissions];

		// Apply search filter
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				s => s.name.toLowerCase().includes(query) || s.email.toLowerCase().includes(query),
			);
		}

		// Apply subject filter
		if (subjectFilter) {
			result = result.filter(s => s.subject === subjectFilter);
		}

		// Apply status filter
		if (statusFilter) {
			result = result.filter(s => statusFilter === 'read' ? s.readAt !== null : s.readAt === null);
		}

		// Apply sorting
		if (sortKey && sortDirection) {
			result.sort((a, b) => {
				let comparison = 0;
				switch (sortKey) {
					case 'name': {
						comparison = a.name.localeCompare(b.name);
						break;
					}

					case 'subject': {
						comparison = a.subject.localeCompare(b.subject);
						break;
					}

					case 'createdAt': {
						comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
						break;
					}

					default: {
						break;
					}
				}

				return sortDirection === 'desc' ? -comparison : comparison;
			});
		}

		return result;
	}, [submissions, searchQuery, subjectFilter, statusFilter, sortKey, sortDirection]);

	// Pagination calculations
	const totalItems = filteredAndSortedSubmissions.length;
	const totalPages = Math.ceil(totalItems / pageSize);
	const paginatedSubmissions = useMemo(() => {
		const start = (currentPage - 1) * pageSize;
		return filteredAndSortedSubmissions.slice(start, start + pageSize);
	}, [filteredAndSortedSubmissions, currentPage, pageSize]);

	// Reset to page 1 when filters change
	const handleSearchChange = (value: string) => {
		setSearchQuery(value);
		setCurrentPage(1);
	};

	const handleSubjectFilterChange = (value: string) => {
		setSubjectFilter(value);
		setCurrentPage(1);
	};

	const handleStatusFilterChange = (value: string) => {
		setStatusFilter(value);
		setCurrentPage(1);
	};

	const handlePageSizeChange = (size: number) => {
		setPageSize(size);
		setCurrentPage(1);
	};

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedIds(new Set(paginatedSubmissions.map(s => s.id)));
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

	const getActionSuccessMessage = (action: string, count: number): string => {
		const messages: Record<string, string> = {
			markRead: `${count} bericht(en) gemarkeerd als gelezen`,
			markUnread: `${count} bericht(en) gemarkeerd als ongelezen`,
			archive: `${count} bericht(en) gearchiveerd`,
			unarchive: `${count} bericht(en) teruggezet`,
			delete: `${count} bericht(en) verwijderd`,
		};
		return messages[action] ?? 'Actie voltooid';
	};

	const handleBulkAction = async (action: 'markRead' | 'markUnread' | 'archive' | 'unarchive' | 'delete') => {
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
				toast.success(getActionSuccessMessage(action, selectedIds.size));
				setSelectedIds(new Set());
				router.refresh();
			} else {
				toast.error('Er is iets misgegaan');
			}
		} catch {
			toast.error('Er is iets misgegaan');
		} finally {
			setIsProcessing(false);
		}
	};

	const filterConfigs = [
		{
			key: 'subject',
			label: 'Alle onderwerpen',
			options: subjectOptions,
			value: subjectFilter,
			onChange: handleSubjectFilterChange,
		},
		{
			key: 'status',
			label: 'Alle statussen',
			options: statusOptions,
			value: statusFilter,
			onChange: handleStatusFilterChange,
		},
	];

	return (
		<div>
			<TableFilters
				searchValue={searchQuery}
				onSearchChange={handleSearchChange}
				searchPlaceholder='Zoeken op naam of e-mail...'
				filters={filterConfigs}
			/>

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
								void handleBulkAction(isArchiveView ? 'unarchive' : 'archive');
							}}
							className='px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50'
						>
							{isArchiveView ? 'Terugzetten' : 'Archiveren'}
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
										checked={selectedIds.size === paginatedSubmissions.length && paginatedSubmissions.length > 0}
										onChange={event => {
											handleSelectAll(event.target.checked);
										}}
										className='rounded border-gray-300 text-primary focus:ring-primary w-4 h-4'
									/>
								</th>
								<th className='px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
									Status
								</th>
								<th className='px-4 sm:px-6 py-4'>
									<SortableHeader
										label='Van'
										sortKey='name'
										currentSortKey={sortKey}
										currentSortDirection={sortDirection}
										onSort={handleSort}
									/>
								</th>
								<th className='px-4 sm:px-6 py-4'>
									<SortableHeader
										label='Onderwerp'
										sortKey='subject'
										currentSortKey={sortKey}
										currentSortDirection={sortDirection}
										onSort={handleSort}
									/>
								</th>
								<th className='px-4 sm:px-6 py-4'>
									<SortableHeader
										label='Datum'
										sortKey='createdAt'
										currentSortKey={sortKey}
										currentSortDirection={sortDirection}
										onSort={handleSort}
									/>
								</th>
								<th className='px-4 sm:px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
									Acties
								</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-gray-200'>
							{paginatedSubmissions.map(submission => (
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
											: <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary-text'>Nieuw</span>}
									</td>
									<td className='px-4 sm:px-6 py-4'>
										<Link
											href={`/admin/submissions/${submission.id}`}
											className='block group'
										>
											<p className='font-medium text-gray-800 group-hover:text-primary transition-colors'>{submission.name}</p>
											<p className='text-sm text-gray-500'>{submission.email}</p>
										</Link>
									</td>
									<td className='px-4 sm:px-6 py-4 text-sm text-gray-600'>
										{subjectLabels[submission.subject] ?? submission.subject}
									</td>
									<td className='px-4 sm:px-6 py-4 text-sm text-gray-500 whitespace-nowrap'>
										{formatDate(submission.createdAt)}
									</td>
									<td className='px-4 sm:px-6 py-4 text-right'>
										<Link
											href={`/admin/submissions/${submission.id}`}
											className='inline-flex p-2 text-primary hover:text-primary-hover hover:bg-primary/10 rounded-lg transition-colors'
											title='Bekijken'
										>
											<Eye className='w-5 h-5' />
										</Link>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				{totalItems > 0 && (
					<TablePagination
						currentPage={currentPage}
						totalPages={totalPages}
						totalItems={totalItems}
						pageSize={pageSize}
						onPageChange={setCurrentPage}
						onPageSizeChange={handlePageSizeChange}
					/>
				)}
				{totalItems === 0 && (
					<div className='p-8 text-center text-gray-500'>
						{searchQuery || subjectFilter || statusFilter
							? 'Geen berichten gevonden met de huidige filters.'
							: 'Geen berichten gevonden.'}
					</div>
				)}
			</div>
		</div>
	);
}
