import { describe, expect, it, vi } from "vitest";
import {
	type ArticleContentCacheUpsert,
	type ArticlesRepository,
	createArticleForUser,
	deleteArticlesForUser,
	getArticleReaderForUser,
	getArticlesForUser,
	updateArticleForUser,
} from "#/server/articles-service";

type StoredArticle = {
	id: string;
	userId: string;
	url: string;
	title: string | null;
	description: string | null;
	hostname: string | null;
	faviconUrl: string | null;
	isRead: boolean;
	isFavorite: boolean;
	createdAt: Date;
	updatedAt: Date;
	readAt: Date | null;
};

type StoredArticleContentCache = ArticleContentCacheUpsert & {
	createdAt: Date;
};

function createArticlesRepoFixture() {
	const articleTags = new Map<string, Set<string>>([
		["a1", new Set(["t1"])],
		["a2", new Set(["t2"])],
	]);
	const tags = new Map([
		["t1", { id: "t1", name: "Design", color: null }],
		["t2", { id: "t2", name: "Engineering", color: "#123456" }],
	]);
	const articles: StoredArticle[] = [
		{
			id: "a1",
			userId: "user-1",
			url: "https://example.com/design",
			title: "Design systems",
			description: "Patterns and tokens",
			hostname: "example.com",
			faviconUrl: "https://example.com/favicon.ico",
			isRead: false,
			isFavorite: false,
			createdAt: new Date("2024-01-03T00:00:00.000Z"),
			updatedAt: new Date("2024-01-03T00:00:00.000Z"),
			readAt: null,
		},
		{
			id: "a2",
			userId: "user-1",
			url: "https://example.com/typescript",
			title: "TypeScript notes",
			description: "Advanced narrowing",
			hostname: "example.com",
			faviconUrl: "https://example.com/favicon.ico",
			isRead: true,
			isFavorite: false,
			createdAt: new Date("2024-01-02T00:00:00.000Z"),
			updatedAt: new Date("2024-01-02T00:00:00.000Z"),
			readAt: new Date("2024-01-04T00:00:00.000Z"),
		},
		{
			id: "a3",
			userId: "user-2",
			url: "https://others.com/private",
			title: "Other user",
			description: "Hidden",
			hostname: "others.com",
			faviconUrl: null,
			isRead: false,
			isFavorite: false,
			createdAt: new Date("2024-01-01T00:00:00.000Z"),
			updatedAt: new Date("2024-01-01T00:00:00.000Z"),
			readAt: null,
		},
	];
	const contentCache = new Map<string, StoredArticleContentCache>();

	const repo: ArticlesRepository = {
		listArticles: vi.fn(
			async ({
				userId,
				isRead,
				isFavorite,
				tagId,
				search,
				sort,
				limit,
				offset,
			}) => {
				let filtered = articles.filter((article) => article.userId === userId);

				if (isRead !== undefined) {
					filtered = filtered.filter((article) => article.isRead === isRead);
				}

				if (isFavorite !== undefined) {
					filtered = filtered.filter(
						(article) => article.isFavorite === isFavorite,
					);
				}

				if (tagId) {
					filtered = filtered.filter((article) =>
						articleTags.get(article.id)?.has(tagId),
					);
				}

				if (search?.trim()) {
					const query = search.trim().toLowerCase();
					filtered = filtered.filter(
						(article) =>
							article.title?.toLowerCase().includes(query) ||
							article.description?.toLowerCase().includes(query),
					);
				}

				filtered = [...filtered].sort((a, b) => {
					if (sort === "oldest") {
						return a.createdAt.getTime() - b.createdAt.getTime();
					}
					if (sort === "title") {
						return (a.title ?? "").localeCompare(b.title ?? "");
					}
					return b.createdAt.getTime() - a.createdAt.getTime();
				});

				return {
					rows: filtered.slice(offset, offset + limit),
					total: filtered.length,
				};
			},
		),
		listArticleTags: vi.fn(async (articleIds) =>
			articleIds.flatMap((articleId: string) =>
				Array.from(articleTags.get(articleId) ?? []).flatMap((tagId) => {
					const tag = tags.get(tagId);
					return tag ? [{ articleId, ...tag }] : [];
				}),
			),
		),
		getArticleById: vi.fn(async ({ userId, id }) => {
			return (
				articles.find(
					(candidate) => candidate.userId === userId && candidate.id === id,
				) ?? null
			);
		}),
		findArticleByUrl: vi.fn(async ({ userId, url }) => {
			const article = articles.find(
				(candidate) => candidate.userId === userId && candidate.url === url,
			);
			return article ? { id: article.id } : null;
		}),
		createArticle: vi.fn(async ({ userId, url, metadata }) => {
			const article: StoredArticle = {
				id: `a${articles.length + 1}`,
				userId,
				url,
				title: metadata.title,
				description: metadata.description,
				hostname: metadata.hostname,
				faviconUrl: metadata.faviconUrl,
				isRead: false,
				isFavorite: false,
				createdAt: new Date("2024-01-05T00:00:00.000Z"),
				updatedAt: new Date("2024-01-05T00:00:00.000Z"),
				readAt: null,
			};
			articles.push(article);
			return article;
		}),
		getArticleContentCache: vi.fn(async (articleId) => {
			return contentCache.get(articleId) ?? null;
		}),
		upsertArticleContentCache: vi.fn(async (data) => {
			const existing = contentCache.get(data.articleId);
			const cache = {
				...data,
				createdAt: existing?.createdAt ?? data.updatedAt,
			};
			contentCache.set(data.articleId, cache);
			return cache;
		}),
		updateArticle: vi.fn(async ({ userId, id, changes }) => {
			const article = articles.find(
				(candidate) => candidate.userId === userId && candidate.id === id,
			);
			if (!article) {
				return;
			}

			Object.assign(article, changes);
		}),
		deleteArticles: vi.fn(async ({ userId, ids }) => {
			const allowedIds = new Set(ids);
			const remaining = articles.filter(
				(article) => article.userId !== userId || !allowedIds.has(article.id),
			);
			articles.splice(0, articles.length, ...remaining);
		}),
	};

	return { repo, articles, contentCache };
}

describe("articles service", () => {
	it("creates an article with extracted metadata", async () => {
		const { repo, articles } = createArticlesRepoFixture();
		const extractMetadataFn = vi.fn().mockResolvedValue({
			title: "Fresh article",
			description: "Metadata description",
			faviconUrl: "https://example.com/icon.png",
			hostname: "example.com",
		});
		const checkRateLimitFn = vi.fn().mockResolvedValue({
			allowed: true,
			retryAfterMs: 0,
		});

		const article = await createArticleForUser({
			repo,
			userId: "user-1",
			url: "https://example.com/fresh",
			checkRateLimitFn,
			extractMetadataFn,
		});

		expect(article.title).toBe("Fresh article");
		expect(checkRateLimitFn).toHaveBeenCalledWith(
			{ name: "create-article", windowMs: 60_000, max: 30 },
			"user-1",
		);
		expect(articles.some((candidate) => candidate.url === article.url)).toBe(
			true,
		);
		expect(repo.getArticleContentCache).not.toHaveBeenCalled();
		expect(repo.upsertArticleContentCache).not.toHaveBeenCalled();
	});

	it("extracts, converts, stores, and returns markdown when opening an uncached article", async () => {
		const { repo, contentCache } = createArticlesRepoFixture();
		const fetchedAt = new Date("2024-02-02T10:00:00.000Z");
		const extractArticleContentFn = vi.fn().mockResolvedValue({
			status: "ready",
			blocks: [
				{
					type: "heading",
					level: 2,
					children: [{ text: "Readable section" }],
				},
				{
					type: "paragraph",
					children: [
						{ text: "A cached " },
						{ text: "article", bold: true },
						{ text: " body." },
					],
				},
			],
			paragraphs: ["Readable section", "A cached article body."],
			wordCount: 5,
		});

		const result = await getArticleReaderForUser({
			repo,
			userId: "user-1",
			id: "a1",
			extractArticleContentFn,
			now: () => fetchedAt,
		});

		expect(result.content).toEqual({
			status: "ready",
			markdown: "## Readable section\n\nA cached **article** body\\.",
			plainText: "Readable section\n\nA cached article body.",
			wordCount: 5,
			fetchedAt,
		});
		expect(contentCache.get("a1")?.markdown).toBe(
			"## Readable section\n\nA cached **article** body\\.",
		);
		expect(extractArticleContentFn).toHaveBeenCalledWith(
			"https://example.com/design",
		);
	});

	it("returns cached markdown without refetching the original article", async () => {
		const { repo, contentCache } = createArticlesRepoFixture();
		const fetchedAt = new Date("2024-02-01T10:00:00.000Z");
		contentCache.set("a1", {
			articleId: "a1",
			status: "ready",
			markdown: "Cached **markdown**.",
			plainText: "Cached markdown.",
			wordCount: 2,
			failureReason: null,
			sourceUrl: "https://example.com/design",
			extractionVersion: "markdown-v1",
			fetchedAt,
			createdAt: fetchedAt,
			updatedAt: fetchedAt,
		});
		const extractArticleContentFn = vi.fn();

		const result = await getArticleReaderForUser({
			repo,
			userId: "user-1",
			id: "a1",
			extractArticleContentFn,
			now: () => new Date("2024-02-02T10:00:00.000Z"),
		});

		expect(result.content).toEqual({
			status: "ready",
			markdown: "Cached **markdown**.",
			plainText: "Cached markdown.",
			wordCount: 2,
			fetchedAt,
		});
		expect(extractArticleContentFn).not.toHaveBeenCalled();
	});

	it("caches unavailable extraction results", async () => {
		const { repo, contentCache } = createArticlesRepoFixture();
		const fetchedAt = new Date("2024-02-02T10:00:00.000Z");
		const extractArticleContentFn = vi.fn().mockResolvedValue({
			status: "unavailable",
			reason: "No readable content.",
		});

		const result = await getArticleReaderForUser({
			repo,
			userId: "user-1",
			id: "a1",
			extractArticleContentFn,
			now: () => fetchedAt,
		});

		expect(result.content).toEqual({
			status: "unavailable",
			reason: "No readable content.",
		});
		expect(contentCache.get("a1")).toEqual(
			expect.objectContaining({
				status: "unavailable",
				failureReason: "No readable content.",
				fetchedAt,
			}),
		);
	});

	it("retries stale unavailable cache records", async () => {
		const { repo, contentCache } = createArticlesRepoFixture();
		const staleFetchedAt = new Date("2024-02-01T10:00:00.000Z");
		const retryFetchedAt = new Date("2024-02-03T10:00:00.000Z");
		contentCache.set("a1", {
			articleId: "a1",
			status: "unavailable",
			markdown: null,
			plainText: null,
			wordCount: null,
			failureReason: "Old failure.",
			sourceUrl: "https://example.com/design",
			extractionVersion: "markdown-v1",
			fetchedAt: staleFetchedAt,
			createdAt: staleFetchedAt,
			updatedAt: staleFetchedAt,
		});
		const extractArticleContentFn = vi.fn().mockResolvedValue({
			status: "ready",
			blocks: [
				{
					type: "paragraph",
					children: [{ text: "Fresh readable body." }],
				},
			],
			paragraphs: ["Fresh readable body."],
			wordCount: 3,
		});

		const result = await getArticleReaderForUser({
			repo,
			userId: "user-1",
			id: "a1",
			extractArticleContentFn,
			now: () => retryFetchedAt,
		});

		expect(result.content).toEqual({
			status: "ready",
			markdown: "Fresh readable body\\.",
			plainText: "Fresh readable body.",
			wordCount: 3,
			fetchedAt: retryFetchedAt,
		});
		expect(extractArticleContentFn).toHaveBeenCalledOnce();
	});

	it("still returns extracted reader content when cache lookup fails", async () => {
		const { repo } = createArticlesRepoFixture();
		vi.mocked(repo.getArticleContentCache).mockRejectedValueOnce(
			new Error("no such table: article_content_cache"),
		);
		vi.mocked(repo.upsertArticleContentCache).mockRejectedValueOnce(
			new Error("no such table: article_content_cache"),
		);
		const fetchedAt = new Date("2024-02-02T10:00:00.000Z");
		const extractArticleContentFn = vi.fn().mockResolvedValue({
			status: "ready",
			blocks: [
				{
					type: "paragraph",
					children: [{ text: "Reader content without cache." }],
				},
			],
			paragraphs: ["Reader content without cache."],
			wordCount: 4,
		});

		const result = await getArticleReaderForUser({
			repo,
			userId: "user-1",
			id: "a1",
			extractArticleContentFn,
			now: () => fetchedAt,
		});

		expect(result.content).toEqual({
			status: "ready",
			markdown: "Reader content without cache\\.",
			plainText: "Reader content without cache.",
			wordCount: 4,
			fetchedAt,
		});
		expect(extractArticleContentFn).toHaveBeenCalledOnce();
	});

	it("checks article ownership before reading the content cache", async () => {
		const { repo } = createArticlesRepoFixture();

		await expect(
			getArticleReaderForUser({
				repo,
				userId: "user-2",
				id: "a1",
				extractArticleContentFn: vi.fn(),
			}),
		).rejects.toThrow("Article not found.");
		expect(repo.getArticleContentCache).not.toHaveBeenCalled();
	});

	it("rejects duplicate URLs for the same user", async () => {
		const { repo } = createArticlesRepoFixture();

		await expect(
			createArticleForUser({
				repo,
				userId: "user-1",
				url: "https://example.com/design",
				checkRateLimitFn: vi.fn().mockResolvedValue({
					allowed: true,
					retryAfterMs: 0,
				}),
				extractMetadataFn: vi.fn(),
			}),
		).rejects.toThrow("This URL is already in your library.");
	});

	it("rejects article creation when rate limited", async () => {
		const { repo } = createArticlesRepoFixture();

		await expect(
			createArticleForUser({
				repo,
				userId: "user-1",
				url: "https://example.com/new",
				checkRateLimitFn: vi.fn().mockResolvedValue({
					allowed: false,
					retryAfterMs: 500,
				}),
				extractMetadataFn: vi.fn(),
			}),
		).rejects.toThrow("Rate limit exceeded. Please try again later.");
	});

	it("updates read state and readAt semantics", async () => {
		const { repo, articles } = createArticlesRepoFixture();
		const now = new Date("2024-02-01T12:00:00.000Z");

		await updateArticleForUser({
			repo,
			userId: "user-1",
			data: { id: "a1", isRead: true },
			now: () => now,
		});

		expect(articles.find((article) => article.id === "a1")?.readAt).toEqual(
			now,
		);

		await updateArticleForUser({
			repo,
			userId: "user-1",
			data: { id: "a2", isRead: false },
			now: () => now,
		});

		expect(articles.find((article) => article.id === "a2")?.readAt).toBeNull();
	});

	it("deletes only the requested articles for the active user", async () => {
		const { repo, articles } = createArticlesRepoFixture();

		await deleteArticlesForUser({
			repo,
			userId: "user-1",
			ids: ["a1", "a3"],
		});

		expect(articles.map((article) => article.id)).toEqual(["a2", "a3"]);
	});

	it("applies filters, sorting, pagination, and tag hydration when listing", async () => {
		const { repo, articles } = createArticlesRepoFixture();
		const favoriteArticle = articles.find((article) => article.id === "a1");
		if (!favoriteArticle) {
			throw new Error("Expected fixture article");
		}
		favoriteArticle.isFavorite = true;

		const result = await getArticlesForUser({
			repo,
			userId: "user-1",
			data: {
				isRead: false,
				isFavorite: true,
				tagId: "t1",
				search: "pattern",
				sort: "title",
				limit: 1,
				offset: 0,
			},
		});

		expect(result.total).toBe(1);
		expect(result.items).toHaveLength(1);
		expect(result.items[0]?.id).toBe("a1");
		expect(result.items[0]?.tags).toEqual([
			{ id: "t1", name: "Design", color: null },
		]);
	});
});
