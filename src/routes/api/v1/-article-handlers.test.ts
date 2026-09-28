import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	handleV1ArticleDelete,
	handleV1ArticleGet,
	handleV1ArticlePatch,
} from "#/routes/api/v1/-article-handlers";
import type { ArticlesRepository } from "#/server/articles-service";

vi.mock("#/server/article-content", () => ({
	extractArticleContent: vi.fn(),
}));

vi.mock("#/server/metadata", () => ({
	extractMetadata: vi.fn(),
}));

vi.mock("#/server/rate-limit", () => ({
	checkRateLimit: vi.fn(),
}));

const articlesRepo = {} as ArticlesRepository;

function createAuthDependencies() {
	return {
		checkRateLimitFn: vi
			.fn()
			.mockResolvedValue({ allowed: true, retryAfterMs: 0 }),
		createApiTokensRepositoryFn: vi.fn().mockReturnValue({}),
		getUserIdFromBearerTokenFn: vi.fn().mockResolvedValue("user-1"),
	};
}

function createRequest(method = "GET", body?: unknown) {
	return new Request("https://hold-shelf.com/api/v1/articles/article-1", {
		method,
		headers: {
			authorization: "Bearer hs_token",
			...(body === undefined ? {} : { "content-type": "application/json" }),
		},
		body: body === undefined ? undefined : JSON.stringify(body),
	});
}

describe("v1 article API handlers", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("returns an owned article and its reader content", async () => {
		const createdAt = new Date("2026-08-29T12:00:00.000Z");
		const updatedAt = new Date("2026-08-30T12:00:00.000Z");
		const fetchedAt = new Date("2026-08-30T12:30:00.000Z");
		const getArticleReaderForUserFn = vi.fn().mockResolvedValue({
			article: {
				id: "article-1",
				userId: "user-1",
				url: "https://example.com/article",
				title: "Example",
				description: "An example article.",
				hostname: "example.com",
				faviconUrl: null,
				isRead: false,
				isFavorite: false,
				createdAt,
				updatedAt,
				readAt: null,
				tags: [],
			},
			content: {
				status: "ready",
				markdown: "Article text",
				plainText: "Article text",
				wordCount: 2,
				fetchedAt,
			},
		});
		const extractArticleContentFn = vi.fn();

		const response = await handleV1ArticleGet(
			{
				request: createRequest(),
				params: { id: "article-1" },
			},
			{
				...createAuthDependencies(),
				createArticlesRepositoryFn: () => articlesRepo,
				extractArticleContentFn,
				getArticleReaderForUserFn,
			},
		);

		expect(response.status).toBe(200);
		expect(getArticleReaderForUserFn).toHaveBeenCalledWith({
			repo: articlesRepo,
			userId: "user-1",
			id: "article-1",
			extractArticleContentFn,
		});
		const body = (await response.json()) as {
			article: Record<string, unknown>;
		};
		expect(body.article).not.toHaveProperty("userId");
		expect(body).toEqual({
			article: {
				id: "article-1",
				url: "https://example.com/article",
				title: "Example",
				description: "An example article.",
				hostname: "example.com",
				faviconUrl: null,
				isRead: false,
				isFavorite: false,
				createdAt: "2026-08-29T12:00:00.000Z",
				updatedAt: "2026-08-30T12:00:00.000Z",
				readAt: null,
				tags: [],
			},
			content: {
				status: "ready",
				markdown: "Article text",
				plainText: "Article text",
				wordCount: 2,
				fetchedAt: "2026-08-30T12:30:00.000Z",
			},
		});
	});

	it("patches mutable fields while taking the id from the path", async () => {
		const updateArticleForUserFn = vi.fn().mockResolvedValue({ success: true });

		const response = await handleV1ArticlePatch(
			{
				request: createRequest("PATCH", {
					id: "spoofed-id",
					isRead: true,
					isFavorite: false,
				}),
				params: { id: "article-1" },
			},
			{
				...createAuthDependencies(),
				createArticlesRepositoryFn: () => articlesRepo,
				updateArticleForUserFn,
			},
		);

		expect(response.status).toBe(200);
		expect(updateArticleForUserFn).toHaveBeenCalledWith({
			repo: articlesRepo,
			userId: "user-1",
			data: {
				id: "article-1",
				isRead: true,
				isFavorite: false,
			},
		});
		await expect(response.json()).resolves.toEqual({ success: true });
	});

	it("deletes one owned article", async () => {
		const deleteArticleForUserFn = vi.fn().mockResolvedValue({ success: true });

		const response = await handleV1ArticleDelete(
			{
				request: createRequest("DELETE"),
				params: { id: "article-1" },
			},
			{
				...createAuthDependencies(),
				createArticlesRepositoryFn: () => articlesRepo,
				deleteArticleForUserFn,
			},
		);

		expect(response.status).toBe(200);
		expect(deleteArticleForUserFn).toHaveBeenCalledWith({
			repo: articlesRepo,
			userId: "user-1",
			id: "article-1",
		});
		await expect(response.json()).resolves.toEqual({ success: true });
	});

	it.each([
		["GET", handleV1ArticleGet, "ARTICLE_READ_FAILED"],
		["PATCH", handleV1ArticlePatch, "UPDATE_FAILED"],
		["DELETE", handleV1ArticleDelete, "DELETE_FAILED"],
	] as const)("returns one 404 shape for a missing or unowned article on %s", async (method, handler, dependencyName) => {
		const articleOperation = vi
			.fn()
			.mockRejectedValue(new Error("Article not found."));
		const dependencies = {
			...createAuthDependencies(),
			createArticlesRepositoryFn: () => articlesRepo,
			extractArticleContentFn: vi.fn(),
			getArticleReaderForUserFn:
				dependencyName === "ARTICLE_READ_FAILED" ? articleOperation : undefined,
			updateArticleForUserFn:
				dependencyName === "UPDATE_FAILED" ? articleOperation : undefined,
			deleteArticleForUserFn:
				dependencyName === "DELETE_FAILED" ? articleOperation : undefined,
		};
		const request =
			method === "PATCH"
				? createRequest(method, { isRead: true })
				: createRequest(method);

		const response = await handler(
			{ request, params: { id: "unowned-article" } },
			dependencies,
		);

		expect(response.status).toBe(404);
		await expect(response.json()).resolves.toEqual({
			code: "ARTICLE_NOT_FOUND",
			message: "Article not found.",
		});
	});

	it("rejects an empty patch", async () => {
		const updateArticleForUserFn = vi.fn();
		const response = await handleV1ArticlePatch(
			{
				request: createRequest("PATCH", {}),
				params: { id: "article-1" },
			},
			{
				...createAuthDependencies(),
				updateArticleForUserFn,
			},
		);

		expect(response.status).toBe(400);
		expect(updateArticleForUserFn).not.toHaveBeenCalled();
		await expect(response.json()).resolves.toEqual({
			code: "INVALID_ARTICLE_UPDATE",
			message: "Invalid article update.",
		});
	});
});
