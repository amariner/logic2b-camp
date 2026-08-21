ALTER TABLE `bookings` ADD `deposit_paid_cents` integer DEFAULT 0 NOT NULL;
ALTER TABLE `bookings` ADD `deposit_collected_at` text;
ALTER TABLE `bookings` ADD `deposit_returned_at` text;
ALTER TABLE `bookings` ADD `access_granted_at` text;
ALTER TABLE `bookings` ADD `access_revoked_at` text;
