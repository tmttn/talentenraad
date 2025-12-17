import {
	pgTable,
	text,
	timestamp,
	uuid,
	boolean,
	jsonb,
} from 'drizzle-orm/pg-core';

// Site settings table for global configuration
export const siteSettings = pgTable('site_settings', {
	id: uuid('id').defaultRandom().primaryKey(),
	key: text('key').notNull().unique(),
	value: jsonb('value').notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
	updatedBy: uuid('updated_by').references(() => users.id),
});

// Users table for admin access
export const users = pgTable('users', {
	id: uuid('id').defaultRandom().primaryKey(),
	email: text('email').notNull().unique(),
	name: text('name'),
	auth0Id: text('auth0_id').unique(),
	isAdmin: boolean('is_admin').default(false).notNull(),
	invitedAt: timestamp('invited_at'),
	acceptedAt: timestamp('accepted_at'),
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
export type SiteSetting = typeof siteSettings.$inferSelect;
export type NewSiteSetting = typeof siteSettings.$inferInsert;

// Seasonal decorations configuration type
export type SeasonalDecorationsConfig = {
	enabled: boolean;
	season: 'christmas' | 'easter' | 'halloween' | 'none';
	decorations: {
		christmasLights: boolean;
		snowfall: boolean;
		icicles: boolean;
		gingerbreadMan: boolean;
		christmasBalls: boolean;
	};
};
