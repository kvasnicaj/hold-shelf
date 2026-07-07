import { sql } from "drizzle-orm";
import {
	index,
	integer,
	primaryKey,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

// ── Better Auth tables ──────────────────────────────────────────────────────

export const user = sqliteTable("user", {
	id: text().primaryKey(),
	name: text().notNull(),
	email: text().notNull().unique(),
	emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
	image: text(),
	markReadOnOpen: integer("mark_read_on_open", { mode: "boolean" })
		.notNull()
		.default(true),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const session = sqliteTable("session", {
	id: text().primaryKey(),
	expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	token: text().notNull().unique(),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
	id: text().primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: integer("access_token_expires_at", {
		mode: "timestamp",
	}),
	refreshTokenExpiresAt: integer("refresh_token_expires_at", {
		mode: "timestamp",
	}),
	scope: text(),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
	id: text().primaryKey(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	createdAt: integer("created_at", { mode: "timestamp" }),
	updatedAt: integer("updated_at", { mode: "timestamp" }),
});

// ── App tables ──────────────────────────────────────────────────────────────

export const articles = sqliteTable(
	"articles",
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => nanoid()),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		url: text().notNull(),
		title: text(),
		description: text(),
		hostname: text(),
		faviconUrl: text("favicon_url"),
		isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
		isFavorite: integer("is_favorite", { mode: "boolean" })
			.notNull()
			.default(false),
		createdAt: integer("created_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`),
		updatedAt: integer("updated_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`),
		readAt: integer("read_at", { mode: "timestamp" }),
	},
	(table) => [uniqueIndex("articles_user_url_idx").on(table.userId, table.url)],
);

export const tags = sqliteTable(
	"tags",
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => nanoid()),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: text().notNull(),
		color: text(),
		createdAt: integer("created_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`),
	},
	(table) => [uniqueIndex("tags_user_name_idx").on(table.userId, table.name)],
);

export const articleTags = sqliteTable(
	"article_tags",
	{
		articleId: text("article_id")
			.notNull()
			.references(() => articles.id, { onDelete: "cascade" }),
		tagId: text("tag_id")
			.notNull()
			.references(() => tags.id, { onDelete: "cascade" }),
	},
	(table) => [
		primaryKey({ columns: [table.articleId, table.tagId] }),
		index("article_tags_tag_id_idx").on(table.tagId),
	],
);

export const articleContentCache = sqliteTable("article_content_cache", {
	articleId: text("article_id")
		.primaryKey()
		.references(() => articles.id, { onDelete: "cascade" }),
	status: text({ enum: ["ready", "unavailable"] }).notNull(),
	markdown: text(),
	plainText: text("plain_text"),
	wordCount: integer("word_count"),
	failureReason: text("failure_reason"),
	sourceUrl: text("source_url").notNull(),
	extractionVersion: text("extraction_version").notNull(),
	fetchedAt: integer("fetched_at", { mode: "timestamp" }).notNull(),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
});

export const apiTokens = sqliteTable(
	"api_tokens",
	{
		userId: text("user_id")
			.primaryKey()
			.references(() => user.id, { onDelete: "cascade" }),
		tokenHash: text("token_hash").notNull(),
		tokenPrefix: text("token_prefix").notNull(),
		createdAt: integer("created_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`),
		lastUsedAt: integer("last_used_at", { mode: "timestamp" }),
	},
	(table) => [uniqueIndex("api_tokens_token_hash_idx").on(table.tokenHash)],
);

export const rateLimits = sqliteTable(
	"rate_limits",
	{
		name: text().notNull(),
		key: text().notNull(),
		count: integer().notNull(),
		resetAt: integer("reset_at", { mode: "number" }).notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`),
	},
	(table) => [
		primaryKey({ columns: [table.name, table.key] }),
		index("rate_limits_reset_at_idx").on(table.resetAt),
	],
);
