import type {Config} from 'drizzle-kit';

export default {
	schema: './app/lib/db/schema.ts',
	out: './drizzle',
	dialect: 'postgresql',
	dbCredentials: {
		// eslint-disable-next-line n/prefer-global/process
		url: process.env.POSTGRES_URL ?? process.env.DATABASE_URL!,
	},
} satisfies Config;
