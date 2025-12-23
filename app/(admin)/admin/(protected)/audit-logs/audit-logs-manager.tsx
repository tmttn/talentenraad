'use client';

import {useState, useMemo} from 'react';
import {
	User,
	FileText,
	Settings,
	LogIn,
	LogOut,
	Eye,
	X,
	Trash2,
	Plus,
	RefreshCw,
	Send,
	Archive,
	Layers,
} from 'lucide-react';
import type {AuditLog} from '@lib/db/schema';
import {TableFilters} from '@features/admin/table-filters';
import {TablePagination} from '@features/admin/table-pagination';

type AuditLogsManagerProps = {
	initialLogs: AuditLog[];
};

const actionTypeLabels: Record<string, string> = {
	create: 'Aangemaakt',
	read: 'Bekeken',
	update: 'Bijgewerkt',
	delete: 'Verwijderd',
	login: 'Ingelogd',
	logout: 'Uitgelogd',
	publish: 'Gepubliceerd',
	unpublish: 'Gedepubliceerd',
	settings_change: 'Instelling gewijzigd',
	bulk_action: 'Bulk actie',
};

const resourceTypeLabels: Record<string, string> = {
	user: 'Gebruiker',
	'content:activiteit': 'Activiteit',
	'content:nieuws': 'Nieuws',
	'content:aankondiging': 'Aankondiging',
	submission: 'Bericht',
	session: 'Sessie',
	'settings:seasonal_decorations': 'Decoraties',
};

function getActionIcon(actionType: string) {
	switch (actionType) {
		case 'login': {
			return <LogIn className='w-4 h-4' />;
		}

		case 'logout': {
			return <LogOut className='w-4 h-4' />;
		}

		case 'settings_change': {
			return <Settings className='w-4 h-4' />;
		}

		case 'create': {
			return <Plus className='w-4 h-4' />;
		}

		case 'delete': {
			return <Trash2 className='w-4 h-4' />;
		}

		case 'update': {
			return <RefreshCw className='w-4 h-4' />;
		}

		case 'publish':
		case 'unpublish': {
			return <Send className='w-4 h-4' />;
		}

		case 'bulk_action': {
			return <Layers className='w-4 h-4' />;
		}

		default: {
			return <FileText className='w-4 h-4' />;
		}
	}
}

function getActionColor(actionType: string) {
	switch (actionType) {
		case 'delete': {
			return 'bg-red-100 text-red-800';
		}

		case 'create': {
			return 'bg-green-100 text-green-800';
		}

		case 'login': {
			return 'bg-blue-100 text-blue-800';
		}

		case 'logout': {
			return 'bg-gray-100 text-gray-800';
		}

		case 'publish': {
			return 'bg-emerald-100 text-emerald-800';
		}

		case 'unpublish': {
			return 'bg-orange-100 text-orange-800';
		}

		case 'settings_change': {
			return 'bg-purple-100 text-purple-800';
		}

		case 'bulk_action': {
			return 'bg-indigo-100 text-indigo-800';
		}

		default: {
			return 'bg-amber-100 text-amber-800';
		}
	}
}

function formatDate(date: Date | string) {
	return new Date(date).toLocaleString('nl-BE', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}

function JsonViewer({data, label}: {data: Record<string, unknown> | null; label: string}) {
	if (!data) return null;

	return (
		<div className='mb-4'>
			<p className='text-xs font-medium text-gray-500 mb-1'>{label}</p>
			<pre className='bg-gray-100 p-3 rounded-button text-xs overflow-x-auto max-h-48'>
				{JSON.stringify(data, null, 2)}
			</pre>
		</div>
	);
}

function DetailModal({log, onClose}: {log: AuditLog; onClose: () => void}) {
	return (
		<div className='fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4'>
			<div className='fixed inset-0 bg-black/50' onClick={onClose} aria-hidden='true' />
			<div className='relative bg-white rounded-t-xl sm:rounded-card shadow-xl w-full sm:max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto'>
				<div className='sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between'>
					<h3 className='text-base sm:text-lg font-semibold text-gray-900'>Audit Log Details</h3>
					<button
						type='button'
						onClick={onClose}
						className='p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-button transition-colors'
					>
						<X className='w-5 h-5' />
					</button>
				</div>
				<div className='p-4 sm:p-6'>
					<div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6'>
						<div>
							<p className='text-xs font-medium text-gray-500'>Actie</p>
							<p className='text-sm text-gray-900'>
								{actionTypeLabels[log.actionType] ?? log.actionType}
							</p>
						</div>
						<div>
							<p className='text-xs font-medium text-gray-500'>Resource</p>
							<p className='text-sm text-gray-900'>
								{resourceTypeLabels[log.resourceType] ?? log.resourceType}
							</p>
						</div>
						<div>
							<p className='text-xs font-medium text-gray-500'>Gebruiker</p>
							<p className='text-sm text-gray-900 break-all'>{log.userName ?? log.userEmail}</p>
						</div>
						<div>
							<p className='text-xs font-medium text-gray-500'>Datum</p>
							<p className='text-sm text-gray-900'>{formatDate(log.createdAt)}</p>
						</div>
						<div>
							<p className='text-xs font-medium text-gray-500'>IP Adres</p>
							<p className='text-sm text-gray-900 font-mono'>{log.ipAddress ?? '-'}</p>
						</div>
						<div>
							<p className='text-xs font-medium text-gray-500'>Resource ID</p>
							<p className='text-sm text-gray-900 font-mono break-all'>{log.resourceId ?? '-'}</p>
						</div>
					</div>

					{log.userAgent && (
						<div className='mb-4'>
							<p className='text-xs font-medium text-gray-500 mb-1'>User Agent</p>
							<p className='text-xs text-gray-600 break-all'>{log.userAgent}</p>
						</div>
					)}

					<JsonViewer data={log.dataBefore as Record<string, unknown> | null} label='Data voor wijziging' />
					<JsonViewer data={log.dataAfter as Record<string, unknown> | null} label='Data na wijziging' />
					<JsonViewer data={log.metadata as Record<string, unknown> | null} label='Metadata' />
				</div>
			</div>
		</div>
	);
}

export function AuditLogsManager({initialLogs}: AuditLogsManagerProps) {
	const [logs] = useState<AuditLog[]>(initialLogs);
	const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

	// Filters
	const [searchQuery, setSearchQuery] = useState('');
	const [actionFilter, setActionFilter] = useState('');
	const [resourceFilter, setResourceFilter] = useState('');

	// Pagination
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(25);

	// Get unique action types and resource types from logs
	const actionOptions = useMemo(() => {
		const types = [...new Set(logs.map(l => l.actionType))];
		return types.map(type => ({
			value: type,
			label: actionTypeLabels[type] ?? type,
		}));
	}, [logs]);

	const resourceOptions = useMemo(() => {
		const types = [...new Set(logs.map(l => l.resourceType))];
		return types.map(type => ({
			value: type,
			label: resourceTypeLabels[type] ?? type,
		}));
	}, [logs]);

	// Filter logs
	const filteredLogs = useMemo(() => {
		let result = [...logs];

		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				log =>
					log.userEmail.toLowerCase().includes(query)
					|| log.userName?.toLowerCase().includes(query)
					|| log.resourceId?.toLowerCase().includes(query),
			);
		}

		if (actionFilter) {
			result = result.filter(log => log.actionType === actionFilter);
		}

		if (resourceFilter) {
			result = result.filter(log => log.resourceType === resourceFilter);
		}

		return result;
	}, [logs, searchQuery, actionFilter, resourceFilter]);

	// Pagination
	const totalItems = filteredLogs.length;
	const totalPages = Math.ceil(totalItems / pageSize);
	const paginatedLogs = useMemo(() => {
		const start = (currentPage - 1) * pageSize;
		return filteredLogs.slice(start, start + pageSize);
	}, [filteredLogs, currentPage, pageSize]);

	const hasDetails = (log: AuditLog) =>
		Boolean(log.dataBefore) || Boolean(log.dataAfter) || Boolean(log.metadata);

	return (
		<div>
			<TableFilters
				searchValue={searchQuery}
				onSearchChange={value => {
					setSearchQuery(value);
					setCurrentPage(1);
				}}
				searchPlaceholder='Zoeken op gebruiker of resource ID...'
				filters={[
					{
						key: 'action',
						label: 'Alle acties',
						options: actionOptions,
						value: actionFilter,
						onChange: value => {
							setActionFilter(value);
							setCurrentPage(1);
						},
					},
					{
						key: 'resource',
						label: 'Alle resources',
						options: resourceOptions,
						value: resourceFilter,
						onChange: value => {
							setResourceFilter(value);
							setCurrentPage(1);
						},
					},
				]}
			/>

			{filteredLogs.length === 0 ? (
				<div className='bg-white rounded-card shadow-base p-8 text-center'>
					<Archive className='w-12 h-12 text-gray-300 mx-auto mb-4' />
					<p className='text-gray-500'>Geen audit logs gevonden</p>
				</div>
			) : (
				<div className='bg-white rounded-card shadow-base overflow-hidden'>
					<div className='overflow-x-auto'>
						<table className='w-full min-w-[500px]'>
							<thead className='bg-gray-50 border-b border-gray-200'>
								<tr>
									<th className='px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>
										Actie
									</th>
									<th className='px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>
										Gebruiker
									</th>
									<th className='hidden sm:table-cell px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>
										Resource
									</th>
									<th className='hidden lg:table-cell px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>
										IP Adres
									</th>
									<th className='px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>
										Datum
									</th>
									<th className='px-3 sm:px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase'>
										<span className='sr-only'>Details</span>
									</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-gray-200'>
								{paginatedLogs.map(log => (
									<tr key={log.id} className='hover:bg-gray-50'>
										<td className='px-3 sm:px-4 py-3'>
											<span
												className={`inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1 text-xs font-medium rounded ${getActionColor(log.actionType)}`}
											>
												{getActionIcon(log.actionType)}
												<span className='hidden sm:inline'>
													{actionTypeLabels[log.actionType] ?? log.actionType}
												</span>
											</span>
											{/* Show resource on mobile under action */}
											<p className='sm:hidden text-xs text-gray-500 mt-1'>
												{resourceTypeLabels[log.resourceType] ?? log.resourceType}
											</p>
										</td>
										<td className='px-3 sm:px-4 py-3'>
											<div className='flex items-center gap-2'>
												<User className='w-4 h-4 text-gray-400 flex-shrink-0 hidden sm:block' />
												<div className='min-w-0'>
													<p className='text-sm font-medium text-gray-900 truncate max-w-[100px] sm:max-w-none'>
														{log.userName ?? '-'}
													</p>
													<p className='text-xs text-gray-500 truncate max-w-[100px] sm:max-w-none'>{log.userEmail}</p>
												</div>
											</div>
										</td>
										<td className='hidden sm:table-cell px-4 py-3'>
											<p className='text-sm text-gray-900'>
												{resourceTypeLabels[log.resourceType] ?? log.resourceType}
											</p>
											{log.resourceId && (
												<p className='text-xs text-gray-500 font-mono truncate max-w-[120px]'>
													{log.resourceId.slice(0, 8)}...
												</p>
											)}
										</td>
										<td className='hidden lg:table-cell px-4 py-3 text-sm text-gray-500 font-mono'>
											{log.ipAddress ?? '-'}
										</td>
										<td className='px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-500 whitespace-nowrap'>
											{formatDate(log.createdAt)}
										</td>
										<td className='px-3 sm:px-4 py-3 text-right'>
											{hasDetails(log) ? (
												<button
													type='button'
													onClick={() => setSelectedLog(log)}
													className='inline-flex items-center gap-1 p-1.5 sm:px-2 sm:py-1 text-sm text-primary hover:bg-primary/10 rounded-button transition-colors'
													title='Bekijk details'
												>
													<Eye className='w-4 h-4' />
													<span className='hidden sm:inline'>Bekijk</span>
												</button>
											) : (
												<span className='text-gray-300 p-1.5'>
													<Eye className='w-4 h-4' />
												</span>
											)}
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
							onPageSizeChange={size => {
								setPageSize(size);
								setCurrentPage(1);
							}}
						/>
					)}
				</div>
			)}

			{selectedLog && <DetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />}
		</div>
	);
}
