import {getTableName, is} from 'drizzle-orm';
import {SQLiteTable} from 'drizzle-orm/sqlite-core';
import {createDatabase} from '@lib/db/open';
import {runMigrations} from '@lib/db/migrate';
import * as schema from '@lib/db/schema';

/**
 * A real SQLite database (in memory) with the production migrations applied.
 * `reset()` empties all tables between tests.
 */
export function createTestDb() {
  const {client, db} = createDatabase(':memory:');
  runMigrations(db);

  return {
    client,
    db,
    reset() {
      for (const table of Object.values(schema)) {
        if (is(table, SQLiteTable)) {
          client.exec(`delete from "${getTableName(table)}"`);
        }
      }
    },
    close() {
      client.close();
    },
  };
}
