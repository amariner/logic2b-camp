-- Presupuesto D1: distingue fixtures de datos reales y elimina los tres scans
-- dominantes observados en producción. La retroclasificación usa exclusivamente
-- los IDs numéricos cortos deterministas del seed; los IDs reales de `uid()`
-- tienen 12 caracteres tras el prefijo y permanecen con `demo_fixture = 0`.
ALTER TABLE `bookings` ADD `demo_fixture` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `guests` ADD `demo_fixture` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `enquiries` ADD `demo_fixture` integer DEFAULT 0 NOT NULL;--> statement-breakpoint

UPDATE `bookings`
SET `demo_fixture` = 1
WHERE id LIKE 'bkg_%'
  AND substr(id, 5) <> ''
  AND length(substr(id, 5)) <= 4
  AND substr(id, 5) NOT GLOB '*[^0-9]*';--> statement-breakpoint
UPDATE `guests`
SET `demo_fixture` = 1
WHERE id LIKE 'gst_%'
  AND substr(id, 5) <> ''
  AND length(substr(id, 5)) <= 4
  AND substr(id, 5) NOT GLOB '*[^0-9]*';--> statement-breakpoint
UPDATE `enquiries`
SET `demo_fixture` = 1
WHERE id LIKE 'enq_%'
  AND substr(id, 5) <> ''
  AND length(substr(id, 5)) <= 3
  AND substr(id, 5) NOT GLOB '*[^0-9]*';--> statement-breakpoint

-- 137,5 M filas/7d: sweep RGPD buscaba cada guest_id sin índice.
CREATE INDEX `booking_guests_guest_idx` ON `booking_guests` (`guest_id`);--> statement-breakpoint
-- Joins de listas/planning: una sola fila titular por reserva.
CREATE INDEX `booking_guests_lead_idx` ON `booking_guests` (`booking_id`,`is_lead`);--> statement-breakpoint
-- 5,2 M filas/7d: deduplicación de avisos por reserva+plantilla.
CREATE INDEX `notifications_booking_template_idx` ON `notifications_log` (`booking_id`,`template`);--> statement-breakpoint
CREATE INDEX `notifications_status_created_idx` ON `notifications_log` (`status`,`created_at`);--> statement-breakpoint

CREATE INDEX `bookings_created_idx` ON `bookings` (`created_at`);--> statement-breakpoint
CREATE INDEX `bookings_date_from_idx` ON `bookings` (`date_from`);--> statement-breakpoint
CREATE INDEX `bookings_date_to_idx` ON `bookings` (`date_to`);--> statement-breakpoint
CREATE INDEX `bookings_pending_cron_idx` ON `bookings` (`status`,`channel`,`created_at`);--> statement-breakpoint
CREATE INDEX `bookings_arrival_cron_idx` ON `bookings` (`status`,`date_from`);--> statement-breakpoint
CREATE INDEX `bookings_fixture_idx` ON `bookings` (`demo_fixture`);--> statement-breakpoint
CREATE INDEX `guests_fixture_idx` ON `guests` (`demo_fixture`);--> statement-breakpoint
CREATE INDEX `guests_name_idx` ON `guests` (`surname`,`name`);--> statement-breakpoint
CREATE INDEX `enquiries_fixture_created_idx` ON `enquiries` (`demo_fixture`,`created_at`);
