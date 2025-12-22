'use client';

import {useState, useMemo} from 'react';
import {useRouter} from 'next/navigation';
import {toast} from 'sonner';
import {Star, Trash2, ExternalLink, Mail} from 'lucide-react';
import type {Feedback} from '@/lib/db/index.js';
import {TableFilters} from './table-filters';
import {TablePagination} from './table-pagination';
import {SortableHeader, useSorting} from './sortable-header';
import {ViewModeToggle} from './view-mode-toggle';
import {useViewMode} from './use-view-mode';

type FeedbackTableProps = {
	feedbackItems: Feedback[];
};

const ratingOptions = [
	{value: '1', label: '1 ster'},
	{value: '2', label: '2 sterren'},
	{value: '3', label: '3 sterren'},
	{value: '4', label: '4 sterren'},
	{value: '5', label: '5 sterren'},
];

function StarRatingDisplay({rating}: {rating: number}) {
	return (
		<div className='flex gap-0.5'>
			{Array.from({length: 5}).map((_, i) => (
				<Star
					key={i}
					className={`w-4 h-4 ${
						i < rating
							? 'text-yellow-500 fill-yellow-500'
							: 'text-gray-300'
					}`}
				/>
			))}
		</div>
	);
}

export function FeedbackTable({feedbackItems}: FeedbackTableProps) {
	const router = useRouter();
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [isProcessing, setIsProcessing] = useState(false);
	const {viewMode, setViewMode} = useViewMode();

	// Filter state
	const [searchQuery, setSearchQuery] = useState('');
	const [ratingFilter, setRatingFilter] = useState('');

	// Pagination state
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(25);

	// Sort state
	const {sortKey, sortDirection, handleSort} = useSorting<Feedback>(feedbackItems, 'createdAt', 'desc');

	const formatDate = (date: Date) => new Intl.DateTimeFormat('nl-BE', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date);

	// Filter, sort, and paginate feedback
	const filteredAndSortedFeedback = useMemo(() => {
		let result = [...feedbackItems];

		// Apply search filter
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				f => f.comment?.toLowerCase().includes(query)
					|| f.email?.toLowerCase().includes(query)
					|| f.pageUrl?.toLowerCase().includes(query),
			);
		}

		// Apply rating filter
		if (ratingFilter) {
			result = result.filter(f => f.rating === Number(ratingFilter));
		}

		// Apply sorting
		if (sortKey && sortDirection) {
			result.sort((a, b) => {
				let comparison = 0;
				switch (sortKey) {
					case 'rating': {
						comparison = a.rating - b.rating;
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
	}, [feedbackItems, searchQuery, ratingFilter, sortKey, sortDirection]);

	// Pagination calculations
	const totalItems = filteredAndSortedFeedback.length;
	const totalPages = Math.ceil(totalItems / pageSize);
	const paginatedFeedback = useMemo(() => {
		const start = (currentPage - 1) * pageSize;
		return filteredAndSortedFeedback.slice(start, start + pageSize);
	}, [filteredAndSortedFeedback, currentPage, pageSize]);

	// Reset to page 1 when filters change
	const handleSearchChange = (value: string) => {
		setSearchQuery(value);
		setCurrentPage(1);
	};

	const handleRatingFilterChange = (value: string) => {
		setRatingFilter(value);
		setCurrentPage(1);
	};

	const handlePageSizeChange = (size: number) => {
		setPageSize(size);
		setCurrentPage(1);
	};

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedIds(new Set(paginatedFeedback.map(f => f.id)));
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

	const handleBulkDelete = async () => {
		if (selectedIds.size === 0) {
			return;
		}

		// eslint-disable-next-line no-alert
		if (!confirm(`Weet je zeker dat je ${selectedIds.size} feedback item(s) wilt verwijderen?`)) {
			return;
		}

		setIsProcessing(true);
		try {
			const response = await fetch('/api/admin/feedback', {
				method: 'DELETE',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({ids: [...selectedIds]}),
			});

			if (response.ok) {
				toast.success(`${selectedIds.size} feedback item(s) verwijderd`);
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
			key: 'rating',
			label: 'Alle beoordelingen',
			options: ratingOptions,
			value: ratingFilter,
			onChange: handleRatingFilterChange,
		},
	];

	// Calculate average rating
	const averageRating = feedbackItems.length > 0
		? (feedbackItems.reduce((sum, f) => sum + f.rating, 0) / feedbackItems.length).toFixed(1)
		: '0';

	return (
		<div>
			{/* Stats bar */}
			<div className='mb-4 p-4 bg-white rounded-card shadow-base flex flex-wrap items-center gap-6'>
				<div className='flex items-center gap-2'>
					<span className='text-sm text-gray-500'>Gemiddelde:</span>
					<span className='font-bold text-lg text-gray-800'>{averageRating}</span>
					<StarRatingDisplay rating={Math.round(Number(averageRating))} />
				</div>
				<div className='flex items-center gap-4 text-sm'>
					{[5, 4, 3, 2, 1].map(rating => {
						const count = feedbackItems.filter(f => f.rating === rating).length;
						return (
							<span key={rating} className='text-gray-500'>
								{rating}★: <span className='font-medium text-gray-700'>{count}</span>
							</span>
						);
					})}
				</div>
			</div>

			<TableFilters
				searchValue={searchQuery}
				onSearchChange={handleSearchChange}
				searchPlaceholder='Zoeken op opmerking, e-mail of pagina...'
				filters={filterConfigs}
			>
				<ViewModeToggle mode={viewMode} onChange={setViewMode} />
			</TableFilters>

			{selectedIds.size > 0 && (
				<div className='mb-4 p-3 sm:p-4 bg-white rounded-card shadow-base flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4'>
					<span className='text-sm text-gray-600 font-medium'>
						{selectedIds.size} geselecteerd
					</span>
					<div className='flex flex-wrap gap-2'>
						<button
							type='button'
							disabled={isProcessing}
							onClick={() => {
								void handleBulkDelete();
							}}
							className='px-3 py-2 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-button transition-colors disabled:opacity-50 inline-flex items-center gap-1.5'
						>
							<Trash2 className='w-4 h-4' />
							Verwijderen
						</button>
					</div>
				</div>
			)}

			{viewMode === 'table' ? (
				<div className='bg-white rounded-card shadow-base overflow-hidden'>
					<div className='overflow-x-auto'>
						<table className='w-full min-w-[700px]'>
							<thead className='bg-gray-50 border-b border-gray-200'>
								<tr>
									<th className='px-4 sm:px-6 py-4 text-left w-12'>
										<input
											type='checkbox'
											checked={selectedIds.size === paginatedFeedback.length && paginatedFeedback.length > 0}
											onChange={event => {
												handleSelectAll(event.target.checked);
											}}
											className='rounded border-gray-300 text-primary focus:ring-primary w-4 h-4'
										/>
									</th>
									<th className='px-4 sm:px-6 py-4'>
										<SortableHeader
											label='Beoordeling'
											sortKey='rating'
											currentSortKey={sortKey}
											currentSortDirection={sortDirection}
											onSort={handleSort}
										/>
									</th>
									<th className='px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										Opmerking
									</th>
									<th className='px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										Pagina
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
								</tr>
							</thead>
							<tbody className='divide-y divide-gray-200'>
								{paginatedFeedback.map(item => (
									<tr key={item.id} className='hover:bg-gray-50'>
										<td className='px-4 sm:px-6 py-4'>
											<input
												type='checkbox'
												checked={selectedIds.has(item.id)}
												onChange={event => {
													handleSelect(item.id, event.target.checked);
												}}
												className='rounded border-gray-300 text-primary focus:ring-primary w-4 h-4'
											/>
										</td>
										<td className='px-4 sm:px-6 py-4'>
											<StarRatingDisplay rating={item.rating} />
										</td>
										<td className='px-4 sm:px-6 py-4'>
											<div className='max-w-xs'>
												{item.comment ? (
													<p className='text-sm text-gray-700 line-clamp-2'>{item.comment}</p>
												) : (
													<span className='text-sm text-gray-400 italic'>Geen opmerking</span>
												)}
												{item.email && (
													<p className='text-xs text-gray-500 mt-1 flex items-center gap-1'>
														<Mail className='w-3 h-3' />
														{item.email}
													</p>
												)}
											</div>
										</td>
										<td className='px-4 sm:px-6 py-4'>
											{item.pageUrl ? (
												<a
													href={item.pageUrl}
													target='_blank'
													rel='noopener noreferrer'
													className='text-sm text-primary hover:text-primary-hover flex items-center gap-1'
												>
													{item.pageUrl}
													<ExternalLink className='w-3 h-3' />
												</a>
											) : (
												<span className='text-sm text-gray-400'>-</span>
											)}
										</td>
										<td className='px-4 sm:px-6 py-4 text-sm text-gray-500 whitespace-nowrap'>
											{formatDate(item.createdAt)}
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
							{searchQuery || ratingFilter
								? 'Geen feedback gevonden met de huidige filters.'
								: 'Geen feedback gevonden.'}
						</div>
					)}
				</div>
			) : (
				<div>
					{totalItems === 0 ? (
						<div className='bg-white rounded-card shadow-base p-8 text-center text-gray-500'>
							{searchQuery || ratingFilter
								? 'Geen feedback gevonden met de huidige filters.'
								: 'Geen feedback gevonden.'}
						</div>
					) : (
						<div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
							{paginatedFeedback.map(item => (
								<div key={item.id} className='bg-white rounded-card shadow-base p-4'>
									<div className='flex items-start gap-3 mb-3'>
										<input
											type='checkbox'
											checked={selectedIds.has(item.id)}
											onChange={event => {
												handleSelect(item.id, event.target.checked);
											}}
											className='rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 mt-1'
										/>
										<div className='flex-1'>
											<StarRatingDisplay rating={item.rating} />
											<p className='text-xs text-gray-500 mt-1'>
												{formatDate(item.createdAt)}
											</p>
										</div>
									</div>
									{item.comment && (
										<p className='text-sm text-gray-700 mb-3 line-clamp-3'>{item.comment}</p>
									)}
									<div className='flex flex-col gap-1 text-xs text-gray-500'>
										{item.email && (
											<p className='flex items-center gap-1'>
												<Mail className='w-3 h-3' />
												{item.email}
											</p>
										)}
										{item.pageUrl && (
											<a
												href={item.pageUrl}
												target='_blank'
												rel='noopener noreferrer'
												className='text-primary hover:text-primary-hover flex items-center gap-1'
											>
												<ExternalLink className='w-3 h-3' />
												{item.pageUrl}
											</a>
										)}
									</div>
								</div>
							))}
						</div>
					)}
					{totalItems > 0 && (
						<div className='mt-4 bg-white rounded-card shadow-base overflow-hidden'>
							<TablePagination
								currentPage={currentPage}
								totalPages={totalPages}
								totalItems={totalItems}
								pageSize={pageSize}
								onPageChange={setCurrentPage}
								onPageSizeChange={handlePageSizeChange}
							/>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
