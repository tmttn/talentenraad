ALTER TABLE `users` ADD `role` text DEFAULT 'redacteur' NOT NULL;--> statement-breakpoint
UPDATE `users` SET `role` = 'admin' WHERE `is_admin` = 1;
