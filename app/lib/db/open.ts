import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import {drizzle} from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

export const defaultDatabasePath = './data/talentenraad.db';

export type AppDatabase = ReturnType<typeof createDatabase>['db'];

/**
 * Opens a SQLite database with the pragmas the app relies on: WAL so readers do
 * not block the writer, a busy timeout so concurrent writers wait instead of
 * failing with SQLITE_BUSY, and enforced foreign keys.
 */
export function createDatabase(file: string) {
  if (file !== ':memory:') {
    fs.mkdirSync(path.dirname(path.resolve(file)), {recursive: true});
  }

  const client = new Database(file);
  client.pragma('journal_mode = WAL');
  client.pragma('busy_timeout = 5000');
  client.pragma('foreign_keys = ON');

  return {client, db: drizzle(client, {schema})};
}
