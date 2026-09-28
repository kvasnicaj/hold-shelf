import { describe, expect, it, vi } from "vitest";
import {
	handleV1ArticleTagDelete,
	handleV1ArticleTagPut,
} from "#/routes/api/v1/-article-tags-handlers";
import type { TagsRepository } from "#/server/tags-service";

function createAuthDependencies() {
	return {
		checkRateLimitFn: vi
			.fn()
			.mockResolvedValue({ allowed: true, retryAfterMs: 0 }),
		createApiTokensRepositoryFn: vi.fn().mockReturnValue({}),
		getUserIdFromBearerTokenFn: vi.fn().mockResolvedValue("user-1"),
	};
}

function createTagsRepository({
	hasOwnedTag = true,
	ownedArticleCount = 1,
}: {
	hasOwnedTag?: boolean;
	ownedArticleCount?: number;
} = {}): TagsRepository {
	return {
		listTags: vi.fn(),
		createTag: vi.fn(),
		updateTag: vi.fn(),
		deleteTag: vi.fn(),
		hasOwnedTag: vi.fn().mockResolvedValue(hasOwnedTag),
		countOwnedArticles: vi.fn().mockResolvedValue(ownedArticleCount),
		addTagToArticles: vi.fn().mockResolvedValue(undefined),
		removeTagFromArticles: vi.fn().mockResolvedValue(undefined),
	};
}

function createRequest(method: "PUT" | "DELETE") {
	return new Request(
		"https://hold-shelf.com/api/v1/articles/article-1/tags/tag-1",
		{
			method,
			headers: { authorization: "Bearer hs_token" },
		},
	);
}

describe("v1 article tag API handlers", () => {
	it("assigns a tag through the existing tag service", async () => {
		const repo = createTagsRepository();

		const response = await handleV1ArticleTagPut(
			{
				request: createRequest("PUT"),
				params: { id: "article-1", tagId: "tag-1" },
			},
			{
				...createAuthDependencies(),
				createTagsRepositoryFn: () => repo,
			},
		);

		expect(response.status).toBe(200);
		expect(repo.hasOwnedTag).toHaveBeenCalledWith({
			userId: "user-1",
			tagId: "tag-1",
		});
		expect(repo.countOwnedArticles).toHaveBeenCalledWith({
			userId: "user-1",
			articleIds: ["article-1"],
		});
		expect(repo.addTagToArticles).toHaveBeenCalledWith({
			tagId: "tag-1",
			articleIds: ["article-1"],
		});
		await expect(response.json()).resolves.toEqual({ success: true });
	});

	it("removes a tag through the existing tag service", async () => {
		const repo = createTagsRepository();

		const response = await handleV1ArticleTagDelete(
			{
				request: createRequest("DELETE"),
				params: { id: "article-1", tagId: "tag-1" },
			},
			{
				...createAuthDependencies(),
				createTagsRepositoryFn: () => repo,
			},
		);

		expect(response.status).toBe(200);
		expect(repo.removeTagFromArticles).toHaveBeenCalledWith({
			tagId: "tag-1",
			articleIds: ["article-1"],
		});
		await expect(response.json()).resolves.toEqual({ success: true });
	});

	it("returns 404 when the tag is missing or belongs to another user", async () => {
		const response = await handleV1ArticleTagPut(
			{
				request: createRequest("PUT"),
				params: { id: "article-1", tagId: "unowned-tag" },
			},
			{
				...createAuthDependencies(),
				createTagsRepositoryFn: () =>
					createTagsRepository({ hasOwnedTag: false }),
			},
		);

		expect(response.status).toBe(404);
		await expect(response.json()).resolves.toEqual({
			code: "TAG_NOT_FOUND",
			message: "Tag not found.",
		});
	});

	it("returns a singular 404 when the article is missing or unowned", async () => {
		const response = await handleV1ArticleTagDelete(
			{
				request: createRequest("DELETE"),
				params: { id: "unowned-article", tagId: "tag-1" },
			},
			{
				...createAuthDependencies(),
				createTagsRepositoryFn: () =>
					createTagsRepository({ ownedArticleCount: 0 }),
			},
		);

		expect(response.status).toBe(404);
		await expect(response.json()).resolves.toEqual({
			code: "ARTICLE_NOT_FOUND",
			message: "Article not found.",
		});
	});

	it("rejects invalid path ids before calling the tag service", async () => {
		const addTagToArticlesForUserFn = vi.fn();
		const response = await handleV1ArticleTagPut(
			{
				request: createRequest("PUT"),
				params: { id: " ", tagId: "tag-1" },
			},
			{
				...createAuthDependencies(),
				addTagToArticlesForUserFn,
			},
		);

		expect(response.status).toBe(400);
		expect(addTagToArticlesForUserFn).not.toHaveBeenCalled();
		await expect(response.json()).resolves.toEqual({
			code: "INVALID_TAG_ASSIGNMENT",
			message: "Invalid tag assignment.",
		});
	});
});
