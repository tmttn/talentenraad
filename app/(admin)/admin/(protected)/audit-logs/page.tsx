import type {Metadata} from 'next';
import {Suspense} from 'react';
import {desc} from 'drizzle-orm';
import {db, auditLogs} from '@lib/db';
import {TableSkeleton} from '@components/skeletons';
import {AuditLogsManager} from './audit-logs-manager';

export const metadata: Metadata = {
	title: 'Audit Logs',
};

async function AuditLogsLoader() {
	const logs = await db.query.auditLogs.findMany({
		orderBy: [desc(auditLogs.createdAt)],
		limit: 100,
	});

	return <AuditLogsManager initialLogs={logs} />;
}

export default function AuditLogsPage() {
	return (
		<div>
			<h1 className='text-3xl font-bold text-gray-800 mb-8'>Audit Logs</h1>
			<Suspense fallback={<TableSkeleton rows={10} />}>
				<AuditLogsLoader />
			</Suspense>
		</div>
	);
}
