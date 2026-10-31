import {createDatabase, defaultDatabasePath} from './open';

type Connection = ReturnType<typeof createDatabase>;
type Db = Connection['db'];

// Cached on globalThis so Next.js hot reloads do not leak connections in development.
const globalForDb = globalThis as unknown as {
  talentenraadDb?: Connection;
};

/** Opens the database on first use, so importing this module (e.g. during `next build`) creates no file. */
export function getDb(): Db {
  globalForDb.talentenraadDb ??= createDatabase(process.env.DATABASE_PATH ?? defaultDatabasePath);
  return globalForDb.talentenraadDb.db;
}

export const db = new Proxy({} as unknown as Db, {
  get(_target, property) {
    const database = getDb();
    const value = Reflect.get(database, property, database) as unknown;
    return typeof value === 'function' ? value.bind(database) as unknown : value;
  },
});

export * from './schema';
