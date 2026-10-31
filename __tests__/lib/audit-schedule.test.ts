import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

const cleanup = vi.hoisted(() => vi.fn());
vi.mock('@lib/audit/index', () => ({cleanupOldAuditLogs: cleanup}));

describe('startAuditCleanup', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetModules();
    cleanup.mockReset();
    cleanup.mockResolvedValue(3);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('runs at start and every 24 hours, registering the interval once', async () => {
    const {startAuditCleanup} = await import('@lib/audit/schedule');
    startAuditCleanup();
    startAuditCleanup();
    expect(vi.getTimerCount()).toBe(1);
    expect(cleanup).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(24 * 60 * 60 * 1000);
    expect(cleanup).toHaveBeenCalledTimes(2);
  });

  it('logs errors without throwing', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    cleanup.mockRejectedValue(new Error('boom'));
    const {startAuditCleanup} = await import('@lib/audit/schedule');
    startAuditCleanup();
    await vi.advanceTimersByTimeAsync(0);
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });
});
