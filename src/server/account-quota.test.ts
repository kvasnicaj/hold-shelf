import { readFile } from "node:fs/promises";
import { eq, sql } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, expect, it, vi } from "vitest";
import {
	accountUsage,
	articleContentCache,
	articles,
	articleTags,
	articleTrash,
	rateLimits,
	tags,
	user,
} from "#/db/schema";
import { ACCOUNT_QUOTAS, withQuotaErrors } from "#/server/account-quota";
import { createArticlesRepository } from "#/server/articles-repository";
import { importBackupArticles } from "#/server/library-import";
import type { BackupArticle } from "#/server/library-schemas";
import { createTagsRepository } from "#/server/tags-repository";
import { createTestDatabase } from "#/test/d1";

const { getDbMock } = vi.hoisted(() => ({ getDbMock: vi.fn() }));
vi.mock("#/db/index", () => ({ getDb: getDbMock }));
let database: Awaited<ReturnType<typeof createTestDatabase>>;
const owner = {
	id: "owner",
	name: "Owner",
	email: "owner@example.com",
	emailVerified: true,
	createdAt: new Date(),
	updatedAt: new Date(),
};
function record(
	id: string,
	overrides: Partial<BackupArticle> = {},
): BackupArticle {
	return {
		url: `https://example.com/${id}`,
		title: "Title",
		description: null,
		faviconUrl: null,
		isRead: false,
		isFavorite: false,
		createdAt: new Date().toISOString(),
		readAt: null,
		tags: [],
		content: null,
		progress: 0,
		trashed: false,
		...overrides,
	};
}
async function usage() {
	return (
		await database.db
			.select()
			.from(accountUsage)
			.where(eq(accountUsage.userId, "owner"))
	)[0];
}
async function seedQuota(values: Partial<typeof accountUsage.$inferInsert>) {
	await database.db
		.update(accountUsage)
		.set(values)
		.where(eq(accountUsage.userId, "owner"));
}
beforeAll(async () => {
	database = await createTestDatabase();
}, 30000);
afterAll(async () => {
	await database?.runtime.dispose();
});
beforeEach(async () => {
	getDbMock.mockReturnValue(database.db);
	await database.db.delete(user);
	await database.db.delete(rateLimits);
	await database.db.insert(user).values(owner);
});

it("serializes concurrent imports at the shared article quota and rolls back rejected records", async () => {
	await seedQuota({ articleCount: ACCOUNT_QUOTAS.articles - 1 });
	const results = await Promise.allSettled(
		Array.from({ length: 5 }, (_, i) =>
			importBackupArticles("owner", [
				record(`${i}`, { tags: [{ name: `tag-${i}`, color: null }] }),
			]),
		),
	);
	expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
	expect(
		results
			.filter((r) => r.status === "rejected")
			.every(
				(r) =>
					r.status === "rejected" &&
					r.reason.message.includes("10,000 articles"),
			),
	).toBe(true);
	expect(await database.db.select().from(articles)).toHaveLength(1);
	expect(await database.db.select().from(tags)).toHaveLength(1);
	expect((await usage()).articleCount).toBe(ACCOUNT_QUOTAS.articles);
	// Ordinary saves share the exact same database enforcement.
	await expect(
		createArticlesRepository().createArticle({
			userId: "owner",
			url: "https://example.com/new",
			metadata: {
				title: null,
				description: null,
				hostname: "example.com",
				faviconUrl: null,
			},
		}),
	).rejects.toThrow("10,000 articles");
});

it("rolls back article, tags and counters when import content crosses storage quota", async () => {
	await seedQuota({ storageBytes: ACCOUNT_QUOTAS.storageBytes - 200 });
	const before = await usage();
	await expect(
		importBackupArticles("owner", [
			record("large", {
				tags: [{ name: "new tag", color: null }],
				content: {
					markdown: "😀".repeat(100),
					plainText: "é".repeat(100),
					wordCount: 1,
					fetchedAt: new Date().toISOString(),
				},
			}),
		]),
	).rejects.toThrow("250 MiB");
	expect(await database.db.select().from(articles)).toHaveLength(0);
	expect(await database.db.select().from(tags)).toHaveLength(0);
	expect(await database.db.select().from(articleContentCache)).toHaveLength(0);
	expect(await usage()).toEqual(before);
});

it("enforces tag quota on imports and ordinary tags, without orphan records", async () => {
	await seedQuota({ tagCount: ACCOUNT_QUOTAS.tags });
	await expect(
		importBackupArticles("owner", [
			record("new", { tags: [{ name: "new tag", color: null }] }),
		]),
	).rejects.toThrow("1,000 tags");
	await expect(
		createTagsRepository().createTag({
			userId: "owner",
			name: "new",
			color: null,
		}),
	).rejects.toThrow("1,000 tags");
	expect(await database.db.select().from(articles)).toHaveLength(0);
	expect((await usage()).articleCount).toBe(0);
});

it("counts actual UTF-8 bytes across cache upserts and metadata edits and releases all bytes on permanent deletion", async () => {
	const r = record("unicode", {
		title: "😀",
		tags: [{ name: "é", color: null }],
	});
	await importBackupArticles("owner", [r]);
	const [{ id }] = await database.db.select().from(articles);
	const initial = (await usage()).storageBytes;
	expect(initial).toBe(
		new TextEncoder().encode(`${r.url}example.com😀é`).byteLength,
	);
	const repo = createArticlesRepository();
	const content = {
		articleId: id,
		status: "ready" as const,
		markdown: "😀",
		plainText: "é",
		wordCount: 1,
		failureReason: null,
		sourceUrl: r.url,
		extractionVersion: "v1",
		fetchedAt: new Date(),
		updatedAt: new Date(),
	};
	await repo.upsertArticleContentCache(content);
	expect((await usage()).storageBytes).toBe(
		initial + new TextEncoder().encode(`😀é${r.url}v1`).byteLength,
	);
	await repo.upsertArticleContentCache({ ...content, markdown: "😀😀" });
	expect((await usage()).storageBytes).toBe(
		initial + new TextEncoder().encode(`😀😀é${r.url}v1`).byteLength,
	);
	await database.db
		.update(articles)
		.set({ title: "😀😀" })
		.where(eq(articles.id, id));
	const current = await usage();
	expect(current.storageBytes).toBe(
		initial + new TextEncoder().encode(`😀😀é${r.url}v1`).byteLength + 4,
	);
	// Soft deletion keeps usage; only permanent deletion releases it.
	await database.db.insert(articleTrash).values({ articleId: id });
	expect(await usage()).toEqual(current);
	await database.db.delete(articles).where(eq(articles.id, id));
	expect(await database.db.select().from(articleContentCache)).toHaveLength(0);
	expect(await database.db.select().from(articleTags)).toHaveLength(0);
	expect(await usage()).toMatchObject({
		articleCount: 0,
		tagCount: 1,
		storageBytes: 2,
	});
	await database.db.delete(tags);
	expect(await usage()).toMatchObject({
		articleCount: 0,
		tagCount: 0,
		storageBytes: 0,
	});
});

it("blocks cache replacement growth at storage quota but permits shrinking", async () => {
	await importBackupArticles("owner", [record("cache")]);
	const [{ id, url }] = await database.db.select().from(articles);
	const repo = createArticlesRepository();
	const content = {
		articleId: id,
		status: "ready" as const,
		markdown: "😀",
		plainText: "é",
		wordCount: 1,
		failureReason: null,
		sourceUrl: url,
		extractionVersion: "v1",
		fetchedAt: new Date(),
		updatedAt: new Date(),
	};
	await repo.upsertArticleContentCache(content);
	await seedQuota({ storageBytes: ACCOUNT_QUOTAS.storageBytes });
	await expect(
		repo.upsertArticleContentCache({ ...content, markdown: "😀😀" }),
	).rejects.toThrow("250 MiB");
	expect((await repo.getArticleContentCache(id))?.markdown).toBe("😀");
	await repo.upsertArticleContentCache({ ...content, markdown: "x" });
	expect((await usage()).storageBytes).toBe(ACCOUNT_QUOTAS.storageBytes - 3);
	await expect(
		withQuotaErrors(async () =>
			database.db.update(articles).set({ title: "large".repeat(100) }),
		),
	).rejects.toThrow("250 MiB");
});

it("keeps same-tag concurrent imports idempotent without dangling links or double-counting", async () => {
	await Promise.all(
		["a", "b"].map((id) =>
			importBackupArticles("owner", [
				record(id, { tags: [{ name: "shared", color: null }] }),
			]),
		),
	);
	expect(await database.db.select().from(tags)).toHaveLength(1);
	expect(await database.db.select().from(articleTags)).toHaveLength(2);
	expect(await usage()).toMatchObject({ articleCount: 2, tagCount: 1 });
	await Promise.all(
		Array.from({ length: 3 }, () =>
			importBackupArticles("owner", [
				record("duplicate", { tags: [{ name: "same", color: null }] }),
			]),
		),
	);
	expect(await usage()).toMatchObject({ articleCount: 3, tagCount: 2 });
});

it("charges weighted hourly record and byte budgets even for retries, while isolating accounts", async () => {
	await database.db.insert(rateLimits).values({
		name: "import-records",
		key: "owner",
		count: 9999,
		resetAt: Date.now() + 3_600_000,
	});
	await expect(
		importBackupArticles("owner", [record("last")]),
	).resolves.toEqual({ imported: 1, skipped: 0 });
	await expect(
		importBackupArticles("owner", [record("too-many")]),
	).rejects.toThrow("10,000 articles per hour");
	await database.db.delete(rateLimits);
	const next = record("bytes");
	const bytes = new TextEncoder().encode(JSON.stringify([next])).byteLength;
	await database.db.insert(rateLimits).values({
		name: "import-bytes",
		key: "owner",
		count: 100 * 1024 * 1024 - bytes + 1,
		resetAt: Date.now() + 3_600_000,
	});
	await expect(importBackupArticles("owner", [next])).rejects.toThrow(
		"100 MiB per hour",
	);
	expect(await database.db.select().from(articles)).toHaveLength(1);
	await database.db
		.insert(user)
		.values({ ...owner, id: "other", email: "other@example.com" });
	await expect(
		importBackupArticles("other", [record("other")]),
	).resolves.toEqual({ imported: 1, skipped: 0 });
});

it("rejects oversized UTF-8 batches before consuming budget or writing", async () => {
	const oversized = record("large", {
		content: {
			markdown: "😀".repeat(1_100_000),
			plainText: "😀".repeat(1_100_000),
			wordCount: 1,
			fetchedAt: new Date().toISOString(),
		},
	});
	await expect(importBackupArticles("owner", [oversized])).rejects.toThrow(
		"8 MiB",
	);
	expect(await database.db.select().from(rateLimits)).toHaveLength(0);
	expect(await database.db.select().from(articles)).toHaveLength(0);
});

it("backfills existing data accurately and allows existing over-quota accounts to shrink", async () => {
	const legacy = await createTestDatabase({ beforeMigration: "0010" });
	try {
		await legacy.db.insert(user).values(owner);
		await legacy.db.insert(articles).values({
			id: "legacy",
			userId: "owner",
			url: "https://example.com",
			title: "é",
		});
		await legacy.db
			.insert(tags)
			.values({ id: "legacy-tag", userId: "owner", name: "😀" });
		await legacy.db.insert(articleContentCache).values({
			articleId: "legacy",
			status: "ready",
			markdown: "é",
			plainText: "😀",
			sourceUrl: "https://example.com",
			extractionVersion: "v1",
			fetchedAt: new Date(),
		});
		const migration = await readFile("drizzle/0010_account_quotas.sql", "utf8");
		for (const statement of migration.split("--> statement-breakpoint"))
			if (statement.trim())
				await legacy.binding.exec(statement.replace(/\n/g, " "));
		const [backfilled] = await legacy.db.select().from(accountUsage);
		expect(backfilled).toMatchObject({
			articleCount: 1,
			tagCount: 1,
			storageBytes: new TextEncoder().encode(
				"https://example.comé😀é😀https://example.comv1",
			).byteLength,
		});
		// Emulate a preexisting oversized account without huge fixtures; trigger is update-only.
		await legacy.db
			.insert(user)
			.values({ ...owner, id: "over", email: "over@example.com" });
		await legacy.db.delete(accountUsage).where(eq(accountUsage.userId, "over"));
		await legacy.db.insert(accountUsage).values({
			userId: "over",
			articleCount: 10_001,
			storageBytes: 262_144_001,
		});
		await legacy.db
			.update(accountUsage)
			.set({
				articleCount: sql`${accountUsage.articleCount} - 1`,
				storageBytes: sql`${accountUsage.storageBytes} - 1`,
			})
			.where(eq(accountUsage.userId, "over"));
		await expect(
			withQuotaErrors(async () =>
				legacy.db
					.insert(articles)
					.values({ userId: "over", url: "https://example.com/no" }),
			),
		).rejects.toThrow("10,000 articles");
		await legacy.db.delete(user);
		expect(await legacy.db.select().from(accountUsage)).toHaveLength(0);
	} finally {
		await legacy.runtime.dispose();
	}
}, 30000);

it("bounds article-tag associations across normal bulk writes and rolls back a failed statement", async () => {
	await importBackupArticles("owner", [record("tagged")]);
	const [{ id }] = await database.db.select().from(articles);
	for (let i = 0; i < 101; i++)
		await database.db
			.insert(tags)
			.values({ id: `tag-${i}`, userId: "owner", name: `tag-${i}` });
	const repo = createTagsRepository();
	for (let i = 0; i < 100; i++)
		await repo.addTagToArticles({ tagId: `tag-${i}`, articleIds: [id] });
	await expect(
		repo.addTagToArticles({ tagId: "tag-100", articleIds: [id] }),
	).rejects.toThrow("100 tags");
	expect(await database.db.select().from(articleTags)).toHaveLength(100);
});
