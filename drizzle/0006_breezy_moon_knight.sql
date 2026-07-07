CREATE TABLE `article_content_cache` (
	`article_id` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`markdown` text,
	`plain_text` text,
	`word_count` integer,
	`failure_reason` text,
	`source_url` text NOT NULL,
	`extraction_version` text NOT NULL,
	`fetched_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE cascade
);
