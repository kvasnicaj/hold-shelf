import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ArticleCard } from "#/components/articles/article-card";
import type { ArticleWithTags } from "#/components/articles/types";
import type { Tag } from "#/components/tags/types";
import { renderWithProviders } from "#/test/render";

vi.mock("#/components/tags/tag-picker", () => ({
	TagPicker: ({ selectedTagIds }: { selectedTagIds: string[] }) => (
		<div data-testid="tag-picker">{selectedTagIds.join(",")}</div>
	),
}));

const availableTags: Tag[] = [{ id: "t1", name: "Design", color: null }];

function buildArticle(
	overrides: Partial<ArticleWithTags> = {},
): ArticleWithTags {
	return {
		id: "a1",
		url: "https://example.com/article",
		title: "Design systems",
		description: "A useful article",
		hostname: "example.com",
		faviconUrl: null,
		isRead: false,
		isFavorite: false,
		createdAt: new Date("2024-01-01T00:00:00.000Z"),
		tags: [{ id: "t1", name: "Design", color: null }],
		...overrides,
	};
}

describe("ArticleCard", () => {
	it("renders article metadata, tags, and the tag picker when tag actions are available", () => {
		renderWithProviders(
			<ArticleCard
				article={buildArticle()}
				selected={false}
				onSelect={vi.fn()}
				onToggleRead={vi.fn()}
				onDelete={vi.fn()}
				availableTags={availableTags}
				onAddTag={vi.fn()}
				onRemoveTag={vi.fn()}
				onCreateTag={vi.fn().mockResolvedValue(availableTags[0])}
			/>,
		);

		expect(screen.getByText("Design systems")).toBeInTheDocument();
		expect(screen.getByText("A useful article")).toBeInTheDocument();
		expect(screen.getAllByText("Design")).not.toHaveLength(0);
		expect(screen.getByTestId("tag-picker")).toHaveTextContent("t1");
	});

	it("falls back to the article URL and forwards select, read, and delete actions", async () => {
		const user = userEvent.setup();
		const onSelect = vi.fn();
		const onToggleRead = vi.fn();
		const onDelete = vi.fn();

		renderWithProviders(
			<ArticleCard
				article={buildArticle({
					title: null,
					hostname: null,
					tags: [],
				})}
				selected={true}
				onSelect={onSelect}
				onToggleRead={onToggleRead}
				onDelete={onDelete}
			/>,
		);

		expect(
			screen.getByRole("link", { name: "https://example.com/article" }),
		).toBeInTheDocument();

		await user.click(screen.getByRole("checkbox"));
		expect(onSelect).toHaveBeenCalledWith("a1", false);

		await user.click(screen.getByTitle("Mark as read"));
		expect(onToggleRead).toHaveBeenCalledWith("a1", true);

		await user.click(screen.getByTitle("Delete"));
		expect(onDelete).toHaveBeenCalledWith("a1");
	});
});
