import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ArticleWithTags } from "#/components/articles/types";
import { TagArticlesView } from "#/components/tags/tag-articles-view";
import type { Tag } from "#/components/tags/types";
import { renderWithProviders } from "#/test/render";

const { articleListMock, paginationMock } = vi.hoisted(() => ({
	articleListMock: vi.fn(),
	paginationMock: vi.fn(),
}));

vi.mock("#/components/articles/article-list", () => ({
	ArticleList: (props: {
		articles: ArticleWithTags[];
		selected: Set<string>;
		onOpenArticle: (id: string, isRead: boolean) => void | Promise<void>;
		onDelete: (ids: string[]) => Promise<void>;
	}) => {
		articleListMock(props);
		return (
			<div data-testid="article-list">
				list:{props.articles.length}:{props.selected.size}
			</div>
		);
	},
}));

vi.mock("#/components/pagination/app-pagination", () => ({
	AppPagination: (props: {
		page: number;
		totalPages: number;
		onPageChange: (page: number) => void;
	}) => {
		paginationMock(props);
		return (
			<button type="button" onClick={() => props.onPageChange(3)}>
				pagination:{props.page}/{props.totalPages}
			</button>
		);
	},
}));

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

const availableTags: Tag[] = [{ id: "t1", name: "Design", color: null }];

describe("TagArticlesView", () => {
	beforeEach(() => {
		articleListMock.mockClear();
		paginationMock.mockClear();
	});

	it("renders the empty mobile state and supports the back action", async () => {
		const user = userEvent.setup();
		const onBack = vi.fn();

		renderWithProviders(
			<TagArticlesView
				activeTagName="Design"
				articles={[]}
				total={0}
				page={1}
				totalPages={1}
				selected={new Set()}
				availableTags={availableTags}
				onBack={onBack}
				onSelect={vi.fn()}
				onOpenArticle={vi.fn()}
				onToggleRead={vi.fn().mockResolvedValue(undefined)}
				onToggleFavorite={vi.fn().mockResolvedValue(undefined)}
				onDeleteArticles={vi.fn().mockResolvedValue(undefined)}
				onAddTag={vi.fn().mockResolvedValue(undefined)}
				onRemoveTag={vi.fn().mockResolvedValue(undefined)}
				onCreateTag={vi.fn().mockResolvedValue(availableTags[0])}
				onPageChange={vi.fn()}
			/>,
		);

		expect(screen.getByText("No articles with this tag.")).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Design" })).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: /back to tags/i }));
		expect(onBack).toHaveBeenCalledOnce();
		expect(articleListMock).not.toHaveBeenCalled();
		expect(paginationMock).not.toHaveBeenCalled();
	});

	it("renders article content and pagination when articles are present", async () => {
		const user = userEvent.setup();
		const onPageChange = vi.fn();
		const onDeleteArticles = vi.fn().mockResolvedValue(undefined);

		renderWithProviders(
			<TagArticlesView
				activeTagName="Engineering"
				articles={[buildArticle("a1"), buildArticle("a2")]}
				total={2}
				page={2}
				totalPages={4}
				selected={new Set(["a2"])}
				availableTags={availableTags}
				onBack={vi.fn()}
				onSelect={vi.fn()}
				onOpenArticle={vi.fn()}
				onToggleRead={vi.fn().mockResolvedValue(undefined)}
				onToggleFavorite={vi.fn().mockResolvedValue(undefined)}
				onDeleteArticles={onDeleteArticles}
				onAddTag={vi.fn().mockResolvedValue(undefined)}
				onRemoveTag={vi.fn().mockResolvedValue(undefined)}
				onCreateTag={vi.fn().mockResolvedValue(availableTags[0])}
				onPageChange={onPageChange}
				variant="desktop"
			/>,
		);

		expect(
			screen.getByRole("heading", { name: "Engineering" }),
		).toBeInTheDocument();
		expect(screen.getByText("2 articles")).toBeInTheDocument();
		expect(screen.getByTestId("article-list")).toHaveTextContent("list:2:1");
		expect(articleListMock.mock.calls[0]?.[0]).toEqual(
			expect.objectContaining({
				selected: new Set(["a2"]),
				onDelete: onDeleteArticles,
				availableTags,
			}),
		);

		await user.click(screen.getByRole("button", { name: "pagination:2/4" }));
		expect(onPageChange).toHaveBeenCalledWith(3);
	});

	it("hides the back button when requested", () => {
		renderWithProviders(
			<TagArticlesView
				activeTagName="Design"
				articles={[]}
				total={0}
				page={1}
				totalPages={1}
				selected={new Set()}
				availableTags={availableTags}
				onBack={vi.fn()}
				onSelect={vi.fn()}
				onOpenArticle={vi.fn()}
				onToggleRead={vi.fn().mockResolvedValue(undefined)}
				onToggleFavorite={vi.fn().mockResolvedValue(undefined)}
				onDeleteArticles={vi.fn().mockResolvedValue(undefined)}
				onAddTag={vi.fn().mockResolvedValue(undefined)}
				onRemoveTag={vi.fn().mockResolvedValue(undefined)}
				onCreateTag={vi.fn().mockResolvedValue(availableTags[0])}
				onPageChange={vi.fn()}
				showBackButton={false}
			/>,
		);

		expect(
			screen.queryByRole("button", { name: /back to tags/i }),
		).not.toBeInTheDocument();
	});
});
