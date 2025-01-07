CREATE TABLE `contacts` (
	`did_id` text PRIMARY KEY NOT NULL,
	`did_ik` text,
	`did_ek` text,
	`did_signature` text,
	`did_endpoints` text,
	`notes` text,
	`meta_title` text,
	`meta_description` text,
	`meta_avatar` text,
	`scores` text,
	`smashed` integer DEFAULT false,
	`blocked` integer DEFAULT false,
	`active` integer DEFAULT false,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`sha256` text PRIMARY KEY NOT NULL,
	`timestamp` integer DEFAULT (unixepoch()) NOT NULL,
	`type` text NOT NULL,
	`data` text NOT NULL,
	`after_sha256` text,
	`reply_to_sha256` text,
	`from_did_id` text NOT NULL,
	`discussion_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`date_delivered` integer,
	`date_read` integer,
	FOREIGN KEY (`from_did_id`) REFERENCES `contacts`(`did_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`discussion_id`) REFERENCES `contacts`(`did_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `trust_relations` (
	`did_id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`name` text NOT NULL
);
