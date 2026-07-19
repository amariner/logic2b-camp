CREATE TABLE `inventory_holds` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`unit_type_id` text NOT NULL,
	`date_from` text NOT NULL,
	`date_to` text NOT NULL,
	`occupancy` text,
	`expires_at` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`unit_type_id`) REFERENCES `unit_types`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `holds_type_dates_idx` ON `inventory_holds` (`unit_type_id`,`date_from`,`date_to`);--> statement-breakpoint
CREATE INDEX `holds_expires_idx` ON `inventory_holds` (`expires_at`);