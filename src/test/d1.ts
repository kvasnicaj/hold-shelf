import { readdir, readFile } from "node:fs/promises";
import { drizzle } from "drizzle-orm/d1";
import { convertV4MiniflareOptions, Miniflare } from "miniflare";
import * as schema from "#/db/schema";
export async function createTestDatabase() {
	const runtime = new Miniflare(
		convertV4MiniflareOptions({
			modules: true,
			script: "export default {fetch(){return new Response('test')}}",
			compatibilityDate: "2026-06-01",
			d1Databases: ["DB"],
		}),
	);
	const binding = await runtime.getD1Database("DB");
	const files = (await readdir("drizzle"))
		.filter((file) => file.endsWith(".sql"))
		.sort();
	for (const file of files) {
		const migration = await readFile(`drizzle/${file}`, "utf8");
		for (const statement of migration.split("--> statement-breakpoint"))
			if (statement.trim()) await binding.exec(statement.replace(/\n/g, " "));
	}
	const db = drizzle(binding as unknown as D1Database, { schema });
	return { runtime, db, binding };
}
