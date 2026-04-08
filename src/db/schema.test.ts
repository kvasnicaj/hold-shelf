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
