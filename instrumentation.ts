export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Dynamic imports keep the native SQLite module out of the edge/proxy bundle.
    try {
      const {assertProductionEnv} = await import('@lib/env-check');
      assertProductionEnv();

      const {db} = await import('@lib/db');
      const {runMigrations} = await import('@lib/db/migrate');
      runMigrations(db);
      console.info('[db] migrations applied');
    } catch (error) {
      const {failStartup} = await import('@lib/startup');
      failStartup(error);
    }
  }
}
