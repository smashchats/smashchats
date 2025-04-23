PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_contacts` (
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
	`blocked_at` integer,
	`active` integer DEFAULT false,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_contacts`("did_id", "did_ik", "did_ek", "did_signature", "did_endpoints", "notes", "meta_title", "meta_description", "meta_avatar", "scores", "smashed", "blocked_at", "active", "created_at", "updated_at") SELECT "did_id", "did_ik", "did_ek", "did_signature", "did_endpoints", "notes", "meta_title", "meta_description", "meta_avatar", "scores", "smashed", NULL, "active", "created_at", "updated_at" FROM `contacts`;--> statement-breakpoint
DROP TABLE `contacts`;--> statement-breakpoint
ALTER TABLE `__new_contacts` RENAME TO `contacts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;