import {cleanupOldAuditLogs} from './index';

const retentionDays = 90;
const dayMs = 24 * 60 * 60 * 1000;

let timer: NodeJS.Timeout | undefined;

async function runCleanup(): Promise<void> {
  try {
    const deletedCount = await cleanupOldAuditLogs(retentionDays);
    console.info(`[audit] cleanup removed ${deletedCount} entries older than ${retentionDays} days`);
  } catch (error) {
    console.error('[audit] cleanup failed', error);
  }
}

/** Runs the audit-log cleanup now and every 24 hours; registers the interval only once. */
export function startAuditCleanup(): void {
  if (timer) {
    return;
  }

  timer = setInterval(() => {
    void runCleanup();
  }, dayMs);
  timer.unref();
  void runCleanup();
}
