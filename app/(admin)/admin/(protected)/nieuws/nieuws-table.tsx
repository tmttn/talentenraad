'use client';

import {useState, useMemo} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {toast} from 'sonner';
import {Star, ExternalLink, Pencil, Trash2} from 'lucide-react';
import type {NewsItem} from '@/lib/builder-types';
import {TableFilters} from '@/features/admin/table-filters';
import {TablePagination} from '@/features/admin/table-pagination';
import {SortableHeader, useSorting} from '@/features/admin/sortable-header';
import {DeleteDialog} from '@/features/admin/delete-dialog';

type NieuwsTableProps = {
	newsItems: NewsItem[];
};

const statusOptions = [
	{value: 'published', label: 'Gepubliceerd'},
	{value: 'draft', label: 'Concept'},
];

const pinnedOptions = [
	{value: 'true', label: 'Vastgepind'},
	{value: 'false', label: 'Niet vastgepind'},
];

function generateSlug(title: string): string {
	return title
		.toLowerCase()
		.normalize('NFD')
		.replaceAll(/[\u0300-\u036F]/g, '')
		.replaceAll(/[^\s\w-]/g, '')
		.replaceAll(/\s+/g, '-');
}

export function NieuwsTable({newsItems}: NieuwsTableProps) {
	const router = useRouter();
	const [deleteItem, setDeleteItem] = useState<NewsItem | null>(null);

	// Filter state
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [pinnedFilter, setPinnedFilter] = useState('');

	// Pagination state
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(25);

	// Sort state
	const {sortKey, sortDirection, handleSort} = useSorting<NewsItem>(newsItems, 'data.datum', 'desc');

	const handleDelete = async () => {
		if (!deleteItem) return;

		const response = await fetch(`/api/admin/content/nieuws/${deleteItem.id}`, {
			method: 'DELETE',
		});

		if (!response.ok) {
			toast.error('Verwijderen mislukt');
			setDeleteItem(null);
			return;
		}

		toast.success('Nieuwsbericht verwijderd');
		setDeleteItem(null);
		router.refresh();
	};

	// Filter, sort, and paginate items
	const filteredAndSortedItems = useMemo(() => {
		let result = [...newsItems];

		// Apply search filter
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				item => item.data.titel.toLowerCase().includes(query)
					|| item.data.samenvatting?.toLowerCase().includes(query),
			);
		}

		// Apply status filter
		if (statusFilter) {
			result = result.filter(item => item.published === statusFilter);
		}

		// Apply pinned filter
		if (pinnedFilter) {
			result = result.filter(item => String(item.data.vastgepind) === pinnedFilter);
		}

		// Apply sorting
		if (sortKey && sortDirection) {
			result.sort((a, b) => {
				let comparison = 0;
				switch (sortKey) {
					case 'data.titel': {
						comparison = a.data.titel.localeCompare(b.data.titel);
						break;
					}

					case 'data.datum': {
						comparison = new Date(a.data.datum).getTime() - new Date(b.data.datum).getTime();
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
	}, [newsItems, searchQuery, statusFilter, pinnedFilter, sortKey, sortDirection]);

	// Pagination calculations
	const totalItems = filteredAndSortedItems.length;
	const totalPages = Math.ceil(totalItems / pageSize);
	const paginatedItems = useMemo(() => {
		const start = (currentPage - 1) * pageSize;
		return filteredAndSortedItems.slice(start, start + pageSize);
	}, [filteredAndSortedItems, currentPage, pageSize]);

	// Reset to page 1 when filters change
	const handleSearchChange = (value: string) => {
		setSearchQuery(value);
		setCurrentPage(1);
	};

	const handleStatusFilterChange = (value: string) => {
		setStatusFilter(value);
		setCurrentPage(1);
	};

	const handlePinnedFilterChange = (value: string) => {
		setPinnedFilter(value);
		setCurrentPage(1);
	};

	const handlePageSizeChange = (size: number) => {
		setPageSize(size);
		setCurrentPage(1);
	};

	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr);
		return date.toLocaleDateString('nl-BE', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
		});
	};

	const filterConfigs = [
		{
			key: 'status',
			label: 'Alle statussen',
			options: statusOptions,
			value: statusFilter,
			onChange: handleStatusFilterChange,
		},
		{
			key: 'pinned',
			label: 'Vastgepind',
			options: pinnedOptions,
			value: pinnedFilter,
			onChange: handlePinnedFilterChange,
		},
	];

	return (
		<div>
			<TableFilters
				searchValue={searchQuery}
				onSearchChange={handleSearchChange}
				searchPlaceholder='Zoeken op titel of samenvatting...'
				filters={filterConfigs}
			/>

			<div className='bg-white rounded-xl shadow-md overflow-hidden'>
				<div className='overflow-x-auto'>
					<table className='w-full min-w-[640px]'>
						<thead className='bg-gray-50 border-b border-gray-200'>
							<tr>
								<th className='px-4 sm:px-6 py-3'>
									<SortableHeader
										label='Titel'
										sortKey='data.titel'
										currentSortKey={sortKey}
										currentSortDirection={sortDirection}
										onSort={handleSort}
									/>
								</th>
								<th className='px-4 sm:px-6 py-3'>
									<SortableHeader
										label='Datum'
										sortKey='data.datum'
										currentSortKey={sortKey}
										currentSortDirection={sortDirection}
										onSort={handleSort}
									/>
								</th>
								<th className='px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
									Vastgepind
								</th>
								<th className='px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
									Status
								</th>
								<th className='px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider'>
									Acties
								</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-gray-200'>
							{paginatedItems.length === 0 ? (
								<tr>
									<td colSpan={5} className='px-4 sm:px-6 py-8 text-center text-gray-500'>
										{searchQuery || statusFilter || pinnedFilter
											? 'Geen nieuws gevonden met de huidige filters.'
											: 'Geen nieuws gevonden.'}
									</td>
								</tr>
							) : (
								paginatedItems.map(item => (
									<tr key={item.id} className='hover:bg-gray-50'>
										<td className='px-4 sm:px-6 py-4'>
											<Link
												href={`/admin/nieuws/${item.id}`}
												className='text-gray-900 hover:text-primary font-medium transition-colors'
											>
												{item.data.titel}
											</Link>
										</td>
										<td className='px-4 sm:px-6 py-4 text-sm text-gray-500 whitespace-nowrap'>
											{formatDate(item.data.datum)}
										</td>
										<td className='px-4 sm:px-6 py-4'>
											<Star
												className={`w-5 h-5 ${item.data.vastgepind ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
											/>
										</td>
										<td className='px-4 sm:px-6 py-4'>
											<span className={`px-2 py-1 text-xs font-medium rounded ${
												item.published === 'published'
													? 'bg-green-100 text-green-800'
													: 'bg-yellow-100 text-yellow-800'
											}`}>
												{item.published === 'published' ? 'Gepubliceerd' : 'Concept'}
											</span>
										</td>
										<td className='px-4 sm:px-6 py-4 whitespace-nowrap text-right'>
											<div className='flex justify-end gap-1 sm:gap-2'>
												<Link
													href={`/nieuws/${generateSlug(item.data.titel)}`}
													target='_blank'
													title='Bekijk op website'
													className='inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-sm rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors'
												>
													<ExternalLink className='w-4 h-4' />
													<span className='hidden lg:inline'>Bekijken</span>
												</Link>
												<Link
													href={`/admin/nieuws/${item.id}`}
													title='Bewerken'
													className='inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-sm rounded-lg text-primary hover:text-primary-hover hover:bg-primary/10 transition-colors'
												>
													<Pencil className='w-4 h-4' />
													<span className='hidden lg:inline'>Bewerken</span>
												</Link>
												<button
													type='button'
													onClick={() => {
														setDeleteItem(item);
													}}
													title='Verwijderen'
													className='inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-sm rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors'
												>
													<Trash2 className='w-4 h-4' />
													<span className='hidden lg:inline'>Verwijderen</span>
												</button>
											</div>
										</td>
									</tr>
								))
							)}
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
			</div>

			{deleteItem && (
				<DeleteDialog
					title='Nieuwsbericht verwijderen?'
					message={`Weet je zeker dat je "${deleteItem.data.titel}" wilt verwijderen?`}
					onConfirm={handleDelete}
					onCancel={() => {
						setDeleteItem(null);
					}}
				/>
			)}
		</div>
	);
}
