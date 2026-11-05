CREATE TABLE `order_lines` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`volgorde` integer NOT NULL,
	`product_id` text NOT NULL,
	`naam` text NOT NULL,
	`keuzes` text NOT NULL,
	`prijs_cent` integer NOT NULL,
	`aantal` integer NOT NULL,
	`meegegeven` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `order_lines_order_idx` ON `order_lines` (`order_id`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`actie` text NOT NULL,
	`nummer` integer NOT NULL,
	`volgnummer` integer NOT NULL,
	`mededeling` text NOT NULL,
	`token` text,
	`korte_code` text NOT NULL,
	`naam` text NOT NULL,
	`email` text NOT NULL,
	`telefoon` text,
	`kind_naam` text,
	`kind_klas` text,
	`afhaal_id` text NOT NULL,
	`afhaal_datum` text NOT NULL,
	`afhaal_label` text NOT NULL,
	`afhaal_plaats` text NOT NULL,
	`totaal_cent` integer NOT NULL,
	`status` text NOT NULL,
	`betaalwijze` text,
	`betaalbron` text,
	`betaald_op` integer,
	`betaald_door` text,
	`afgehaald_op` integer,
	`afgehaald_door` text,
	`geannuleerd_op` integer,
	`geannuleerd_door` text,
	`annuleer_reden` text,
	`terugbetaald_op` integer,
	`terugbetaald_door` text,
	`notitie` text,
	`bevestiging_verstuurd_op` integer,
	`qr_verstuurd_op` integer,
	`gewist_op` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_volgnummer_unique` ON `orders` (`volgnummer`);--> statement-breakpoint
CREATE UNIQUE INDEX `orders_mededeling_unique` ON `orders` (`mededeling`);--> statement-breakpoint
CREATE UNIQUE INDEX `orders_token_unique` ON `orders` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `orders_actie_nummer_idx` ON `orders` (`actie`,`nummer`);--> statement-breakpoint
CREATE UNIQUE INDEX `orders_actie_korte_code_idx` ON `orders` (`actie`,`korte_code`);--> statement-breakpoint
CREATE INDEX `orders_actie_status_idx` ON `orders` (`actie`,`status`);--> statement-breakpoint
CREATE INDEX `orders_actie_afhaal_idx` ON `orders` (`actie`,`afhaal_id`);