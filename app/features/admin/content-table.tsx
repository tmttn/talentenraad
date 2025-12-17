'use client';

import {useState} from 'react';
import Link from 'next/link';
import {DeleteDialog} from './delete-dialog';

type Column<T> = {
	key: keyof T | string;
	label: string;
	render?: (item: T) => React.ReactNode;
};

type ContentTableProps<T extends {id: string}> = {
	items: T[];
	columns: Array<Column<T>>;
	editPath: (item: T) => string;
	viewPath?: (item: T) => string;
	onDelete?: (item: T) => Promise<void>;
	emptyMessage?: string;
};

function getNestedValue<T>(item: T, key: string): unknown {
	const keys = key.split('.');
	let value: unknown = item;
	for (const k of keys) {
		if (value && typeof value === 'object' && k in value) {
			value = (value as Record<string, unknown>)[k];
		} else {
			return undefined;
		}
	}

	return value;
}

export function ContentTable<T extends {id: string}>({
	items,
	columns,
	editPath,
	viewPath,
	onDelete,
	emptyMessage = 'Geen items gevonden',
}: ContentTableProps<T>) {
	const [deleteItem, setDeleteItem] = useState<T | null>(null);

	const handleDelete = async () => {
		if (deleteItem && onDelete) {
			await onDelete(deleteItem);
			setDeleteItem(null);
		}
	};

	if (items.length === 0) {
		return (
			<div className='bg-white rounded-xl p-8 text-center text-gray-500'>
				{emptyMessage}
			</div>
		);
	}

	return (
		<>
			<div className='bg-white rounded-xl shadow-md overflow-hidden'>
				<table className='w-full'>
					<thead className='bg-gray-50 border-b border-gray-200'>
						<tr>
							{columns.map(column => (
								<th
									key={String(column.key)}
									className='px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'
								>
									{column.label}
								</th>
							))}
							<th className='px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider'>
								Acties
							</th>
						</tr>
					</thead>
					<tbody className='divide-y divide-gray-200'>
						{items.map(item => (
							<tr key={item.id} className='hover:bg-gray-50'>
								{columns.map(column => (
									<td key={String(column.key)} className='px-6 py-4 whitespace-nowrap'>
										{column.render
											? column.render(item)
											: String(getNestedValue(item, String(column.key)) ?? '')}
									</td>
								))}
								<td className='px-6 py-4 whitespace-nowrap text-right'>
									<div className='flex justify-end gap-2'>
										{viewPath && (
											<Link
												href={viewPath(item)}
												target='_blank'
												className='text-gray-600 hover:text-gray-800 text-sm font-medium'
											>
												Bekijk
											</Link>
										)}
										<Link
											href={editPath(item)}
											className='text-primary hover:text-primary-hover text-sm font-medium'
										>
											Bewerk
										</Link>
										{onDelete && (
											<button
												type='button'
												onClick={() => {
													setDeleteItem(item);
												}}
												className='text-red-600 hover:text-red-800 text-sm font-medium'
											>
												Verwijder
											</button>
										)}
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{deleteItem && onDelete && (
				<DeleteDialog
					title='Item verwijderen?'
					message='Weet je zeker dat je dit item wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.'
					onConfirm={handleDelete}
					onCancel={() => {
						setDeleteItem(null);
					}}
				/>
			)}
		</>
	);
}
