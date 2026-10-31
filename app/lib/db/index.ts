import {createDatabase, defaultDatabasePath} from './open';

// Cached on globalThis so Next.js hot reloads do not leak connections in development.
const globalForDb = globalThis as unknown as {
  talentenraadDb?: ReturnType<typeof createDatabase>;
};

globalForDb.talentenraadDb ??= createDatabase(process.env.DATABASE_PATH ?? defaultDatabasePath);

export const {db} = globalForDb.talentenraadDb;
export * from './schema';
