import {type NextRequest, NextResponse} from 'next/server';
import {cleanupOldAuditLogs} from '@/lib/audit';

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(request: NextRequest): boolean {
	const authHeader = request.headers.get('authorization');
	// eslint-disable-next-line n/prefer-global/process
	const cronSecret = process.env.CRON_SECRET;

	if (!cronSecret) {
		console.warn('CRON_SECRET not set');
		return false;
	}

	return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
	// Verify this is a legitimate cron request
	if (!verifyCronSecret(request)) {
		return NextResponse.json({error: 'Unauthorized'}, {status: 401});
	}

	try {
		const deletedCount = await cleanupOldAuditLogs(90);

		console.log(`Audit log cleanup: deleted ${deletedCount} records older than 90 days`);

		return NextResponse.json({
			success: true,
			deletedCount,
			message: `Cleaned up ${deletedCount} audit log entries`,
		});
	} catch (error) {
		console.error('Audit log cleanup failed:', error);
		return NextResponse.json(
			{error: 'Cleanup failed'},
			{status: 500},
		);
	}
}
