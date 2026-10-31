export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Dynamic imports keep the native SQLite module out of the edge/proxy bundle.
    const {assertProductionEnv} = await import('@lib/env-check');

    try {
      assertProductionEnv();
    } catch (error) {
      // Next.js keeps serving after a failed instrumentation hook, so stop the process explicitly.
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }

    const {db} = await import('@lib/db');
    const {runMigrations} = await import('@lib/db/migrate');
    runMigrations(db);
    console.info('[db] migrations applied');
  }
}
