import type {Config} from 'drizzle-kit';

export default {
  schema: './app/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_PATH ?? './data/talentenraad.db',
  },
} satisfies Config;
