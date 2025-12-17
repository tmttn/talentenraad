'use client';

import {ArrowUp, ArrowDown, ArrowUpDown} from 'lucide-react';

export type SortDirection = 'asc' | 'desc' | null;

type SortableHeaderProps = {
	label: string;
	sortKey: string;
	currentSortKey: string | null;
	currentSortDirection: SortDirection;
	onSort: (key: string) => void;
	className?: string;
};

export function SortableHeader({
	label,
	sortKey,
	currentSortKey,
	currentSortDirection,
	onSort,
	className = '',
}: SortableHeaderProps) {
	const isActive = currentSortKey === sortKey;

	return (
		<button
			type='button'
			onClick={() => {
				onSort(sortKey);
			}}
			className={`flex items-center gap-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900 transition-colors group ${className}`}
		>
			{label}
			<span className={`transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
				{isActive && currentSortDirection === 'asc' ? (
					<ArrowUp className='w-4 h-4' />
				) : isActive && currentSortDirection === 'desc' ? (
					<ArrowDown className='w-4 h-4' />
				) : (
					<ArrowUpDown className='w-4 h-4' />
				)}
			</span>
		</button>
	);
}

// Hook for managing sort state
export function useSorting<T>(
	items: T[],
	defaultSortKey?: string,
	defaultDirection: SortDirection = 'desc',
) {
	const [sortKey, setSortKey] = useState<string | null>(defaultSortKey ?? null);
	const [sortDirection, setSortDirection] = useState<SortDirection>(defaultDirection);

	const handleSort = (key: string) => {
		if (sortKey === key) {
			// Toggle direction or clear sort
			if (sortDirection === 'asc') {
				setSortDirection('desc');
			} else if (sortDirection === 'desc') {
				setSortKey(null);
				setSortDirection(null);
			} else {
				setSortDirection('asc');
			}
		} else {
			setSortKey(key);
			setSortDirection('asc');
		}
	};

	return {sortKey, sortDirection, handleSort};
}

// Need to import useState for the hook
import {useState} from 'react';
