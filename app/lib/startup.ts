/**
 * Next.js keeps serving after a failed instrumentation hook, so in production
 * a startup failure must stop the process. In development the error is
 * rethrown for the dev overlay; during `next build` nothing may exit.
 */
export function failStartup(error: unknown): never {
  console.error('[startup]', error instanceof Error ? error.message : error);

  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build') {
    process.exit(1);
  }

  throw error;
}
