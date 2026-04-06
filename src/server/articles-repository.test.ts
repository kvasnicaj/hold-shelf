import { drizzle } from "drizzle-orm/d1";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as schema from "#/db/schema";
import { createArticlesRepository } from "#/server/articles-repository";

const { getDbMock } = vi.hoisted(() => ({
	getDbMock: vi.fn(),
}));

vi.mock("#/db/index", () => ({
	getDb: getDbMock,
}));

type StoredArticle = {
	id: string;
	userId: string;
	url: string;
	title: string | null;
	description: string | null;
	hostname: string | null;
	faviconUrl: string | null;
	isRead: number;
	isFavorite: number;
	createdAt: number;
	updatedAt: number;
	readAt: number | null;
};

type StoredTag = {
	id: string;
	userId: string;
	name: string;
	color: string | null;
};

type StoredArticleTag = {
	articleId: string;
	tagId: string;
};

class FakeD1Statement {
	constructor(
		private readonly database: FakeD1Database,
		private readonly sql: string,
		private readonly params: unknown[] = [],
	) {}

	bind(...params: unknown[]) {
		return new FakeD1Statement(this.database, this.sql, params);
	}

	async all() {
		return { results: this.database.executeAll(this.sql, this.params) };
	}

	async raw() {
		return this.database.executeRaw(this.sql, this.params);
	}

	async run() {
		this.database.executeRun(this.sql, this.params);
		return { success: true };
	}
}

class FakeD1Database {
	readonly queries: Array<{ sql: string; params: unknown[] }> = [];

	constructor(
		private readonly state: {
			articles: StoredArticle[];
			tags: StoredTag[];
			articleTags: StoredArticleTag[];
		},
	) {}

	prepare(sql: string) {
		return new FakeD1Statement(this, sql);
	}

	async batch() {
		return [];
	}

	executeAll(sql: string, params: unknown[]) {
		this.queries.push({ sql, params });
		return [];
	}

	executeRaw(sql: string, params: unknown[]) {
		this.queries.push({ sql, params });

		if (sql.startsWith('select "id" from "articles"')) {
			return this.selectArticleIdByUrl(params);
		}

		if (sql.startsWith('select count(*) from "articles"')) {
			return [[this.filterArticles(sql, params).length]];
		}

		if (
			sql.startsWith(
				'select "article_tags"."article_id", "tags"."id", "tags"."name", "tags"."color" from "article_tags"',
			)
		) {
			return this.selectArticleTags(params);
		}

		if (
			sql.startsWith(
				'select "id", "user_id", "url", "title", "description", "hostname", "favicon_url", "is_read", "is_favorite", "created_at", "updated_at", "read_at" from "articles"',
			)
		) {
			return this.selectArticles(sql, params);
		}

		if (sql.startsWith('insert into "articles"')) {
			return this.insertArticle(params);
		}

		throw new Error(`Unhandled raw query: ${sql}`);
	}

	executeRun(sql: string, params: unknown[]) {
		this.queries.push({ sql, params });

		if (sql.startsWith('update "articles" set ')) {
			this.updateArticle(params);
			return;
		}

		if (sql.startsWith('delete from "articles"')) {
			this.deleteArticles(params);
			return;
		}

		throw new Error(`Unhandled run query: ${sql}`);
	}

	private selectArticles(sql: string, params: unknown[]) {
		const filtered = this.filterArticles(sql, params);
		const limit = Number(params.at(-1) ?? filtered.length);

		return filtered
			.slice(0, limit)
			.map((article) => [
				article.id,
				article.userId,
				article.url,
				article.title,
				article.description,
				article.hostname,
				article.faviconUrl,
				article.isRead,
				article.isFavorite,
				article.createdAt,
				article.updatedAt,
				article.readAt,
			]);
	}

	private selectArticleTags(params: unknown[]) {
		const articleIds = new Set(params as string[]);

		return this.state.articleTags
			.filter((entry) => articleIds.has(entry.articleId))
			.flatMap((entry) => {
				const tag = this.state.tags.find(
					(candidate) => candidate.id === entry.tagId,
				);
				return tag
					? [[entry.articleId, tag.id, tag.name, tag.color] as const]
					: [];
			});
	}

	private selectArticleIdByUrl(params: unknown[]) {
		const [userId, url] = params as [string, string, number];
		const article = this.state.articles.find(
			(candidate) => candidate.userId === userId && candidate.url === url,
		);

		return article ? [[article.id]] : [];
	}

	private insertArticle(params: unknown[]) {
		const [
			id,
			userId,
			url,
			title,
			description,
			hostname,
			faviconUrl,
			isRead,
			isFavorite,
		] = params as [
			string,
			string,
			string,
			string | null,
			string | null,
			string | null,
			string | null,
			number,
			number,
		];

		const createdAt = 1_720_000_000;
		const article: StoredArticle = {
			id,
			userId,
			url,
			title,
			description,
			hostname,
			faviconUrl,
			isRead,
			isFavorite,
			createdAt,
			updatedAt: createdAt,
			readAt: null,
		};

		this.state.articles.push(article);

		return [
			[
				article.id,
				article.userId,
				article.url,
				article.title,
				article.description,
				article.hostname,
				article.faviconUrl,
				article.isRead,
				article.isFavorite,
				article.createdAt,
				article.updatedAt,
				article.readAt,
			],
		];
	}

	private updateArticle(params: unknown[]) {
		const [isRead, updatedAt, id, userId] = params as [
			number,
			number,
			string,
			string,
		];
		const article = this.state.articles.find(
			(candidate) => candidate.id === id && candidate.userId === userId,
		);

		if (article) {
			article.isRead = isRead;
			article.updatedAt = updatedAt;
		}
	}

	private deleteArticles(params: unknown[]) {
		const userId = String(params.at(-1));
		const ids = new Set(params.slice(0, -1) as string[]);

		this.state.articles = this.state.articles.filter(
			(article) => article.userId !== userId || !ids.has(article.id),
		);
	}

	private filterArticles(sql: string, params: unknown[]) {
		let index = 0;
		const userId = String(params[index++]);
		let articles = this.state.articles.filter(
			(article) => article.userId === userId,
		);

		if (sql.includes('"articles"."is_read" = ?')) {
			const isRead = Number(params[index++]);
			articles = articles.filter((article) => article.isRead === isRead);
		}

		if (sql.includes('"articles"."is_favorite" = ?')) {
			const isFavorite = Number(params[index++]);
			articles = articles.filter(
				(article) => article.isFavorite === isFavorite,
			);
		}

		if (
			sql.includes(
				'"articles"."id" in (select "article_id" from "article_tags"',
			)
		) {
			const tagId = String(params[index++]);
			const articleIds = new Set(
				this.state.articleTags
					.filter((entry) => entry.tagId === tagId)
					.map((entry) => entry.articleId),
			);
			articles = articles.filter((article) => articleIds.has(article.id));
		}

		if (
			sql.includes(
				'"articles"."title" LIKE ? OR "articles"."description" LIKE ?',
			)
		) {
			const search = String(params[index++]).replaceAll("%", "").toLowerCase();
			index += 1;
			articles = articles.filter((article) =>
				`${article.title ?? ""} ${article.description ?? ""}`
					.toLowerCase()
					.includes(search),
			);
		}

		const sorted = [...articles];

		if (sql.includes('order by "articles"."title" asc')) {
			sorted.sort((left, right) =>
				(left.title ?? "").localeCompare(right.title ?? ""),
			);
		} else if (sql.includes('order by "articles"."created_at" asc')) {
			sorted.sort((left, right) => left.createdAt - right.createdAt);
		} else if (sql.includes('order by "articles"."created_at" desc')) {
			sorted.sort((left, right) => right.createdAt - left.createdAt);
		}

		return sorted;
	}
}

function createFixture() {
	const state = {
		articles: [
			{
				id: "a1",
				userId: "user-1",
				url: "https://example.com/design-systems",
				title: "Design systems",
				description: "Patterns and tokens",
				hostname: "example.com",
				faviconUrl: null,
				isRead: 0,
				isFavorite: 1,
				createdAt: 1_704_067_200,
				updatedAt: 1_704_067_200,
				readAt: null,
			},
			{
				id: "a2",
				userId: "user-1",
				url: "https://example.com/typescript",
				title: "TypeScript notes",
				description: "Advanced narrowing",
				hostname: "example.com",
				faviconUrl: null,
				isRead: 1,
				isFavorite: 0,
				createdAt: 1_704_153_600,
				updatedAt: 1_704_153_600,
				readAt: 1_704_240_000,
			},
			{
				id: "a3",
				userId: "user-1",
				url: "https://example.com/zustand",
				title: "Zustand guide",
				description: "State management for apps",
				hostname: "example.com",
				faviconUrl: null,
				isRead: 0,
				isFavorite: 0,
				createdAt: 1_704_240_000,
				updatedAt: 1_704_240_000,
				readAt: null,
			},
			{
				id: "a4",
				userId: "user-2",
				url: "https://others.com/private",
				title: "Other user article",
				description: "Hidden from user 1",
				hostname: "others.com",
				faviconUrl: null,
				isRead: 0,
				isFavorite: 0,
				createdAt: 1_704_326_400,
				updatedAt: 1_704_326_400,
				readAt: null,
			},
		] satisfies StoredArticle[],
		tags: [
			{ id: "t1", userId: "user-1", name: "Design", color: null },
			{ id: "t2", userId: "user-1", name: "Engineering", color: "#123456" },
		] satisfies StoredTag[],
		articleTags: [
			{ articleId: "a1", tagId: "t1" },
			{ articleId: "a2", tagId: "t2" },
			{ articleId: "a3", tagId: "t2" },
		] satisfies StoredArticleTag[],
	};
	const fakeDb = new FakeD1Database(state);

	getDbMock.mockReturnValue(
		drizzle(fakeDb as unknown as Parameters<typeof drizzle>[0], { schema }),
	);

	return {
		repo: createArticlesRepository(),
		state,
		fakeDb,
	};
}

describe("createArticlesRepository", () => {
	beforeEach(() => {
		getDbMock.mockReset();
	});

	it("filters and sorts article queries while returning the total count", async () => {
		const { repo } = createFixture();

		const result = await repo.listArticles({
			userId: "user-1",
			isRead: false,
			isFavorite: false,
			tagId: "t2",
			search: "state",
			sort: "title",
			limit: 10,
			offset: 0,
		});

		expect(result.total).toBe(1);
		expect(result.rows).toHaveLength(1);
		expect(result.rows[0]).toMatchObject({
			id: "a3",
			title: "Zustand guide",
			isRead: false,
			isFavorite: false,
		});
	});

	it("returns joined tag rows and skips the database entirely for empty article ids", async () => {
		const { repo, fakeDb } = createFixture();

		await expect(repo.listArticleTags([])).resolves.toEqual([]);
		expect(fakeDb.queries).toEqual([]);

		const rows = await repo.listArticleTags(["a1", "a3"]);
		expect(rows).toEqual([
			{ articleId: "a1", id: "t1", name: "Design", color: null },
			{ articleId: "a3", id: "t2", name: "Engineering", color: "#123456" },
		]);
	});

	it("finds existing articles by URL and returns null for missing URLs", async () => {
		const { repo } = createFixture();

		await expect(
			repo.findArticleByUrl({
				userId: "user-1",
				url: "https://example.com/typescript",
			}),
		).resolves.toEqual({ id: "a2" });

		await expect(
			repo.findArticleByUrl({
				userId: "user-1",
				url: "https://example.com/missing",
			}),
		).resolves.toBeNull();
	});

	it("creates, updates, and deletes only the current user's articles", async () => {
		const { repo, state } = createFixture();

		const created = await repo.createArticle({
			userId: "user-1",
			url: "https://example.com/new-article",
			metadata: {
				title: "Fresh article",
				description: "New metadata",
				hostname: "example.com",
				faviconUrl: "https://example.com/favicon.ico",
			},
		});

		expect(created).toMatchObject({
			userId: "user-1",
			url: "https://example.com/new-article",
			title: "Fresh article",
			description: "New metadata",
		});

		await repo.updateArticle({
			userId: "user-1",
			id: created.id,
			changes: {
				isRead: true,
				updatedAt: new Date("2026-04-06T00:00:00.000Z"),
			},
		});
		await repo.updateArticle({
			userId: "user-1",
			id: "a4",
			changes: {
				isRead: true,
				updatedAt: new Date("2026-04-06T00:00:00.000Z"),
			},
		});

		expect(
			state.articles.find((article) => article.id === created.id)?.isRead,
		).toBe(1);
		expect(state.articles.find((article) => article.id === "a4")?.isRead).toBe(
			0,
		);

		await repo.deleteArticles({
			userId: "user-1",
			ids: [created.id, "a4"],
		});

		expect(state.articles.map((article) => article.id)).not.toContain(
			created.id,
		);
		expect(state.articles.map((article) => article.id)).toContain("a4");
	});
});
