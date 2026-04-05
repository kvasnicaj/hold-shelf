import { describe, expect, it, vi } from "vitest";
import {
	type ArticlesRepository,
	createArticleForUser,
	deleteArticlesForUser,
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

	const repo: ArticlesRepository = {
		listArticles: vi.fn(
			async ({ userId, isRead, tagId, search, sort, limit, offset }) => {
				let filtered = articles.filter((article) => article.userId === userId);

				if (isRead !== undefined) {
					filtered = filtered.filter((article) => article.isRead === isRead);
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

	return { repo, articles };
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
		const { repo } = createArticlesRepoFixture();

		const result = await getArticlesForUser({
			repo,
			userId: "user-1",
			data: {
				isRead: false,
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
