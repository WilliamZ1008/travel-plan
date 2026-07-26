CREATE TABLE `trip_state` (
	`id` text PRIMARY KEY NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`data` text NOT NULL,
	`updated_at` integer NOT NULL
);
