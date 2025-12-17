'use client';

import {useState} from 'react';
import Link from 'next/link';
import {ExternalLinkIcon, PencilIcon, TrashIcon} from '@/components/ui/icons';
import {DeleteDialog} from './delete-dialog';

type Column<T> = {
	key: keyof T | string;
	label: string;
	render?: (item: T) => React.ReactNode;
	isTitle?: boolean;
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

function IconButton({
	onClick,
	href,
	target,
	title,
	variant,
	children,
}: {
	onClick?: () => void;
	href?: string;
	target?: string;
	title: string;
	variant: 'default' | 'primary' | 'danger';
	children: React.ReactNode;
}) {
	const baseClasses = 'p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1';
	const variantClasses = {
		default: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:ring-gray-300',
		primary: 'text-primary hover:text-primary-hover hover:bg-primary/10 focus:ring-primary/30',
		danger: 'text-red-500 hover:text-red-700 hover:bg-red-50 focus:ring-red-300',
	};

	if (href) {
		return (
			<Link
				href={href}
				target={target}
				className={`${baseClasses} ${variantClasses[variant]}`}
				title={title}
			>
				{children}
			</Link>
		);
	}

	return (
		<button
			type='button'
			onClick={onClick}
			className={`${baseClasses} ${variantClasses[variant]}`}
			title={title}
		>
			{children}
		</button>
	);
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
				<div className='overflow-x-auto'>
					<table className='w-full min-w-[640px]'>
						<thead className='bg-gray-50 border-b border-gray-200'>
							<tr>
								{columns.map(column => (
									<th
										key={String(column.key)}
										className='px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'
									>
										{column.label}
									</th>
								))}
								<th className='px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider'>
									Acties
								</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-gray-200'>
							{items.map(item => (
								<tr key={item.id} className='hover:bg-gray-50'>
									{columns.map(column => (
										<td key={String(column.key)} className='px-4 sm:px-6 py-4'>
											{column.isTitle ? (
												<Link
													href={editPath(item)}
													className='text-gray-900 hover:text-primary font-medium transition-colors'
												>
													{column.render
														? column.render(item)
														: String(getNestedValue(item, String(column.key)) ?? '')}
												</Link>
											) : (
												<span className='whitespace-nowrap'>
													{column.render
														? column.render(item)
														: String(getNestedValue(item, String(column.key)) ?? '')}
												</span>
											)}
										</td>
									))}
									<td className='px-4 sm:px-6 py-4 whitespace-nowrap text-right'>
										<div className='flex justify-end gap-1'>
											{viewPath && (
												<IconButton
													href={viewPath(item)}
													target='_blank'
													title='Bekijk op website'
													variant='default'
												>
													<ExternalLinkIcon size='md' />
												</IconButton>
											)}
											<IconButton
												href={editPath(item)}
												title='Bewerken'
												variant='primary'
											>
												<PencilIcon size='md' />
											</IconButton>
											{onDelete && (
												<IconButton
													onClick={() => {
														setDeleteItem(item);
													}}
													title='Verwijderen'
													variant='danger'
												>
													<TrashIcon size='md' />
												</IconButton>
											)}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
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
