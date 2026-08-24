import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	handleExtensionArticlesOptions,
	handleExtensionArticlesPost,
} from "#/routes/api/extension/-articles-handlers";

const {
	checkRateLimitMock,
	createArticleForUserMock,
	createRepositoryMock,
	extractMetadataMock,
	getSessionMock,
} = vi.hoisted(() => ({
	checkRateLimitMock: vi.fn(),
	createArticleForUserMock: vi.fn(),
	createRepositoryMock: vi.fn(),
	extractMetadataMock: vi.fn(),
	getSessionMock: vi.fn(),
}));

vi.mock("#/lib/auth", () => ({
	getAuth: () => ({
		api: {
			getSession: getSessionMock,
		},
	}),
}));

vi.mock("#/server/articles-repository", () => ({
	createArticlesRepository: createRepositoryMock,
}));

vi.mock("#/server/rate-limit", () => ({
	checkRateLimit: checkRateLimitMock,
}));

describe("extension article handlers", () => {
	beforeEach(() => {
		checkRateLimitMock.mockReset();
		createArticleForUserMock.mockReset();
		createRepositoryMock.mockReset();
		extractMetadataMock.mockReset();
		getSessionMock.mockReset();
	});

	it("returns a login URL when the extension request is not authenticated", async () => {
		getSessionMock.mockResolvedValue(null);

		const response = await handleExtensionArticlesPost(
			{
				request: new Request("https://hold-shelf.com/api/extension/articles", {
					method: "POST",
					headers: {
						"content-type": "application/json",
						origin: "chrome-extension://test-extension-id",
					},
					body: JSON.stringify({ url: "https://example.com/article" }),
				}),
			},
			{
				getSessionFn: getSessionMock,
			},
		);

		expect(response.status).toBe(401);
		expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
			"chrome-extension://test-extension-id",
		);
		await expect(response.json()).resolves.toEqual({
			code: "UNAUTHORIZED",
			message: "Sign in to Hold Shelf to save from Chrome.",
			loginUrl:
				"https://hold-shelf.com/save?url=https%3A%2F%2Fexample.com%2Farticle",
		});
	});

	it("saves an article for an authenticated extension request", async () => {
		const repo = { kind: "repo" };
		getSessionMock.mockResolvedValue({
			user: {
				id: "user-1",
			},
		});
		createRepositoryMock.mockReturnValue(repo);
		createArticleForUserMock.mockResolvedValue({
			id: "article-1",
			url: "https://example.com/article",
			title: "Example article",
		});

		const response = await handleExtensionArticlesPost(
			{
				request: new Request("https://hold-shelf.com/api/extension/articles", {
					method: "POST",
					headers: {
						"content-type": "application/json",
					},
					body: JSON.stringify({ url: "https://example.com/article" }),
				}),
			},
			{
				checkRateLimitFn: checkRateLimitMock,
				createArticleForUserFn: createArticleForUserMock,
				createRepository: createRepositoryMock,
				extractMetadataFn: extractMetadataMock,
				getSessionFn: getSessionMock,
			},
		);

		expect(response.status).toBe(200);
		expect(createArticleForUserMock).toHaveBeenCalledWith({
			repo,
			userId: "user-1",
			url: "https://example.com/article",
			checkRateLimitFn: checkRateLimitMock,
			extractMetadataFn: extractMetadataMock,
		});
		await expect(response.json()).resolves.toEqual({
			status: "saved",
			article: {
				id: "article-1",
				url: "https://example.com/article",
				title: "Example article",
			},
		});
	});

	it("returns a duplicate-specific response when the article already exists", async () => {
		getSessionMock.mockResolvedValue({
			user: {
				id: "user-1",
			},
		});
		createRepositoryMock.mockReturnValue({});
		createArticleForUserMock.mockRejectedValue(
			new Error("This URL is already in your library."),
		);

		const response = await handleExtensionArticlesPost(
			{
				request: new Request("https://hold-shelf.com/api/extension/articles", {
					method: "POST",
					headers: {
						"content-type": "application/json",
					},
					body: JSON.stringify({ url: "https://example.com/article" }),
				}),
			},
			{
				createArticleForUserFn: createArticleForUserMock,
				createRepository: createRepositoryMock,
				getSessionFn: getSessionMock,
			},
		);

		expect(response.status).toBe(409);
		await expect(response.json()).resolves.toEqual({
			code: "ARTICLE_EXISTS",
			message: "This URL is already in your library.",
		});
	});

	it("returns 400 for invalid request bodies", async () => {
		const response = await handleExtensionArticlesPost(
			{
				request: new Request("https://hold-shelf.com/api/extension/articles", {
					method: "POST",
					headers: {
						"content-type": "application/json",
					},
					body: JSON.stringify({ url: "ftp://example.com/article" }),
				}),
			},
			{
				getSessionFn: getSessionMock,
			},
		);

		expect(response.status).toBe(400);
		await expect(response.json()).resolves.toEqual({
			code: "INVALID_URL",
			message: "Invalid article URL.",
		});
		expect(getSessionMock).not.toHaveBeenCalled();
	});

	it("returns extension-friendly preflight headers", async () => {
		const response = await handleExtensionArticlesOptions({
			request: new Request("https://hold-shelf.com/api/extension/articles", {
				method: "OPTIONS",
				headers: {
					origin: "chrome-extension://test-extension-id",
				},
			}),
		});

		expect(response.status).toBe(204);
		expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
			"chrome-extension://test-extension-id",
		);
		expect(response.headers.get("Access-Control-Allow-Methods")).toBe(
			"OPTIONS, POST",
		);
	});
});
