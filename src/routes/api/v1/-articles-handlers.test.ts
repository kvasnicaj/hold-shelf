import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { ArticleAlreadyExistsError } from "#/server/articles-service";

const {
	checkRateLimitMock,
	createApiTokensRepositoryMock,
	createArticleForUserMock,
	createArticlesRepositoryMock,
	extractMetadataMock,
	getArticlesForUserMock,
	getUserIdFromBearerTokenMock,
} = vi.hoisted(() => ({
	checkRateLimitMock: vi.fn(),
	createApiTokensRepositoryMock: vi.fn(),
	createArticleForUserMock: vi.fn(),
	createArticlesRepositoryMock: vi.fn(),
	extractMetadataMock: vi.fn(),
	getArticlesForUserMock: vi.fn(),
	getUserIdFromBearerTokenMock: vi.fn(),
}));

vi.mock("#/server/api-tokens-repository", () => ({
	createApiTokensRepository: createApiTokensRepositoryMock,
}));

vi.mock("#/server/articles-repository", () => ({
	createArticlesRepository: createArticlesRepositoryMock,
}));

let handleV1ArticlesGet: typeof import("#/routes/api/v1/-articles-handlers").handleV1ArticlesGet;
let handleV1ArticlesPost: typeof import("#/routes/api/v1/-articles-handlers").handleV1ArticlesPost;

describe("v1 articles API handlers", () => {
	beforeAll(async () => {
		const handlers = await import("#/routes/api/v1/-articles-handlers");
		handleV1ArticlesGet = handlers.handleV1ArticlesGet;
		handleV1ArticlesPost = handlers.handleV1ArticlesPost;
	});

	beforeEach(() => {
		checkRateLimitMock.mockReset();
		checkRateLimitMock.mockResolvedValue({ allowed: true, retryAfterMs: 0 });
		createApiTokensRepositoryMock.mockReset();
		createArticleForUserMock.mockReset();
		createArticlesRepositoryMock.mockReset();
		extractMetadataMock.mockReset();
		getArticlesForUserMock.mockReset();
		getUserIdFromBearerTokenMock.mockReset();
	});

	it("requires a bearer token", async () => {
		getUserIdFromBearerTokenMock.mockResolvedValue(null);
		createApiTokensRepositoryMock.mockReturnValue({});

		const response = await handleV1ArticlesGet(
			{
				request: new Request("https://hold-shelf.com/api/v1/articles"),
			},
			{
				checkRateLimitFn: checkRateLimitMock,
				createApiTokensRepositoryFn: createApiTokensRepositoryMock,
				getUserIdFromBearerTokenFn: getUserIdFromBearerTokenMock,
			},
		);

		expect(response.status).toBe(401);
		await expect(response.json()).resolves.toEqual({
			code: "UNAUTHORIZED",
			message: "Invalid or missing API token.",
		});
	});

	it("keeps authentication infrastructure failures inside the API error contract", async () => {
		const consoleError = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});
		checkRateLimitMock.mockRejectedValue(new Error("private database details"));

		const response = await handleV1ArticlesGet(
			{
				request: new Request("https://hold-shelf.com/api/v1/articles"),
			},
			{
				checkRateLimitFn: checkRateLimitMock,
				createApiTokensRepositoryFn: createApiTokensRepositoryMock,
				getUserIdFromBearerTokenFn: getUserIdFromBearerTokenMock,
			},
		);

		expect(response.status).toBe(500);
		await expect(response.json()).resolves.toEqual({
			code: "AUTHENTICATION_UNAVAILABLE",
			message: "Authentication service is temporarily unavailable.",
		});
		expect(getUserIdFromBearerTokenMock).not.toHaveBeenCalled();
		expect(consoleError).toHaveBeenCalledOnce();
		consoleError.mockRestore();
	});

	it("rate limits requests before token lookup", async () => {
		checkRateLimitMock.mockResolvedValueOnce({
			allowed: false,
			retryAfterMs: 12_000,
		});

		const response = await handleV1ArticlesGet(
			{
				request: new Request("https://hold-shelf.com/api/v1/articles", {
					headers: {
						"cf-connecting-ip": "203.0.113.10",
					},
				}),
			},
			{
				checkRateLimitFn: checkRateLimitMock,
				createApiTokensRepositoryFn: createApiTokensRepositoryMock,
				getUserIdFromBearerTokenFn: getUserIdFromBearerTokenMock,
			},
		);

		expect(response.status).toBe(429);
		expect(response.headers.get("Retry-After")).toBe("12");
		expect(checkRateLimitMock).toHaveBeenCalledWith(
			{ name: "api-v1-auth", windowMs: 60_000, max: 60 },
			"203.0.113.10",
		);
		expect(getUserIdFromBearerTokenMock).not.toHaveBeenCalled();
	});

	it("rate limits authenticated API requests by user", async () => {
		createApiTokensRepositoryMock.mockReturnValue({});
		getUserIdFromBearerTokenMock.mockResolvedValue("user-1");
		checkRateLimitMock
			.mockResolvedValueOnce({ allowed: true, retryAfterMs: 0 })
			.mockResolvedValueOnce({ allowed: false, retryAfterMs: 30_000 });

		const response = await handleV1ArticlesGet(
			{
				request: new Request("https://hold-shelf.com/api/v1/articles", {
					headers: {
						authorization: "Bearer hs_token",
						"cf-connecting-ip": "203.0.113.10",
					},
				}),
			},
			{
				checkRateLimitFn: checkRateLimitMock,
				createApiTokensRepositoryFn: createApiTokensRepositoryMock,
				getArticlesForUserFn: getArticlesForUserMock,
				getUserIdFromBearerTokenFn: getUserIdFromBearerTokenMock,
			},
		);

		expect(response.status).toBe(429);
		expect(response.headers.get("Retry-After")).toBe("30");
		expect(checkRateLimitMock).toHaveBeenLastCalledWith(
			{ name: "api-v1", windowMs: 60_000, max: 120 },
			"user-1",
		);
		expect(getArticlesForUserMock).not.toHaveBeenCalled();
	});

	it("lists articles for the token owner", async () => {
		const apiTokenRepo = { kind: "tokens" };
		const articlesRepo = { kind: "articles" };
		const createdAt = new Date("2026-08-29T12:00:00.000Z");
		const updatedAt = new Date("2026-08-30T12:00:00.000Z");
		const result = {
			items: [
				{
					id: "article-1",
					userId: "user-1",
					url: "https://example.com/article",
					title: "Example",
					description: "An example article.",
					hostname: "example.com",
					faviconUrl: null,
					isRead: false,
					isFavorite: true,
					createdAt,
					updatedAt,
					readAt: null,
					tags: [],
				},
			],
			total: 1,
		};
		createApiTokensRepositoryMock.mockReturnValue(apiTokenRepo);
		createArticlesRepositoryMock.mockReturnValue(articlesRepo);
		getUserIdFromBearerTokenMock.mockResolvedValue("user-1");
		getArticlesForUserMock.mockResolvedValue(result);

		const response = await handleV1ArticlesGet(
			{
				request: new Request(
					"https://hold-shelf.com/api/v1/articles?limit=10&offset=20&isRead=false&sort=oldest&search=example",
					{ headers: { authorization: "Bearer hs_token" } },
				),
			},
			{
				checkRateLimitFn: checkRateLimitMock,
				createApiTokensRepositoryFn: createApiTokensRepositoryMock,
				createArticlesRepositoryFn: createArticlesRepositoryMock,
				getArticlesForUserFn: getArticlesForUserMock,
				getUserIdFromBearerTokenFn: getUserIdFromBearerTokenMock,
			},
		);

		expect(response.status).toBe(200);
		expect(getUserIdFromBearerTokenMock).toHaveBeenCalledWith({
			authorization: "Bearer hs_token",
			repo: apiTokenRepo,
		});
		expect(getArticlesForUserMock).toHaveBeenCalledWith({
			repo: articlesRepo,
			userId: "user-1",
			data: {
				isRead: false,
				limit: 10,
				offset: 20,
				search: "example",
				sort: "oldest",
			},
		});
		const body = (await response.json()) as {
			items: Array<Record<string, unknown>>;
		};
		expect(body.items[0]).not.toHaveProperty("userId");
		expect(body).toEqual({
			items: [
				{
					id: "article-1",
					url: "https://example.com/article",
					title: "Example",
					description: "An example article.",
					hostname: "example.com",
					faviconUrl: null,
					isRead: false,
					isFavorite: true,
					createdAt: "2026-08-29T12:00:00.000Z",
					updatedAt: "2026-08-30T12:00:00.000Z",
					readAt: null,
					tags: [],
				},
			],
			total: 1,
		});
	});

	it("saves an article for the token owner", async () => {
		createApiTokensRepositoryMock.mockReturnValue({});
		createArticlesRepositoryMock.mockReturnValue({});
		getUserIdFromBearerTokenMock.mockResolvedValue("user-1");
		createArticleForUserMock.mockResolvedValue({
			id: "article-1",
			url: "https://example.com/article",
			title: "Example",
		});

		const response = await handleV1ArticlesPost(
			{
				request: new Request("https://hold-shelf.com/api/v1/articles", {
					method: "POST",
					headers: {
						authorization: "Bearer hs_token",
						"content-type": "application/json",
					},
					body: JSON.stringify({ url: "https://example.com/article" }),
				}),
			},
			{
				checkRateLimitFn: checkRateLimitMock,
				createApiTokensRepositoryFn: createApiTokensRepositoryMock,
				createArticleForUserFn: createArticleForUserMock,
				createArticlesRepositoryFn: createArticlesRepositoryMock,
				extractMetadataFn: extractMetadataMock,
				getUserIdFromBearerTokenFn: getUserIdFromBearerTokenMock,
			},
		);

		expect(response.status).toBe(200);
		expect(createArticleForUserMock).toHaveBeenCalledWith({
			repo: {},
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
				title: "Example",
			},
		});
	});

	it("treats duplicate saves as idempotent", async () => {
		createApiTokensRepositoryMock.mockReturnValue({});
		createArticlesRepositoryMock.mockReturnValue({});
		getUserIdFromBearerTokenMock.mockResolvedValue("user-1");
		createArticleForUserMock.mockRejectedValue(
			new ArticleAlreadyExistsError({
				articleId: "article-1",
				url: "https://example.com/article",
			}),
		);

		const response = await handleV1ArticlesPost(
			{
				request: new Request("https://hold-shelf.com/api/v1/articles", {
					method: "POST",
					headers: {
						authorization: "Bearer hs_token",
						"content-type": "application/json",
					},
					body: JSON.stringify({ url: "https://example.com/article" }),
				}),
			},
			{
				checkRateLimitFn: checkRateLimitMock,
				createApiTokensRepositoryFn: createApiTokensRepositoryMock,
				createArticleForUserFn: createArticleForUserMock,
				createArticlesRepositoryFn: createArticlesRepositoryMock,
				extractMetadataFn: extractMetadataMock,
				getUserIdFromBearerTokenFn: getUserIdFromBearerTokenMock,
			},
		);

		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toEqual({
			status: "exists",
			message: "This URL is already in your library.",
			article: {
				id: "article-1",
				url: "https://example.com/article",
			},
		});
	});

	it("returns 400 for invalid create payloads", async () => {
		createApiTokensRepositoryMock.mockReturnValue({});
		getUserIdFromBearerTokenMock.mockResolvedValue("user-1");

		const response = await handleV1ArticlesPost(
			{
				request: new Request("https://hold-shelf.com/api/v1/articles", {
					method: "POST",
					headers: {
						authorization: "Bearer hs_token",
						"content-type": "application/json",
					},
					body: JSON.stringify({ url: "ftp://example.com/article" }),
				}),
			},
			{
				checkRateLimitFn: checkRateLimitMock,
				createApiTokensRepositoryFn: createApiTokensRepositoryMock,
				getUserIdFromBearerTokenFn: getUserIdFromBearerTokenMock,
			},
		);

		expect(response.status).toBe(400);
		await expect(response.json()).resolves.toEqual({
			code: "INVALID_URL",
			message: "Invalid article URL.",
		});
	});
});
