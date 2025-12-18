'use client';

import {ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight} from 'lucide-react';

type TablePaginationProps = {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	pageSize: number;
	onPageChange: (page: number) => void;
	onPageSizeChange?: (size: number) => void;
	pageSizeOptions?: number[];
};

export function TablePagination({
	currentPage,
	totalPages,
	totalItems,
	pageSize,
	onPageChange,
	onPageSizeChange,
	pageSizeOptions = [10, 25, 50, 100],
}: TablePaginationProps) {
	const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
	const endItem = Math.min(currentPage * pageSize, totalItems);

	const canGoBack = currentPage > 1;
	const canGoForward = currentPage < totalPages;

	return (
		<div className='flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white border-t border-gray-200'>
			<div className='flex items-center gap-4 text-sm text-gray-600'>
				<span>
					{totalItems === 0 ? (
						'Geen resultaten'
					) : (
						<>
							<span className='font-medium'>{startItem}</span>
							{' - '}
							<span className='font-medium'>{endItem}</span>
							{' van '}
							<span className='font-medium'>{totalItems}</span>
						</>
					)}
				</span>
				{onPageSizeChange && (
					<div className='flex items-center gap-2'>
						<label htmlFor='pageSize' className='text-gray-500'>
							Per pagina:
						</label>
						<select
							id='pageSize'
							value={pageSize}
							onChange={e => {
								onPageSizeChange(Number(e.target.value));
							}}
							className='px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary'
						>
							{pageSizeOptions.map(size => (
								<option key={size} value={size}>
									{size}
								</option>
							))}
						</select>
					</div>
				)}
			</div>

			<div className='flex items-center gap-1'>
				<button
					type='button'
					onClick={() => {
						onPageChange(1);
					}}
					disabled={!canGoBack}
					className='p-2 rounded-button text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
					title='Eerste pagina'
				>
					<ChevronsLeft className='w-5 h-5' />
				</button>
				<button
					type='button'
					onClick={() => {
						onPageChange(currentPage - 1);
					}}
					disabled={!canGoBack}
					className='p-2 rounded-button text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
					title='Vorige pagina'
				>
					<ChevronLeft className='w-5 h-5' />
				</button>

				<span className='px-3 py-1 text-sm text-gray-600'>
					Pagina <span className='font-medium'>{currentPage}</span> van <span className='font-medium'>{totalPages || 1}</span>
				</span>

				<button
					type='button'
					onClick={() => {
						onPageChange(currentPage + 1);
					}}
					disabled={!canGoForward}
					className='p-2 rounded-button text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
					title='Volgende pagina'
				>
					<ChevronRight className='w-5 h-5' />
				</button>
				<button
					type='button'
					onClick={() => {
						onPageChange(totalPages);
					}}
					disabled={!canGoForward}
					className='p-2 rounded-button text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
					title='Laatste pagina'
				>
					<ChevronsRight className='w-5 h-5' />
				</button>
			</div>
		</div>
	);
}
