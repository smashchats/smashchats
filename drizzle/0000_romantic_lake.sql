CREATE TABLE `contacts` (
	`did_id` text PRIMARY KEY NOT NULL,
	`did_ik` text NOT NULL,
	`did_ek` text NOT NULL,
	`did_signature` text NOT NULL,
	`did_endpoints` text NOT NULL,
	`is_self` integer DEFAULT false,
	`notes` text,
	`meta_title` text,
	`meta_description` text,
	`meta_picture` text,
	`scores` text,
	`smashed` integer DEFAULT false,
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
--> statement-breakpoint
CREATE VIEW `chat_list_view` AS select "contacts"."did_id", "contacts"."meta_title", "contacts"."meta_picture", "contacts"."smashed", "messages"."data", "messages"."type", "trust_relations"."name", MAX("messages"."created_at") as "most_recent_message_date", COUNT("messages"."sha256") - COUNT("messages"."date_read") as "unread_count" from "contacts" left join "messages" on "contacts"."did_id" = "messages"."discussion_id" left join "trust_relations" on "contacts"."did_id" = "trust_relations"."did_id" group by "messages"."discussion_id" order by "messages"."created_at" desc;