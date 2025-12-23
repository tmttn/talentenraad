import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  uuid,
  boolean,
  jsonb,
  index,
  integer,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// Audit action type enum
export const auditActionTypeEnum = pgEnum('audit_action_type', [
  'create',
  'read',
  'update',
  'delete',
  'login',
  'logout',
  'publish',
  'unpublish',
  'settings_change',
  'bulk_action',
]);

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

// Audit logs table for tracking all admin actions
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),

  // Action details
  actionType: auditActionTypeEnum('action_type').notNull(),
  resourceType: text('resource_type').notNull(), // 'user', 'content:nieuws', 'session', etc.
  resourceId: text('resource_id'), // ID of affected resource (null for login/logout)

  // User who performed action
  userId: uuid('user_id').references(() => users.id, {onDelete: 'set null'}),
  userEmail: text('user_email').notNull(), // Stored for resilience if user is deleted
  userName: text('user_name'),

  // Request metadata
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  requestPath: text('request_path'),
  requestMethod: text('request_method'),

  // Data changes (JSON diff)
  dataBefore: jsonb('data_before'), // State before action
  dataAfter: jsonb('data_after'), // State after action
  metadata: jsonb('metadata'), // Additional context (e.g., bulk action IDs)

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, table => [
  // Indexes for efficient querying
  index('audit_logs_created_at_idx').on(table.createdAt),
  index('audit_logs_user_email_idx').on(table.userEmail),
  index('audit_logs_action_type_idx').on(table.actionType),
  index('audit_logs_resource_type_idx').on(table.resourceType),
  index('audit_logs_resource_id_idx').on(table.resourceId),
]);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type NewSiteSetting = typeof siteSettings.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
export type AuditActionType = (typeof auditActionTypeEnum.enumValues)[number];

// Push notification subscriptions table
export const pushSubscriptions = pgTable('push_subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),

  // Subscription data (from PushSubscription.toJSON())
  endpoint: text('endpoint').notNull().unique(),
  p256dh: text('p256dh').notNull(), // Public key
  auth: text('auth').notNull(), // Auth secret

  // User association (optional - for logged-in users)
  userId: uuid('user_id').references(() => users.id, {onDelete: 'cascade'}),

  // Device info for management
  userAgent: text('user_agent'),

  // Subscription preferences
  topics: text('topics').array(),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastUsedAt: timestamp('last_used_at'),
}, table => [
  index('push_subscriptions_user_id_idx').on(table.userId),
  index('push_subscriptions_endpoint_idx').on(table.endpoint),
]);

// Notification history for tracking
export const notificationHistory = pgTable('notification_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  url: text('url'),
  topic: text('topic'),
  sentBy: uuid('sent_by').references(() => users.id),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
  recipientCount: integer('recipient_count').default(0),
  successCount: integer('success_count').default(0),
  failureCount: integer('failure_count').default(0),
});

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type NewPushSubscription = typeof pushSubscriptions.$inferInsert;
export type NotificationHistoryEntry = typeof notificationHistory.$inferSelect;
export type NewNotificationHistoryEntry = typeof notificationHistory.$inferInsert;

// Content claps aggregate table
export const contentClaps = pgTable('content_claps', {
  id: uuid('id').defaultRandom().primaryKey(),
  contentType: text('content_type').notNull(), // 'nieuws' | 'activiteit'
  contentId: text('content_id').notNull(),
  totalClaps: integer('total_claps').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, table => [
  uniqueIndex('content_claps_unique_idx').on(table.contentType, table.contentId),
]);

// Per-session clap tracking (max 50 claps per visitor per content)
export const clapSessions = pgTable('clap_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: text('session_id').notNull(),
  contentType: text('content_type').notNull(),
  contentId: text('content_id').notNull(),
  clapCount: integer('clap_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, table => [
  uniqueIndex('clap_sessions_unique_idx').on(table.sessionId, table.contentType, table.contentId),
]);

// Visitor feedback
export const feedback = pgTable('feedback', {
  id: uuid('id').defaultRandom().primaryKey(),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),
  email: text('email'),
  pageUrl: text('page_url'),
  pageTitle: text('page_title'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  readAt: timestamp('read_at'),
  archivedAt: timestamp('archived_at'),
}, table => [
  index('feedback_created_at_idx').on(table.createdAt),
  index('feedback_rating_idx').on(table.rating),
]);

export type ContentClaps = typeof contentClaps.$inferSelect;
export type NewContentClaps = typeof contentClaps.$inferInsert;
export type ClapSession = typeof clapSessions.$inferSelect;
export type NewClapSession = typeof clapSessions.$inferInsert;
export type Feedback = typeof feedback.$inferSelect;
export type NewFeedback = typeof feedback.$inferInsert;

// Sponsor analytics - aggregate tracking
export const sponsorAnalytics = pgTable('sponsor_analytics', {
  id: uuid('id').defaultRandom().primaryKey(),
  sponsorId: text('sponsor_id').notNull(),
  sponsorName: text('sponsor_name').notNull(),
  date: timestamp('date').notNull(), // Date of the analytics (truncated to day)
  impressions: integer('impressions').default(0).notNull(),
  clicks: integer('clicks').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, table => [
  uniqueIndex('sponsor_analytics_unique_idx').on(table.sponsorId, table.date),
  index('sponsor_analytics_sponsor_id_idx').on(table.sponsorId),
  index('sponsor_analytics_date_idx').on(table.date),
]);

export type SponsorAnalytics = typeof sponsorAnalytics.$inferSelect;
export type NewSponsorAnalytics = typeof sponsorAnalytics.$inferInsert;

// Re-export shared types for convenience
export type {SeasonalDecorationsConfig} from '../types';
