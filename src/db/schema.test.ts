import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("user settings schema", () => {
	it("stores mark-read-on-open as a persisted default-on preference", () => {
		const schemaSource = readFileSync(
			resolve(process.cwd(), "src/db/schema.ts"),
			"utf8",
		);
		const migrationSource = readFileSync(
			resolve(process.cwd(), "drizzle/0003_shallow_miracleman.sql"),
			"utf8",
		);

		expect(schemaSource).toContain(
			'markReadOnOpen: integer("mark_read_on_open"',
		);
		expect(schemaSource).toContain(".default(true)");
		expect(migrationSource).toContain(
			"ALTER TABLE `user` ADD `mark_read_on_open` integer DEFAULT true NOT NULL;",
		);
	});
});

describe("article content cache schema", () => {
	it("stores lazily extracted article markdown separately from metadata", () => {
		const schemaSource = readFileSync(
			resolve(process.cwd(), "src/db/schema.ts"),
			"utf8",
		);
		const migrationSource = readFileSync(
			resolve(process.cwd(), "drizzle/0006_breezy_moon_knight.sql"),
			"utf8",
		);

		expect(schemaSource).toContain(
			'export const articleContentCache = sqliteTable("article_content_cache"',
		);
		expect(schemaSource).toContain("markdown: text()");
		expect(schemaSource).toContain('plainText: text("plain_text")');
		expect(migrationSource).toContain("CREATE TABLE `article_content_cache`");
		expect(migrationSource).toContain("`markdown` text");
		expect(migrationSource).toContain("ON DELETE cascade");
	});
});

describe("tag shares schema", () => {
	it("stores one revocable unique sharing token per tag", () => {
		const schemaSource = readFileSync(
			resolve(process.cwd(), "src/db/schema.ts"),
			"utf8",
		);
		const migrationSource = readFileSync(
			resolve(process.cwd(), "drizzle/0007_familiar_power_pack.sql"),
			"utf8",
		);

		expect(schemaSource).toContain("export const tagShares = sqliteTable(");
		expect(schemaSource).toContain('"tag_shares"');
		expect(migrationSource).toContain("CREATE TABLE `tag_shares`");
		expect(migrationSource).toContain("`tag_id` text PRIMARY KEY NOT NULL");
		expect(migrationSource).toContain("ON DELETE cascade");
		expect(migrationSource).toContain(
			"CREATE UNIQUE INDEX `tag_shares_token_idx`",
		);
	});
});
