import {relations, sql} from 'drizzle-orm';
import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
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

export const roles = ['admin', 'redacteur'] as const;
export type Role = typeof roles[number];
export const isRole = (value: unknown): value is Role => roles.includes(value as Role);

// Users table for admin access
export const users = sqliteTable('users', {
  id: id(),
  email: text('email').notNull().unique(),
  name: text('name'),
  // Legacy flag, no longer read; role is the source of truth. Kept in sync on writes.
  isAdmin: integer('is_admin', {mode: 'boolean'}).default(false).notNull(),
  role: text('role', {enum: roles}).default('redacteur').notNull(),
  /** Has access to the bank account: may confirm payments and refunds, apart from the role. */
  bankToegang: integer('bank_toegang', {mode: 'boolean'}).default(false).notNull(),
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

// Rate limit hits for public forms, so the limit survives a restart. The key is an HMAC of the
// client IP (never the IP itself); rows older than the window are deleted on every check.
export const rateLimitHits = sqliteTable('rate_limit_hits', {
  id: id(),
  scope: text('scope').notNull(),
  keyHash: text('key_hash').notNull(),
  hitAt: integer('hit_at', {mode: 'timestamp_ms'}).notNull(),
}, table => [
  index('rate_limit_hits_scope_key_hit_at_idx').on(table.scope, table.keyHash, table.hitAt),
  index('rate_limit_hits_hit_at_idx').on(table.hitAt),
]);


// Orders for a sale (actie, content/acties/<slug>). Names, prices and choices are copied from the
// content at the time of ordering, so editing a sale never changes an existing order.
export const orderStatuses = ['wacht', 'betaald', 'afgehaald', 'geannuleerd', 'terugbetalen'] as const;
export type OrderStatus = typeof orderStatuses[number];
export const betaalwijzen = ['overschrijving', 'cash'] as const;
export const betaalbronnen = ['manueel', 'bank', 'online'] as const;

const timestamp = (name: string) => integer(name, {mode: 'timestamp_ms'});

export const orders = sqliteTable('orders', {
  id: id(),
  actie: text('actie').notNull(),
  /** Runs per sale: 1, 2, 3 … */
  nummer: integer('nummer').notNull(),
  /** Runs over all sales; the structured payment reference is made from it. */
  volgnummer: integer('volgnummer').notNull().unique(),
  /** Structured reference as 12 digits (shown as +++123/4567/89002+++). */
  mededeling: text('mededeling').notNull().unique(),
  /** 128-bit random token in the QR link /b/<token>; cleared when the personal data is wiped. */
  token: text('token').unique(),
  /** Six characters without look-alikes, for when scanning fails. */
  korteCode: text('korte_code').notNull(),
  naam: text('naam').notNull(),
  email: text('email').notNull(),
  telefoon: text('telefoon'),
  kindNaam: text('kind_naam'),
  kindKlas: text('kind_klas'),
  afhaalId: text('afhaal_id').notNull(),
  /** YYYY-MM-DD, also the start of the retention period. */
  afhaalDatum: text('afhaal_datum').notNull(),
  /** `Vrijdag 22 januari, 17:00 - 19:00`, as it was when ordering. */
  afhaalLabel: text('afhaal_label').notNull(),
  afhaalPlaats: text('afhaal_plaats').notNull(),
  totaalCent: integer('totaal_cent').notNull(),
  status: text('status', {enum: orderStatuses}).notNull(),
  betaalwijze: text('betaalwijze', {enum: betaalwijzen}),
  betaalbron: text('betaalbron', {enum: betaalbronnen}),
  betaaldOp: timestamp('betaald_op'),
  betaaldDoor: text('betaald_door'),
  afgehaaldOp: timestamp('afgehaald_op'),
  afgehaaldDoor: text('afgehaald_door'),
  geannuleerdOp: timestamp('geannuleerd_op'),
  geannuleerdDoor: text('geannuleerd_door'),
  annuleerReden: text('annuleer_reden'),
  terugbetaaldOp: timestamp('terugbetaald_op'),
  terugbetaaldDoor: text('terugbetaald_door'),
  notitie: text('notitie'),
  bevestigingVerstuurdOp: timestamp('bevestiging_verstuurd_op'),
  qrVerstuurdOp: timestamp('qr_verstuurd_op'),
  gewistOp: timestamp('gewist_op'),
  aangemaaktOp: createdAt(),
}, table => [
  uniqueIndex('orders_actie_nummer_idx').on(table.actie, table.nummer),
  uniqueIndex('orders_actie_korte_code_idx').on(table.actie, table.korteCode),
  index('orders_actie_status_idx').on(table.actie, table.status),
  index('orders_actie_afhaal_idx').on(table.actie, table.afhaalId),
]);

export type GekozenKeuze = {optie: string; keuze: string};

export const orderLines = sqliteTable('order_lines', {
  id: id(),
  orderId: text('order_id').notNull().references(() => orders.id, {onDelete: 'cascade'}),
  volgorde: integer('volgorde').notNull(),
  productId: text('product_id').notNull(),
  naam: text('naam').notNull(),
  keuzes: text('keuzes', {mode: 'json'}).$type<GekozenKeuze[]>().notNull(),
  /** Price per piece in cents, surcharges included. */
  prijsCent: integer('prijs_cent').notNull(),
  aantal: integer('aantal').notNull(),
  meegegeven: integer('meegegeven', {mode: 'boolean'}).default(false).notNull(),
}, table => [
  index('order_lines_order_idx').on(table.orderId),
]);

export const ordersRelations = relations(orders, ({many}) => ({
  regels: many(orderLines),
}));

export const orderLinesRelations = relations(orderLines, ({one}) => ({
  order: one(orders, {fields: [orderLines.orderId], references: [orders.id]}),
}));

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderLine = typeof orderLines.$inferSelect;
export type NewOrderLine = typeof orderLines.$inferInsert;
