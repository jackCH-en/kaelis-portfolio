CREATE TABLE `now_attachments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entry_id` integer NOT NULL,
	`object_key` text NOT NULL,
	`file_name` text NOT NULL,
	`content_type` text NOT NULL,
	`size` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `now_attachments_object_key_unique` ON `now_attachments` (`object_key`);--> statement-breakpoint
CREATE INDEX `now_attachments_entry_idx` ON `now_attachments` (`entry_id`,`id`);--> statement-breakpoint
CREATE TABLE `now_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`category` text DEFAULT 'CURRENT PRACTICE' NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `now_entries_date_idx` ON `now_entries` (`date`,`id`);