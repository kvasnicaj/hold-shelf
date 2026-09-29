import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, expect, it, vi } from "vitest";
import {
	articleContentCache,
	articles,
	articleTags,
	articleTrash,
	readingProgress,
	tags,
	user,
} from "#/db/schema";
import * as extraction from "#/server/article-content";
import { createArticlesRepository } from "#/server/articles-repository";
import { ArticleAlreadyExistsError } from "#/server/articles-service";
import { withBackgroundContext } from "#/server/background";
import { importBackupArticles } from "#/server/library-import";
import {
	deleteTrashForUser,
	finishReadingForUser,
} from "#/server/library-repository";
import { createTagsRepository } from "#/server/tags-repository";
import { createTestDatabase } from "#/test/d1";

const { getDbMock } = vi.hoisted(() => ({ getDbMock: vi.fn() }));
vi.mock("#/db/index", () => ({ getDb: getDbMock }));
let database: Awaited<ReturnType<typeof createTestDatabase>>;
beforeAll(async () => {
	database = await createTestDatabase();
}, 30000);
afterAll(async () => {
	await database?.runtime.dispose();
});
beforeEach(async () => {
	getDbMock.mockReturnValue(database.db);
	await database.db.delete(user);
	await database.db.insert(user).values(
		["owner", "other"].map((id) => ({
			id,
			name: id,
			email: `${id}@example.com`,
			emailVerified: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		})),
	);
});
it("handles 100 article operations within D1 limits and excludes Trash without losing content or tags", async () => {
	const repo = createArticlesRepository();
	const tagRepo = createTagsRepository();
	for (let i = 0; i < 100; i++)
		await database.db.insert(articles).values({
			id: `a${i}`,
			userId: "owner",
			url: `https://example.com/${i}`,
		});
	await database.db.insert(articles).values({
		id: "other",
		userId: "other",
		url: "https://example.com/private",
	});
	await database.db
		.insert(tags)
		.values({ id: "tag", userId: "owner", name: "Reading" });
	const ids = Array.from({ length: 100 }, (_, i) => `a${i}`);
	expect(
		await tagRepo.countOwnedArticles({ userId: "owner", articleIds: ids }),
	).toBe(100);
	await tagRepo.addTagToArticles({ tagId: "tag", articleIds: ids });
	expect(await repo.listArticleTags(ids)).toHaveLength(100);
	await repo.deleteArticles({
		userId: "owner",
		ids: [...ids.slice(0, 99), "other"],
	});
	expect(
		(
			await repo.listArticles({
				userId: "owner",
				sort: "newest",
				limit: 100,
				offset: 0,
			})
		).total,
	).toBe(1);
	expect(await repo.getArticleById({ userId: "owner", id: "a0" })).toBeNull();
	expect(
		await repo.getArticleById({ userId: "owner", id: "other" }),
	).toBeNull();
	expect(
		await repo.getArticleById({ userId: "other", id: "other" }),
	).not.toBeNull();
	await database.db
		.delete(articleTrash)
		.where(eq(articleTrash.articleId, "a0"));
	expect(await repo.listArticleTags(["a0"])).toHaveLength(1);
	await tagRepo.removeTagFromArticles({ tagId: "tag", articleIds: ids });
	expect(await repo.listArticleTags(ids)).toHaveLength(0);
});
it("returns a domain duplicate result for simultaneous saves", async () => {
	const repo = createArticlesRepository();
	const results = await Promise.allSettled(
		Array.from({ length: 5 }, () =>
			repo.createArticle({
				userId: "owner",
				url: "https://example.com/duplicate",
				metadata: {
					title: "Title",
					description: null,
					hostname: "example.com",
					faviconUrl: null,
				},
			}),
		),
	);
	expect(
		results.filter((result) => result.status === "fulfilled"),
	).toHaveLength(1);
	for (const result of results)
		if (result.status === "rejected")
			expect(result.reason).toBeInstanceOf(ArticleAlreadyExistsError);
});
it("searches saved content and applies owner, tag, status, and stable pagination filters", async () => {
	const repo = createArticlesRepository();
	await database.db.insert(articles).values([
		{ id: "a", userId: "owner", url: "https://example.com/a", title: "Zebra" },
		{
			id: "b",
			userId: "owner",
			url: "https://example.com/b",
			title: "Apple",
			isRead: true,
		},
		{
			id: "private",
			userId: "other",
			url: "https://example.com/private",
			title: "Needle",
		},
	]);
	await database.db.insert(articleContentCache).values({
		articleId: "a",
		status: "ready",
		markdown: "Hidden needle",
		plainText: "Hidden needle",
		wordCount: 2,
		sourceUrl: "https://example.com/a",
		extractionVersion: "markdown-v3",
		fetchedAt: new Date(),
	});
	expect(
		(
			await repo.listArticles({
				userId: "owner",
				search: "needle",
				sort: "title",
				limit: 20,
				offset: 0,
			})
		).rows.map((row) => row.id),
	).toEqual(["a"]);
	expect(
		(
			await repo.listArticles({
				userId: "owner",
				isRead: true,
				sort: "title",
				limit: 20,
				offset: 0,
			})
		).rows.map((row) => row.id),
	).toEqual(["b"]);
	expect(
		(
			await repo.listArticles({
				userId: "owner",
				sort: "title",
				limit: 1,
				offset: 1,
			})
		).rows.map((row) => row.id),
	).toEqual(["a"]);
});
it("imports content, tags, progress and Trash atomically and skips existing URLs", async () => {
	const record = {
		url: "https://example.com/backup",
		title: "Backup",
		description: null,
		faviconUrl: null,
		isRead: true,
		isFavorite: true,
		createdAt: new Date().toISOString(),
		readAt: null,
		tags: Array.from({ length: 100 }, (_, index) => ({
			name: `Import ${index}`,
			color: null,
		})),
		content: {
			markdown: "# Saved",
			plainText: "Saved",
			wordCount: 1,
			fetchedAt: new Date().toISOString(),
		},
		progress: 3200,
		trashed: true,
	};
	expect(await importBackupArticles("owner", [record])).toEqual({
		imported: 1,
		skipped: 0,
	});
	expect(await importBackupArticles("owner", [record])).toEqual({
		imported: 0,
		skipped: 1,
	});
	const [saved] = await database.db
		.select()
		.from(articles)
		.where(eq(articles.userId, "owner"));
	expect(
		await createArticlesRepository().getArticleContentCache(saved.id),
	).toMatchObject({ markdown: "# Saved" });
	expect(
		await createArticlesRepository().listArticleTags([saved.id]),
	).toHaveLength(100);
	expect(await database.db.select().from(readingProgress)).toMatchObject([
		{ progress: 3200 },
	]);
	expect(await database.db.select().from(articleTrash)).toHaveLength(1);
});

it("restores a re-saved URL from Trash without losing its article identity", async () => {
	const repo = createArticlesRepository();
	const input = {
		userId: "owner",
		url: "https://example.com/restore",
		metadata: {
			title: "Saved",
			description: null,
			hostname: "example.com",
			faviconUrl: null,
		},
	};
	const saved = await repo.createArticle(input);
	await repo.deleteArticles({ userId: "owner", ids: [saved.id] });
	expect(await repo.findArticleByUrl(input)).toBeNull();
	expect((await repo.createArticle(input)).id).toBe(saved.id);
	expect(
		await repo.getArticleById({ userId: "owner", id: saved.id }),
	).not.toBeNull();
});
it("captures saved content through the request background context before any reader visit", async () => {
	vi.spyOn(extraction, "extractArticleContent").mockResolvedValue({
		status: "ready",
		blocks: [],
		paragraphs: ["Preserved body"],
		markdown: "Preserved body",
		wordCount: 2,
	});
	const tasks: Promise<unknown>[] = [];
	const repo = createArticlesRepository();
	const saved = await withBackgroundContext(
		{ waitUntil: (task) => tasks.push(task) },
		() =>
			repo.createArticle({
				userId: "owner",
				url: "https://example.com/capture",
				metadata: {
					title: "Capture",
					description: null,
					hostname: "example.com",
					faviconUrl: null,
				},
			}),
	);
	await Promise.all(tasks);
	expect(await repo.getArticleContentCache(saved.id)).toMatchObject({
		status: "ready",
		markdown: "Preserved body",
		extractionVersion: "markdown-v3",
	});
});

it("permanently deletes only owned articles still in Trash and cascades related data", async () => {
	await database.db.insert(articles).values([
		{ id: "trashed", userId: "owner", url: "https://example.com/trashed" },
		{ id: "active", userId: "owner", url: "https://example.com/active" },
		{ id: "private", userId: "other", url: "https://example.com/private" },
	]);
	await database.db
		.insert(articleTrash)
		.values([{ articleId: "trashed" }, { articleId: "private" }]);
	await database.db
		.insert(tags)
		.values({ id: "tag", userId: "owner", name: "Keep tag" });
	await database.db
		.insert(articleTags)
		.values({ articleId: "trashed", tagId: "tag" });
	await database.db
		.insert(readingProgress)
		.values({ articleId: "trashed", progress: 3500 });
	await database.db.insert(articleContentCache).values({
		articleId: "trashed",
		status: "ready",
		markdown: "Saved",
		plainText: "Saved",
		wordCount: 1,
		sourceUrl: "https://example.com/trashed",
		extractionVersion: "markdown-v3",
		fetchedAt: new Date(),
	});
	await deleteTrashForUser("owner", {
		mode: "selected",
		ids: ["trashed", "active", "private", "missing"],
	});
	expect(
		(await database.db.select().from(articles)).map((row) => row.id).sort(),
	).toEqual(["active", "private"]);
	expect(await database.db.select().from(articleContentCache)).toHaveLength(0);
	expect(await database.db.select().from(readingProgress)).toHaveLength(0);
	expect(await database.db.select().from(articleTags)).toHaveLength(0);
	expect(await database.db.select().from(tags)).toHaveLength(1);
	expect(await database.db.select().from(articleTrash)).toMatchObject([
		{ articleId: "private" },
	]);
});
it("empties only the current user's Trash and accepts 100 selected IDs", async () => {
	for (let index = 0; index < 101; index++) {
		await database.db.insert(articles).values({
			id: `trash-${index}`,
			userId: "owner",
			url: `https://example.com/trash/${index}`,
		});
		await database.db
			.insert(articleTrash)
			.values({ articleId: `trash-${index}` });
	}
	await database.db.insert(articles).values([
		{ id: "keep", userId: "owner", url: "https://example.com/keep" },
		{ id: "other-trash", userId: "other", url: "https://example.com/other" },
	]);
	await database.db.insert(articleTrash).values({ articleId: "other-trash" });
	await deleteTrashForUser("owner", {
		mode: "selected",
		ids: Array.from({ length: 100 }, (_, i) => `trash-${i}`),
	});
	expect(await database.db.select().from(articleTrash)).toHaveLength(2);
	await deleteTrashForUser("owner", { mode: "all" });
	expect(
		(await database.db.select().from(articles)).map((row) => row.id).sort(),
	).toEqual(["keep", "other-trash"]);
});
it("completes reading atomically, preserves the read date, and ignores foreign or trashed articles", async () => {
	const readAt = new Date("2026-01-01T00:00:00Z");
	await database.db.insert(articles).values([
		{
			id: "reading",
			userId: "owner",
			url: "https://example.com/reading",
			isRead: true,
			readAt,
		},
		{ id: "unread", userId: "owner", url: "https://example.com/unread" },
		{ id: "private", userId: "other", url: "https://example.com/private" },
		{ id: "trashed", userId: "owner", url: "https://example.com/trashed" },
	]);
	await database.db.insert(articleTrash).values({ articleId: "trashed" });
	await database.db
		.insert(readingProgress)
		.values({ articleId: "reading", progress: 3500 });
	for (const id of ["reading", "unread", "private", "trashed"])
		await finishReadingForUser("owner", id);
	const rows = await database.db.select().from(articles);
	expect(rows.find((row) => row.id === "reading")).toMatchObject({
		isRead: true,
		readAt,
	});
	expect(rows.find((row) => row.id === "unread")?.readAt).toBeInstanceOf(Date);
	expect(rows.find((row) => row.id === "private")?.isRead).toBe(false);
	expect(rows.find((row) => row.id === "trashed")?.isRead).toBe(false);
	expect(await database.db.select().from(readingProgress)).toHaveLength(2);
	for (const row of await database.db.select().from(readingProgress))
		expect(row.progress).toBe(10000);
});
