-- E-mejoras: datos operativos de llegada. Migración aditiva y compatible.
ALTER TABLE `bookings` ADD `vehicle_plate` text;--> statement-breakpoint
ALTER TABLE `bookings` ADD `arrival_eta` text;--> statement-breakpoint
ALTER TABLE `bookings` ADD `access_credential` text;--> statement-breakpoint
CREATE INDEX `bookings_vehicle_plate_idx` ON `bookings` (`vehicle_plate`);--> statement-breakpoint
CREATE INDEX `bookings_arrival_eta_idx` ON `bookings` (`arrival_eta`);
