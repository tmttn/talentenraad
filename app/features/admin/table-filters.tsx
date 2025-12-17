'use client';

import {Search, X} from 'lucide-react';

type FilterOption = {
	value: string;
	label: string;
};

type FilterConfig = {
	key: string;
	label: string;
	options: FilterOption[];
	value: string;
	onChange: (value: string) => void;
};

type TableFiltersProps = {
	searchValue: string;
	onSearchChange: (value: string) => void;
	searchPlaceholder?: string;
	filters?: FilterConfig[];
	children?: React.ReactNode;
};

export function TableFilters({
	searchValue,
	onSearchChange,
	searchPlaceholder = 'Zoeken...',
	filters = [],
	children,
}: TableFiltersProps) {
	return (
		<div className='bg-white rounded-xl shadow-md p-4 mb-4'>
			<div className='flex flex-col lg:flex-row gap-4'>
				{/* Search input */}
				<div className='relative flex-1 min-w-0'>
					<Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
					<input
						type='text'
						value={searchValue}
						onChange={e => {
							onSearchChange(e.target.value);
						}}
						placeholder={searchPlaceholder}
						className='w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none'
					/>
					{searchValue && (
						<button
							type='button'
							onClick={() => {
								onSearchChange('');
							}}
							className='absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100'
						>
							<X className='w-4 h-4' />
						</button>
					)}
				</div>

				{/* Filter dropdowns */}
				{filters.length > 0 && (
					<div className='flex flex-wrap gap-3'>
						{filters.map(filter => (
							<div key={filter.key} className='min-w-[140px]'>
								<select
									value={filter.value}
									onChange={e => {
										filter.onChange(e.target.value);
									}}
									className='w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none bg-white text-gray-700'
								>
									<option value=''>{filter.label}</option>
									{filter.options.map(option => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
							</div>
						))}
					</div>
				)}

				{/* Additional children (like action buttons) */}
				{children}
			</div>
		</div>
	);
}
