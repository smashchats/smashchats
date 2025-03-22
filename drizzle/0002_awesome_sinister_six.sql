CREATE TABLE `media` (
	`sha256` text PRIMARY KEY NOT NULL,
	`file_path` text NOT NULL,
	`mime_type` text NOT NULL,
	`media_type` text NOT NULL,
	`width` integer,
	`height` integer,
	`duration` integer,
	`size` integer NOT NULL,
	`thumbnail_path` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
