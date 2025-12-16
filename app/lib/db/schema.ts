import {
	pgTable,
	text,
	timestamp,
	uuid,
} from 'drizzle-orm/pg-core';

// Users table for admin access
export const users = pgTable('users', {
	id: uuid('id').defaultRandom().primaryKey(),
	email: text('email').notNull().unique(),
	name: text('name'),
	googleId: text('google_id').unique(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Contact submissions table
export const submissions = pgTable('submissions', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull(),
	phone: text('phone'),
	subject: text('subject').notNull(),
	message: text('message').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	readAt: timestamp('read_at'),
	archivedAt: timestamp('archived_at'),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
