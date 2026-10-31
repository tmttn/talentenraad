CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`action_type` text NOT NULL,
	`resource_type` text NOT NULL,
	`resource_id` text,
	`user_id` text,
	`user_email` text NOT NULL,
	`user_name` text,
	`ip_address` text,
	`user_agent` text,
	`request_path` text,
	`request_method` text,
	`data_before` text,
	`data_after` text,
	`metadata` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `audit_logs_created_at_idx` ON `audit_logs` (`created_at`);--> statement-breakpoint
CREATE INDEX `audit_logs_user_email_idx` ON `audit_logs` (`user_email`);--> statement-breakpoint
CREATE INDEX `audit_logs_action_type_idx` ON `audit_logs` (`action_type`);--> statement-breakpoint
CREATE INDEX `audit_logs_resource_type_idx` ON `audit_logs` (`resource_type`);--> statement-breakpoint
CREATE INDEX `audit_logs_resource_id_idx` ON `audit_logs` (`resource_id`);--> statement-breakpoint
CREATE TABLE `feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`rating` integer NOT NULL,
	`comment` text,
	`email` text,
	`page_url` text,
	`page_title` text,
	`user_agent` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`read_at` integer,
	`archived_at` integer
);
--> statement-breakpoint
CREATE INDEX `feedback_created_at_idx` ON `feedback` (`created_at`);--> statement-breakpoint
CREATE INDEX `feedback_rating_idx` ON `feedback` (`rating`);--> statement-breakpoint
CREATE TABLE `login_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`used_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `login_tokens_token_hash_unique` ON `login_tokens` (`token_hash`);--> statement-breakpoint
CREATE INDEX `login_tokens_email_created_at_idx` ON `login_tokens` (`email`,`created_at`);--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`subject` text NOT NULL,
	`message` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`read_at` integer,
	`archived_at` integer
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`is_admin` integer DEFAULT false NOT NULL,
	`invited_at` integer,
	`accepted_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);