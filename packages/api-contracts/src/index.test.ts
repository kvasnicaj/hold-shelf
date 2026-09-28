import { describe, expect, it } from "vitest";
import {
	articleListResponseSchema,
	createArticleRequestSchema,
	createArticleResponseSchema,
	tagsResponseSchema,
} from "./index.js";

describe("API wire contracts", () => {
	it("accepts ISO dates and strips database-only article fields", () => {
		const result = articleListResponseSchema.parse({
			items: [
				{
					id: "article-1",
					userId: "must-not-cross-the-client-boundary",
					url: "https://example.com/story",
					title: "Story",
					description: null,
					hostname: "example.com",
					faviconUrl: null,
					isRead: false,
					isFavorite: true,
					createdAt: "2026-08-30T12:00:00.000Z",
					updatedAt: "2026-08-30T12:00:00.000Z",
					readAt: null,
					tags: [],
				},
			],
			total: 1,
		});

		expect(result.items[0]).not.toHaveProperty("userId");
	});

	it("keeps the duplicate article id needed for retry-safe tag assignment", () => {
		const result = createArticleResponseSchema.parse({
			status: "exists",
			message: "Already saved",
			article: { id: "article-1", url: "https://example.com/story" },
		});

		expect(result.article.id).toBe("article-1");
	});

	it("rejects Date objects because contracts describe JSON", () => {
		expect(() =>
			tagsResponseSchema.parse([
				{
					id: "tag-1",
					name: "Later",
					color: null,
					createdAt: new Date(),
					articleCount: 2,
				},
			]),
		).toThrow();
	});

	it("validates article URLs without canonicalizing duplicate keys", () => {
		const result = createArticleRequestSchema.parse({
			url: "  https://example.com  ",
		});

		expect(result.url).toBe("https://example.com");
		expect(() =>
			createArticleRequestSchema.parse({ url: "file:///tmp/article" }),
		).toThrow();
	});
});
