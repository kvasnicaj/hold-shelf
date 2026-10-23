CREATE TABLE `account_usage` (
	`user_id` text PRIMARY KEY NOT NULL,
	`article_count` integer DEFAULT 0 NOT NULL,
	`tag_count` integer DEFAULT 0 NOT NULL,
	`storage_bytes` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);

--> statement-breakpoint
INSERT INTO account_usage (user_id, article_count, tag_count, storage_bytes)
SELECT u.id,
 (SELECT count(*) FROM articles a WHERE a.user_id = u.id),
 (SELECT count(*) FROM tags t WHERE t.user_id = u.id),
 coalesce((SELECT sum(length(CAST(coalesce(a.url, '') AS BLOB)) + length(CAST(coalesce(a.title, '') AS BLOB)) + length(CAST(coalesce(a.description, '') AS BLOB)) + length(CAST(coalesce(a.hostname, '') AS BLOB)) + length(CAST(coalesce(a.favicon_url, '') AS BLOB))) FROM articles a WHERE a.user_id = u.id), 0)
 + coalesce((SELECT sum(length(CAST(coalesce(t.name, '') AS BLOB)) + length(CAST(coalesce(t.color, '') AS BLOB))) FROM tags t WHERE t.user_id = u.id), 0)
 + coalesce((SELECT sum(length(CAST(coalesce(c.markdown, '') AS BLOB)) + length(CAST(coalesce(c.plain_text, '') AS BLOB)) + length(CAST(coalesce(c.source_url, '') AS BLOB)) + length(CAST(coalesce(c.extraction_version, '') AS BLOB)) + length(CAST(coalesce(c.failure_reason, '') AS BLOB))) FROM article_content_cache c JOIN articles a ON a.id = c.article_id WHERE a.user_id = u.id), 0)
FROM user u;
--> statement-breakpoint
CREATE TRIGGER account_usage_limits BEFORE UPDATE ON account_usage BEGIN
 SELECT CASE WHEN NEW.article_count > 10000 AND NEW.article_count > OLD.article_count THEN RAISE(ABORT, 'ACCOUNT_ARTICLE_QUOTA') END;
 SELECT CASE WHEN NEW.tag_count > 1000 AND NEW.tag_count > OLD.tag_count THEN RAISE(ABORT, 'ACCOUNT_TAG_QUOTA') END;
 SELECT CASE WHEN NEW.storage_bytes > 262144000 AND NEW.storage_bytes > OLD.storage_bytes THEN RAISE(ABORT, 'ACCOUNT_STORAGE_QUOTA') END;
END;
--> statement-breakpoint
CREATE TRIGGER account_usage_user_insert AFTER INSERT ON user BEGIN
 INSERT INTO account_usage (user_id) VALUES (NEW.id);
END;
--> statement-breakpoint
CREATE TRIGGER articles_quota_owner BEFORE UPDATE OF user_id ON articles
 WHEN NEW.user_id != OLD.user_id BEGIN
 SELECT RAISE(ABORT, 'ACCOUNT_OWNER_IMMUTABLE');
END;
--> statement-breakpoint
CREATE TRIGGER articles_quota_insert AFTER INSERT ON articles BEGIN
 UPDATE account_usage SET article_count = article_count + 1, storage_bytes = storage_bytes + (length(CAST(coalesce(NEW.url, '') AS BLOB)) + length(CAST(coalesce(NEW.title, '') AS BLOB)) + length(CAST(coalesce(NEW.description, '') AS BLOB)) + length(CAST(coalesce(NEW.hostname, '') AS BLOB)) + length(CAST(coalesce(NEW.favicon_url, '') AS BLOB))) WHERE user_id = NEW.user_id;
END;
--> statement-breakpoint
CREATE TRIGGER articles_quota_update AFTER UPDATE ON articles BEGIN
 UPDATE account_usage SET storage_bytes = storage_bytes + (length(CAST(coalesce(NEW.url, '') AS BLOB)) + length(CAST(coalesce(NEW.title, '') AS BLOB)) + length(CAST(coalesce(NEW.description, '') AS BLOB)) + length(CAST(coalesce(NEW.hostname, '') AS BLOB)) + length(CAST(coalesce(NEW.favicon_url, '') AS BLOB))) - (length(CAST(coalesce(OLD.url, '') AS BLOB)) + length(CAST(coalesce(OLD.title, '') AS BLOB)) + length(CAST(coalesce(OLD.description, '') AS BLOB)) + length(CAST(coalesce(OLD.hostname, '') AS BLOB)) + length(CAST(coalesce(OLD.favicon_url, '') AS BLOB))) WHERE user_id = NEW.user_id;
END;
--> statement-breakpoint
CREATE TRIGGER articles_quota_delete BEFORE DELETE ON articles BEGIN
 UPDATE account_usage SET article_count = article_count - 1, storage_bytes = storage_bytes - ((length(CAST(coalesce(OLD.url, '') AS BLOB)) + length(CAST(coalesce(OLD.title, '') AS BLOB)) + length(CAST(coalesce(OLD.description, '') AS BLOB)) + length(CAST(coalesce(OLD.hostname, '') AS BLOB)) + length(CAST(coalesce(OLD.favicon_url, '') AS BLOB))) + coalesce((SELECT length(CAST(coalesce(c.markdown, '') AS BLOB)) + length(CAST(coalesce(c.plain_text, '') AS BLOB)) + length(CAST(coalesce(c.source_url, '') AS BLOB)) + length(CAST(coalesce(c.extraction_version, '') AS BLOB)) + length(CAST(coalesce(c.failure_reason, '') AS BLOB)) FROM article_content_cache c WHERE c.article_id = OLD.id), 0)) WHERE user_id = OLD.user_id;
END;
--> statement-breakpoint
CREATE TRIGGER tags_quota_owner BEFORE UPDATE OF user_id ON tags
 WHEN NEW.user_id != OLD.user_id BEGIN
 SELECT RAISE(ABORT, 'ACCOUNT_OWNER_IMMUTABLE');
END;
--> statement-breakpoint
CREATE TRIGGER tags_quota_insert AFTER INSERT ON tags BEGIN
 UPDATE account_usage SET tag_count = tag_count + 1, storage_bytes = storage_bytes + (length(CAST(coalesce(NEW.name, '') AS BLOB)) + length(CAST(coalesce(NEW.color, '') AS BLOB))) WHERE user_id = NEW.user_id;
END;
--> statement-breakpoint
CREATE TRIGGER tags_quota_update AFTER UPDATE ON tags BEGIN
 UPDATE account_usage SET storage_bytes = storage_bytes + (length(CAST(coalesce(NEW.name, '') AS BLOB)) + length(CAST(coalesce(NEW.color, '') AS BLOB))) - (length(CAST(coalesce(OLD.name, '') AS BLOB)) + length(CAST(coalesce(OLD.color, '') AS BLOB))) WHERE user_id = NEW.user_id;
END;
--> statement-breakpoint
CREATE TRIGGER tags_quota_delete BEFORE DELETE ON tags BEGIN
 UPDATE account_usage SET tag_count = tag_count - 1, storage_bytes = storage_bytes - ((length(CAST(coalesce(OLD.name, '') AS BLOB)) + length(CAST(coalesce(OLD.color, '') AS BLOB)))) WHERE user_id = OLD.user_id;
END;
--> statement-breakpoint
CREATE TRIGGER content_quota_owner BEFORE UPDATE OF article_id ON article_content_cache
 WHEN NEW.article_id != OLD.article_id BEGIN
 SELECT RAISE(ABORT, 'ACCOUNT_OWNER_IMMUTABLE');
END;
--> statement-breakpoint
CREATE TRIGGER content_quota_insert AFTER INSERT ON article_content_cache BEGIN
 UPDATE account_usage SET storage_bytes = storage_bytes + (length(CAST(coalesce(NEW.markdown, '') AS BLOB)) + length(CAST(coalesce(NEW.plain_text, '') AS BLOB)) + length(CAST(coalesce(NEW.source_url, '') AS BLOB)) + length(CAST(coalesce(NEW.extraction_version, '') AS BLOB)) + length(CAST(coalesce(NEW.failure_reason, '') AS BLOB)))
 WHERE user_id = (SELECT user_id FROM articles WHERE id = NEW.article_id);
END;
--> statement-breakpoint
CREATE TRIGGER content_quota_update AFTER UPDATE ON article_content_cache BEGIN
 UPDATE account_usage SET storage_bytes = storage_bytes + (length(CAST(coalesce(NEW.markdown, '') AS BLOB)) + length(CAST(coalesce(NEW.plain_text, '') AS BLOB)) + length(CAST(coalesce(NEW.source_url, '') AS BLOB)) + length(CAST(coalesce(NEW.extraction_version, '') AS BLOB)) + length(CAST(coalesce(NEW.failure_reason, '') AS BLOB))) - (length(CAST(coalesce(OLD.markdown, '') AS BLOB)) + length(CAST(coalesce(OLD.plain_text, '') AS BLOB)) + length(CAST(coalesce(OLD.source_url, '') AS BLOB)) + length(CAST(coalesce(OLD.extraction_version, '') AS BLOB)) + length(CAST(coalesce(OLD.failure_reason, '') AS BLOB)))
 WHERE user_id = (SELECT user_id FROM articles WHERE id = NEW.article_id);
END;
--> statement-breakpoint
CREATE TRIGGER content_quota_delete AFTER DELETE ON article_content_cache BEGIN
 UPDATE account_usage SET storage_bytes = storage_bytes + - (length(CAST(coalesce(OLD.markdown, '') AS BLOB)) + length(CAST(coalesce(OLD.plain_text, '') AS BLOB)) + length(CAST(coalesce(OLD.source_url, '') AS BLOB)) + length(CAST(coalesce(OLD.extraction_version, '') AS BLOB)) + length(CAST(coalesce(OLD.failure_reason, '') AS BLOB)))
 WHERE user_id = (SELECT user_id FROM articles WHERE id = OLD.article_id);
END;
--> statement-breakpoint
CREATE TRIGGER article_tags_quota AFTER INSERT ON article_tags
 WHEN (SELECT count(*) FROM article_tags WHERE article_id = NEW.article_id) > 100 BEGIN
 SELECT RAISE(ABORT, 'ACCOUNT_ARTICLE_TAG_QUOTA');
END;
