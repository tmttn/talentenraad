import path from 'node:path';
import {migrate} from 'drizzle-orm/better-sqlite3/migrator';
import type {AppDatabase} from './open';

/**
 * Applies pending migrations from the `drizzle` folder. Idempotent: applied
 * migrations are tracked by drizzle and skipped, existing data is kept.
 */
export function runMigrations(
  database: AppDatabase,
  migrationsFolder = path.join(process.cwd(), 'drizzle'),
): void {
  migrate(database, {migrationsFolder});
}
