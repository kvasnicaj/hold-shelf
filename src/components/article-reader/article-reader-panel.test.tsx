import { describe, expect, it, vi } from "vitest";
import { ArticleReaderPanel } from "#/components/article-reader/article-reader-panel";
import { renderWithProviders } from "#/test/render";

const { readerState, getArticleReaderMock, getTagsMock, updateArticleMock } =
	vi.hoisted(() => ({
		readerState: {
			articleId: null as string | null,
			isOpen: false,
			closeArticle: vi.fn(),
		},
		getArticleReaderMock: vi.fn(),
		getTagsMock: vi.fn(),
		updateArticleMock: vi.fn(),
	}));

vi.mock("#/components/article-reader/use-article-reader", () => ({
	useArticleReader: () => ({
		articleId: readerState.articleId,
		isOpen: readerState.isOpen,
		closeArticle: readerState.closeArticle,
	}),
}));

vi.mock("#/server/articles", () => ({
	getArticleReader: getArticleReaderMock,
	updateArticle: updateArticleMock,
}));

vi.mock("#/server/tags", () => ({
	addTagToArticles: vi.fn(),
	createTag: vi.fn(),
	getTags: getTagsMock,
	removeTagFromArticles: vi.fn(),
}));

describe("ArticleReaderPanel", () => {
	it("hides the closed reader from assistive technologies and focus", () => {
		readerState.articleId = null;
		readerState.isOpen = false;
		getTagsMock.mockResolvedValue([]);

		const { container } = renderWithProviders(<ArticleReaderPanel />);

		const reader = container.querySelector(
			'aside[aria-label="Article reader"]',
		);
		expect(reader).toHaveAttribute("aria-hidden", "true");
		expect(reader).toHaveAttribute("inert");
	});

	it("keeps the open reader accessible", () => {
		readerState.articleId = "a1";
		readerState.isOpen = true;
		getTagsMock.mockResolvedValue([]);
		getArticleReaderMock.mockResolvedValue({
			article: {
				id: "a1",
				url: "https://example.com",
				title: "Example",
				description: null,
				hostname: "example.com",
				faviconUrl: null,
				isRead: false,
				isFavorite: false,
				createdAt: new Date("2024-01-01T00:00:00.000Z"),
				tags: [],
			},
			content: {
				status: "unavailable",
				reason: "No readable content.",
			},
		});

		const { container } = renderWithProviders(<ArticleReaderPanel />);

		const reader = container.querySelector(
			'aside[aria-label="Article reader"]',
		);
		expect(reader).toHaveAttribute("aria-hidden", "false");
		expect(reader).not.toHaveAttribute("inert");
	});
});
