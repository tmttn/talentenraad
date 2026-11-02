CREATE TABLE `rate_limit_hits` (
	`id` text PRIMARY KEY NOT NULL,
	`scope` text NOT NULL,
	`key_hash` text NOT NULL,
	`hit_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `rate_limit_hits_scope_key_hit_at_idx` ON `rate_limit_hits` (`scope`,`key_hash`,`hit_at`);--> statement-breakpoint
CREATE INDEX `rate_limit_hits_hit_at_idx` ON `rate_limit_hits` (`hit_at`);