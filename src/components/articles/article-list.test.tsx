import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ArticleList } from "#/components/articles/article-list";
import type { ArticleWithTags } from "#/components/articles/types";
import type { Tag } from "#/components/tags/types";
import { renderWithProviders } from "#/test/render";

const { articleCardMock, articleCardMobileMock, useIsMobileMock } = vi.hoisted(
	() => ({
		articleCardMock: vi.fn(),
		articleCardMobileMock: vi.fn(),
		useIsMobileMock: vi.fn(),
	}),
);

vi.mock("#/hooks/use-mobile", () => ({
	useIsMobile: useIsMobileMock,
}));

vi.mock("#/components/articles/article-card", () => ({
	ArticleCard: (props: {
		article: ArticleWithTags;
		selected: boolean;
		onOpenArticle: (id: string, isRead: boolean) => void | Promise<void>;
		onDelete: (id: string) => void;
		availableTags?: Tag[];
	}) => {
		articleCardMock(props);
		return (
			<button type="button" onClick={() => props.onDelete(props.article.id)}>
				desktop:{props.article.id}:{String(props.selected)}
			</button>
		);
	},
}));

vi.mock("#/components/articles/article-card-mobile", () => ({
	ArticleCardMobile: (props: {
		article: ArticleWithTags;
		selected: boolean;
		onOpenArticle: (id: string, isRead: boolean) => void | Promise<void>;
		onDelete: (id: string) => void;
		availableTags?: Tag[];
	}) => {
		articleCardMobileMock(props);
		return (
			<button type="button" onClick={() => props.onDelete(props.article.id)}>
				mobile:{props.article.id}:{String(props.selected)}
			</button>
		);
	},
}));

const availableTags: Tag[] = [{ id: "t1", name: "Design", color: null }];

function buildArticle(
	id: string,
	overrides: Partial<ArticleWithTags> = {},
): ArticleWithTags {
	return {
		id,
		url: `https://example.com/${id}`,
		title: `Article ${id}`,
		description: "Description",
		hostname: "example.com",
		faviconUrl: null,
		isRead: false,
		isFavorite: false,
		createdAt: new Date("2024-01-01T00:00:00.000Z"),
		tags: [],
		...overrides,
	};
}

describe("ArticleList", () => {
	beforeEach(() => {
		articleCardMock.mockClear();
		articleCardMobileMock.mockClear();
		useIsMobileMock.mockReturnValue(false);
	});

	it("returns null when there are no articles", () => {
		const { container } = renderWithProviders(
			<ArticleList
				articles={[]}
				selected={new Set()}
				onSelect={vi.fn()}
				onOpenArticle={vi.fn()}
				onToggleRead={vi.fn()}
				onToggleFavorite={vi.fn()}
				onDelete={vi.fn()}
			/>,
		);

		expect(container).toBeEmptyDOMElement();
		expect(articleCardMock).not.toHaveBeenCalled();
		expect(articleCardMobileMock).not.toHaveBeenCalled();
	});

	it("renders desktop cards and adapts delete callbacks to array payloads", async () => {
		const user = userEvent.setup();
		const onDelete = vi.fn();

		renderWithProviders(
			<ArticleList
				articles={[buildArticle("a1"), buildArticle("a2")]}
				selected={new Set(["a2"])}
				onSelect={vi.fn()}
				onOpenArticle={vi.fn()}
				onToggleRead={vi.fn()}
				onToggleFavorite={vi.fn()}
				onDelete={onDelete}
				availableTags={availableTags}
				onAddTag={vi.fn()}
				onRemoveTag={vi.fn()}
				onCreateTag={vi.fn().mockResolvedValue(availableTags[0])}
			/>,
		);

		expect(
			screen.getByRole("button", { name: "desktop:a1:false" }),
		).toBeVisible();
		expect(
			screen.getByRole("button", { name: "desktop:a2:true" }),
		).toBeVisible();
		expect(articleCardMock).toHaveBeenCalledTimes(2);
		expect(articleCardMock.mock.calls[1]?.[0]).toEqual(
			expect.objectContaining({
				selected: true,
				availableTags,
				article: expect.objectContaining({ id: "a2" }),
			}),
		);
		expect(articleCardMobileMock).not.toHaveBeenCalled();

		await user.click(screen.getByRole("button", { name: "desktop:a1:false" }));
		expect(onDelete).toHaveBeenCalledWith(["a1"]);
	});

	it("renders mobile cards when the viewport is mobile", () => {
		useIsMobileMock.mockReturnValue(true);

		renderWithProviders(
			<ArticleList
				articles={[buildArticle("a1")]}
				selected={new Set(["a1"])}
				onSelect={vi.fn()}
				onOpenArticle={vi.fn()}
				onToggleRead={vi.fn()}
				onToggleFavorite={vi.fn()}
				onDelete={vi.fn()}
			/>,
		);

		expect(
			screen.getByRole("button", { name: "mobile:a1:true" }),
		).toBeVisible();
		expect(articleCardMobileMock).toHaveBeenCalledTimes(1);
		expect(articleCardMock).not.toHaveBeenCalled();
	});
});
