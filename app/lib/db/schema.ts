import {sql} from 'drizzle-orm';
import {
  sqliteTable,
  text,
  integer,
  index,
} from 'drizzle-orm/sqlite-core';

// Ids are UUID strings generated in the app; timestamps are epoch milliseconds.
const id = () => text('id').primaryKey().$defaultFn(() => crypto.randomUUID());
const createdAt = () => integer('created_at', {mode: 'timestamp_ms'})
  .notNull()
  .default(sql`(unixepoch() * 1000)`)
  // The SQL default only has second resolution; inserts through the app get milliseconds.
  .$defaultFn(() => new Date());

export const auditActionTypes = [
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
] as const;

// Users table for admin access
export const users = sqliteTable('users', {
  id: id(),
  email: text('email').notNull().unique(),
  name: text('name'),
  isAdmin: integer('is_admin', {mode: 'boolean'}).default(false).notNull(),
  invitedAt: integer('invited_at', {mode: 'timestamp_ms'}),
  acceptedAt: integer('accepted_at', {mode: 'timestamp_ms'}),
  createdAt: createdAt(),
  updatedAt: integer('updated_at', {mode: 'timestamp_ms'})
    .notNull()
    .default(sql`(unixepoch() * 1000)`)
    .$defaultFn(() => new Date()),
});

// One-time login links (magic links). Only the sha256 hash of the token is stored.
export const loginTokens = sqliteTable('login_tokens', {
  id: id(),
  email: text('email').notNull(),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: integer('expires_at', {mode: 'timestamp_ms'}).notNull(),
  usedAt: integer('used_at', {mode: 'timestamp_ms'}),
  createdAt: createdAt(),
}, table => [
  index('login_tokens_email_created_at_idx').on(table.email, table.createdAt),
]);

// Contact submissions table
export const submissions = sqliteTable('submissions', {
  id: id(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  createdAt: createdAt(),
  readAt: integer('read_at', {mode: 'timestamp_ms'}),
  archivedAt: integer('archived_at', {mode: 'timestamp_ms'}),
});

// Audit logs table for tracking all admin actions
export const auditLogs = sqliteTable('audit_logs', {
  id: id(),

  // Action details
  actionType: text('action_type', {enum: auditActionTypes}).notNull(),
  resourceType: text('resource_type').notNull(), // 'user', 'content:nieuws', 'session', etc.
  resourceId: text('resource_id'), // ID of affected resource (null for login/logout)

  // User who performed action
  userId: text('user_id').references(() => users.id, {onDelete: 'set null'}),
  userEmail: text('user_email').notNull(), // Stored for resilience if user is deleted
  userName: text('user_name'),

  // Request metadata
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  requestPath: text('request_path'),
  requestMethod: text('request_method'),

  // Data changes (JSON diff)
  dataBefore: text('data_before', {mode: 'json'}), // State before action
  dataAfter: text('data_after', {mode: 'json'}), // State after action
  metadata: text('metadata', {mode: 'json'}), // Additional context (e.g., bulk action IDs)

  createdAt: createdAt(),
}, table => [
  index('audit_logs_created_at_idx').on(table.createdAt),
  index('audit_logs_user_email_idx').on(table.userEmail),
  index('audit_logs_action_type_idx').on(table.actionType),
  index('audit_logs_resource_type_idx').on(table.resourceType),
  index('audit_logs_resource_id_idx').on(table.resourceId),
]);

// Visitor feedback
export const feedback = sqliteTable('feedback', {
  id: id(),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),
  email: text('email'),
  pageUrl: text('page_url'),
  pageTitle: text('page_title'),
  userAgent: text('user_agent'),
  createdAt: createdAt(),
  readAt: integer('read_at', {mode: 'timestamp_ms'}),
  archivedAt: integer('archived_at', {mode: 'timestamp_ms'}),
}, table => [
  index('feedback_created_at_idx').on(table.createdAt),
  index('feedback_rating_idx').on(table.rating),
]);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type LoginToken = typeof loginTokens.$inferSelect;
export type NewLoginToken = typeof loginTokens.$inferInsert;
export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
export type AuditActionType = (typeof auditActionTypes)[number];
export type Feedback = typeof feedback.$inferSelect;
export type NewFeedback = typeof feedback.$inferInsert;

// Re-export shared types for convenience
export type {SeasonalDecorationsConfig} from '../types';
