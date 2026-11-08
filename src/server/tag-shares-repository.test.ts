import { afterAll, beforeAll, beforeEach, expect, it, vi } from "vitest";
import {
	articles,
	articleTags,
	articleTrash,
	tagShares,
	tags,
	user,
} from "#/db/schema";
import { createTagSharesRepository } from "#/server/tag-shares-repository";
import { createTestDatabase } from "#/test/d1";

const { getDbMock } = vi.hoisted(() => ({ getDbMock: vi.fn() }));
vi.mock("#/db/index", () => ({ getDb: getDbMock }));

const TOKEN = `hss_${"a".repeat(32)}`;
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
			name: `${id} name`,
			email: `${id}@example.com`,
			emailVerified: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		})),
	);
	await database.db.insert(tags).values([
		{ id: "shared", userId: "owner", name: "Research" },
		{ id: "private", userId: "owner", name: "Private" },
	]);
	await database.db.insert(tagShares).values({ tagId: "shared", token: TOKEN });
});

async function addArticle(
	id: string,
	{
		userId = "owner",
		tagId = "shared",
		minute = 0,
	}: { userId?: string; tagId?: string; minute?: number } = {},
) {
	await database.db.insert(articles).values({
		id,
		userId,
		url: `https://example.com/${id}`,
		title: id,
		createdAt: new Date(Date.UTC(2026, 0, 1, 0, minute)),
	});
	await database.db.insert(articleTags).values({ articleId: id, tagId });
}

it("returns an empty share with its names and a zero total", async () => {
	const shared = await createTagSharesRepository().getSharedTag({
		token: TOKEN,
		limit: 2,
		offset: 0,
	});
	expect(shared).toEqual({
		ownerName: "owner name",
		tagName: "Research",
		items: [],
		total: 0,
	});
});

it("pages only the owner's active articles in the shared tag, newest first", async () => {
	for (let minute = 0; minute < 5; minute++) {
		await addArticle(`a${minute}`, { minute });
	}
	await addArticle("trashed", { minute: 10 });
	await database.db.insert(articleTrash).values({ articleId: "trashed" });
	await addArticle("untagged", { tagId: "private", minute: 11 });
	// A foreign article attached to the tag must never surface through it.
	await addArticle("foreign", { userId: "other", minute: 12 });
	const repo = createTagSharesRepository();

	const pages = await Promise.all(
		[0, 2, 4, 6].map((offset) =>
			repo.getSharedTag({ token: TOKEN, limit: 2, offset }),
		),
	);

	expect(pages.map((page) => page?.items.map((item) => item.title))).toEqual([
		["a4", "a3"],
		["a2", "a1"],
		["a0"],
		[],
	]);
	expect(pages.map((page) => page?.total)).toEqual([5, 5, 5, 5]);
	expect(pages[0]?.items[0]).toEqual({
		url: "https://example.com/a4",
		title: "a4",
		description: null,
		hostname: null,
		faviconUrl: null,
		createdAt: new Date(Date.UTC(2026, 0, 1, 0, 4)),
	});
});

it("returns nothing for an unknown or revoked token", async () => {
	await addArticle("a0");
	const repo = createTagSharesRepository();
	expect(
		await repo.getSharedTag({
			token: `hss_${"b".repeat(32)}`,
			limit: 2,
			offset: 0,
		}),
	).toBeNull();

	await repo.deleteTagShare("shared");
	expect(
		await repo.getSharedTag({ token: TOKEN, limit: 2, offset: 0 }),
	).toBeNull();
});
