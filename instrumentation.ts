export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Dynamic imports keep the native SQLite module out of the edge/proxy bundle.
    const {db} = await import('@lib/db');
    const {runMigrations} = await import('@lib/db/migrate');
    runMigrations(db);
  }
}
