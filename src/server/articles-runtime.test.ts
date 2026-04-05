import { describe, expect, it, vi } from "vitest";
import {
	handleCreateArticle,
	handleGetArticles,
	validateCreateArticleInput,
	validateGetArticlesInput,
} from "#/server/articles-runtime";

vi.mock("#/server/rate-limit", () => ({
	checkRateLimit: vi.fn(),
}));

vi.mock("#/server/metadata", () => ({
	extractMetadata: vi.fn(),
}));

describe("articles-runtime", () => {
	it("rejects invalid article input", () => {
		expect(() => validateCreateArticleInput({ url: "not-a-url" })).toThrow(
			"Invalid article URL.",
		);
	});

	it("requires a user id and delegates list requests to the article service", async () => {
		const requireUserIdFn = vi.fn().mockResolvedValue("user-1");
		const createRepository = vi.fn().mockReturnValue({ repo: true });
		const getArticlesForUserFn = vi
			.fn()
			.mockResolvedValue({ items: [], total: 0 });

		const result = await handleGetArticles(
			validateGetArticlesInput({ sort: "title", limit: 20, offset: 0 }),
			{
				createRepository,
				requireUserIdFn,
				getArticlesForUserFn,
			},
		);

		expect(requireUserIdFn).toHaveBeenCalled();
		expect(createRepository).toHaveBeenCalled();
		expect(getArticlesForUserFn).toHaveBeenCalledWith({
			repo: { repo: true },
			userId: "user-1",
			data: { sort: "title", limit: 20, offset: 0 },
		});
		expect(result).toEqual({ items: [], total: 0 });
	});

	it("delegates create requests with metadata and rate-limit dependencies", async () => {
		const requireUserIdFn = vi.fn().mockResolvedValue("user-1");
		const createRepository = vi.fn().mockReturnValue({ repo: true });
		const createArticleForUserFn = vi.fn().mockResolvedValue({ id: "a1" });
		const checkRateLimitFn = vi.fn();
		const extractMetadataFn = vi.fn();

		await handleCreateArticle(
			validateCreateArticleInput({ url: "https://example.com" }),
			{
				createRepository,
				requireUserIdFn,
				createArticleForUserFn,
				checkRateLimitFn,
				extractMetadataFn,
			},
		);

		expect(createArticleForUserFn).toHaveBeenCalledWith({
			repo: { repo: true },
			userId: "user-1",
			url: "https://example.com",
			checkRateLimitFn,
			extractMetadataFn,
		});
	});
});
