CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`user_id` text,
	`entity` text NOT NULL,
	`entity_id` text NOT NULL,
	`action` text NOT NULL,
	`diff` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `audit_entity_idx` ON `audit_log` (`entity`,`entity_id`);--> statement-breakpoint
CREATE TABLE `booking_guests` (
	`booking_id` text NOT NULL,
	`guest_id` text NOT NULL,
	`is_lead` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `booking_guests_uq` ON `booking_guests` (`booking_id`,`guest_id`);--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`code` text NOT NULL,
	`status` text NOT NULL,
	`channel` text NOT NULL,
	`date_from` text NOT NULL,
	`date_to` text NOT NULL,
	`unit_type_id` text NOT NULL,
	`unit_id` text,
	`occupancy` text NOT NULL,
	`extras` text NOT NULL,
	`price_breakdown` text NOT NULL,
	`total_cents` integer NOT NULL,
	`paid_cents` integer DEFAULT 0 NOT NULL,
	`tourist_tax_cents` integer DEFAULT 0 NOT NULL,
	`deposit_cents` integer DEFAULT 0 NOT NULL,
	`notes` text,
	`locale` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`unit_type_id`) REFERENCES `unit_types`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bookings_code_uq` ON `bookings` (`code`);--> statement-breakpoint
CREATE INDEX `bookings_type_dates_idx` ON `bookings` (`unit_type_id`,`date_from`,`date_to`);--> statement-breakpoint
CREATE INDEX `bookings_unit_dates_idx` ON `bookings` (`unit_id`,`date_from`,`date_to`);--> statement-breakpoint
CREATE INDEX `bookings_status_idx` ON `bookings` (`status`);--> statement-breakpoint
CREATE TABLE `enquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`date_from` text,
	`date_to` text,
	`occupancy` text,
	`unit_type_id` text,
	`message` text NOT NULL,
	`contact` text NOT NULL,
	`locale` text NOT NULL,
	`source` text NOT NULL,
	`converted_booking_id` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`unit_type_id`) REFERENCES `unit_types`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `enquiries_status_idx` ON `enquiries` (`status`);--> statement-breakpoint
CREATE TABLE `extras` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`name_i18n` text NOT NULL,
	`price_cents` integer NOT NULL,
	`per` text NOT NULL,
	`required` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `guests` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`name` text NOT NULL,
	`surname` text NOT NULL,
	`doc_type` text,
	`doc_number` text,
	`birthdate` text,
	`nationality` text,
	`email` text,
	`phone` text,
	`address` text,
	`gdpr_consent_at` text
);
--> statement-breakpoint
CREATE TABLE `inventory_blocks` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`unit_id` text,
	`unit_type_id` text,
	`date_from` text NOT NULL,
	`date_to` text NOT NULL,
	`reason` text NOT NULL,
	FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`unit_type_id`) REFERENCES `unit_types`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `blocks_unit_dates_idx` ON `inventory_blocks` (`unit_id`,`date_from`,`date_to`);--> statement-breakpoint
CREATE INDEX `blocks_type_dates_idx` ON `inventory_blocks` (`unit_type_id`,`date_from`,`date_to`);--> statement-breakpoint
CREATE TABLE `meta` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notifications_log` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`booking_id` text,
	`enquiry_id` text,
	`channel` text NOT NULL,
	`template` text NOT NULL,
	`status` text NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`sent_at` text,
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`enquiry_id`) REFERENCES `enquiries`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`booking_id` text NOT NULL,
	`provider` text NOT NULL,
	`provider_ref` text,
	`amount_cents` integer NOT NULL,
	`status` text NOT NULL,
	`raw` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `payments_booking_idx` ON `payments` (`booking_id`);--> statement-breakpoint
CREATE TABLE `rate_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`unit_type_id` text NOT NULL,
	`season_id` text NOT NULL,
	`base_cents` integer NOT NULL,
	`extra_person_cents` integer DEFAULT 0 NOT NULL,
	`child_cents` integer DEFAULT 0 NOT NULL,
	`pet_cents` integer DEFAULT 0 NOT NULL,
	`electricity_cents` integer DEFAULT 0 NOT NULL,
	`vehicle_cents` integer DEFAULT 0 NOT NULL,
	`min_stay` integer DEFAULT 1 NOT NULL,
	`max_stay` integer,
	`arrival_days` text,
	`departure_days` text,
	FOREIGN KEY (`unit_type_id`) REFERENCES `unit_types`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`season_id`) REFERENCES `seasons_calendar`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `rate_plans_type_season_idx` ON `rate_plans` (`unit_type_id`,`season_id`);--> statement-breakpoint
CREATE TABLE `rate_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`type` text NOT NULL,
	`conditions` text NOT NULL,
	`discount` text NOT NULL,
	`stackable` integer DEFAULT false NOT NULL,
	`priority` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `seasons_calendar` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`name` text NOT NULL,
	`date_from` text NOT NULL,
	`date_to` text NOT NULL,
	`priority` integer DEFAULT 0 NOT NULL,
	`is_open` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE INDEX `seasons_dates_idx` ON `seasons_calendar` (`date_from`,`date_to`);--> statement-breakpoint
CREATE TABLE `tenants` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`tier` integer NOT NULL,
	`timezone` text NOT NULL,
	`currency` text NOT NULL,
	`locales` text NOT NULL,
	`modules` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tenants_slug_unique` ON `tenants` (`slug`);--> statement-breakpoint
CREATE TABLE `unit_types` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`kind` text NOT NULL,
	`name_i18n` text NOT NULL,
	`capacity_min` integer DEFAULT 1 NOT NULL,
	`capacity_max` integer NOT NULL,
	`included_persons` integer NOT NULL,
	`features` text NOT NULL,
	`photos` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `units` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`unit_type_id` text NOT NULL,
	`code` text NOT NULL,
	`attributes` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	FOREIGN KEY (`unit_type_id`) REFERENCES `unit_types`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `units_code_uq` ON `units` (`code`);--> statement-breakpoint
CREATE INDEX `units_type_idx` ON `units` (`unit_type_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`email` text NOT NULL,
	`role` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_uq` ON `users` (`email`);
--> statement-breakpoint
INSERT INTO `meta` (`key`, `value`) VALUES ('schema_version', '1');
