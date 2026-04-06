import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	createArticle,
	deleteArticles,
	getArticles,
	updateArticle,
} from "#/server/articles";
import { createArticlesRepository } from "#/server/articles-repository";
import {
	handleCreateArticle,
	handleDeleteArticles,
	handleGetArticles,
	handleUpdateArticle,
	validateCreateArticleInput,
	validateDeleteArticlesInput,
	validateGetArticlesInput,
	validateUpdateArticleInput,
} from "#/server/articles-runtime";
import { requireUserId } from "#/server/helpers";

vi.mock("@tanstack/react-start", () => ({
	createServerFn: (options: { method: string }) => ({
		inputValidator: (validator: unknown) => ({
			handler: (handler: unknown) => ({
				options,
				validator,
				handler,
			}),
		}),
		handler: (handler: unknown) => ({
			options,
			handler,
		}),
	}),
}));

vi.mock("#/server/articles-repository", () => ({
	createArticlesRepository: vi.fn(),
}));

vi.mock("#/server/helpers", () => ({
	requireUserId: vi.fn(),
}));

vi.mock("#/server/articles-runtime", () => ({
	handleGetArticles: vi.fn(),
	handleCreateArticle: vi.fn(),
	handleUpdateArticle: vi.fn(),
	handleDeleteArticles: vi.fn(),
	validateGetArticlesInput: vi.fn(),
	validateCreateArticleInput: vi.fn(),
	validateUpdateArticleInput: vi.fn(),
	validateDeleteArticlesInput: vi.fn(),
}));

type MockServerFn = {
	options: { method: string };
	validator?: unknown;
	handler: (args: { data: unknown }) => Promise<unknown>;
};

describe("articles server functions", () => {
	const getArticlesServerFn = getArticles as unknown as MockServerFn;
	const createArticleServerFn = createArticle as unknown as MockServerFn;
	const updateArticleServerFn = updateArticle as unknown as MockServerFn;
	const deleteArticlesServerFn = deleteArticles as unknown as MockServerFn;

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("wires getArticles to the GET validator and runtime handler", async () => {
		const result = { items: [], total: 0 };
		vi.mocked(handleGetArticles).mockResolvedValue(result);

		expect(getArticlesServerFn.options).toEqual({ method: "GET" });
		expect(getArticlesServerFn.validator).toBe(validateGetArticlesInput);

		await expect(
			getArticlesServerFn.handler({ data: { page: 1, q: "saved" } }),
		).resolves.toBe(result);
		expect(handleGetArticles).toHaveBeenCalledWith(
			{ page: 1, q: "saved" },
			{
				createRepository: createArticlesRepository,
				requireUserIdFn: requireUserId,
			},
		);
	});

	it("wires createArticle to the POST validator and runtime handler", async () => {
		const result = {
			id: "a1",
			userId: "user-1",
			url: "https://example.com/article",
			title: "Article",
			description: null,
			hostname: "example.com",
			faviconUrl: null,
			isRead: false,
			isFavorite: false,
			readAt: null,
			createdAt: new Date("2026-04-06T00:00:00.000Z"),
			updatedAt: new Date("2026-04-06T00:00:00.000Z"),
		};
		vi.mocked(handleCreateArticle).mockResolvedValue(result);

		expect(createArticleServerFn.options).toEqual({ method: "POST" });
		expect(createArticleServerFn.validator).toBe(validateCreateArticleInput);

		await expect(
			createArticleServerFn.handler({
				data: { url: "https://example.com/article" },
			}),
		).resolves.toBe(result);
		expect(handleCreateArticle).toHaveBeenCalledWith(
			{ url: "https://example.com/article" },
			{
				createRepository: createArticlesRepository,
				requireUserIdFn: requireUserId,
			},
		);
	});

	it("wires updateArticle to the POST validator and runtime handler", async () => {
		const result = { success: true };
		vi.mocked(handleUpdateArticle).mockResolvedValue(result);

		expect(updateArticleServerFn.options).toEqual({ method: "POST" });
		expect(updateArticleServerFn.validator).toBe(validateUpdateArticleInput);

		await expect(
			updateArticleServerFn.handler({ data: { id: "a1", isRead: true } }),
		).resolves.toBe(result);
		expect(handleUpdateArticle).toHaveBeenCalledWith(
			{ id: "a1", isRead: true },
			{
				createRepository: createArticlesRepository,
				requireUserIdFn: requireUserId,
			},
		);
	});

	it("wires deleteArticles to the POST validator and runtime handler", async () => {
		const result = { success: true };
		vi.mocked(handleDeleteArticles).mockResolvedValue(result);

		expect(deleteArticlesServerFn.options).toEqual({ method: "POST" });
		expect(deleteArticlesServerFn.validator).toBe(validateDeleteArticlesInput);

		await expect(
			deleteArticlesServerFn.handler({ data: { ids: ["a1", "a2"] } }),
		).resolves.toBe(result);
		expect(handleDeleteArticles).toHaveBeenCalledWith(
			{ ids: ["a1", "a2"] },
			{
				createRepository: createArticlesRepository,
				requireUserIdFn: requireUserId,
			},
		);
	});
});
