CREATE TABLE `devices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`api_key` text NOT NULL,
	`user_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `devices_api_key_unique` ON `devices` (`api_key`);--> statement-breakpoint
CREATE TABLE `energy_readings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ts` integer NOT NULL,
	`voltage` real NOT NULL,
	`current` real NOT NULL,
	`power` real NOT NULL,
	`energy` real,
	`device_id` integer,
	`user_id` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`device_id`) REFERENCES `devices`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `energy_readings_ts_idx` ON `energy_readings` (`ts`);--> statement-breakpoint
CREATE INDEX `energy_readings_device_ts_idx` ON `energy_readings` (`device_id`,`ts`);