import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ArticleCardMobile } from "#/components/articles/article-card-mobile";
import type { ArticleWithTags } from "#/components/articles/types";
import type { Tag } from "#/components/tags/types";
import { renderWithProviders } from "#/test/render";

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
		faviconUrl: "https://example.com/favicon.ico",
		isRead: false,
		isFavorite: false,
		createdAt: new Date("2024-01-01T00:00:00.000Z"),
		tags: [{ id: "t1", name: "Design", color: null }],
		...overrides,
	};
}

describe("ArticleCardMobile", () => {
	it("shows title, site and tags with one labeled actions menu instead of a row of icons", () => {
		const { container } = renderWithProviders(
			<ArticleCardMobile
				article={buildArticle()}
				selected={false}
				onSelect={vi.fn()}
				onOpenArticle={vi.fn()}
				onToggleRead={vi.fn()}
				onToggleFavorite={vi.fn()}
				onDelete={vi.fn()}
				availableTags={availableTags}
				onAddTag={vi.fn()}
				onRemoveTag={vi.fn()}
				onCreateTag={vi.fn().mockResolvedValue(availableTags[0])}
			/>,
		);

		expect(screen.getByText("Design systems")).toBeInTheDocument();
		expect(screen.queryByText("A useful article")).not.toBeInTheDocument();
		expect(container.querySelector("img")).toBeNull();
		expect(screen.getByRole("img", { name: "Unread" })).toBeInTheDocument();
		expect(screen.getByText("example.com")).toBeInTheDocument();
		expect(screen.getByText("Design")).toBeInTheDocument();
		expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "More actions for Design systems" }),
		).toBeInTheDocument();
		expect(screen.queryByTitle("Add to favorites")).not.toBeInTheDocument();
	});

	it("forwards read, favorite, trash and select from the labeled menu", async () => {
		const user = userEvent.setup();
		const onSelect = vi.fn();
		const onToggleRead = vi.fn();
		const onToggleFavorite = vi.fn();
		const onDelete = vi.fn();
		const onOpenArticle = vi.fn();

		renderWithProviders(
			<ArticleCardMobile
				article={buildArticle({ tags: [] })}
				selected={false}
				onSelect={onSelect}
				onOpenArticle={onOpenArticle}
				onToggleRead={onToggleRead}
				onToggleFavorite={onToggleFavorite}
				onDelete={onDelete}
			/>,
		);
		const menu = () =>
			user.click(
				screen.getByRole("button", { name: "More actions for Design systems" }),
			);

		await menu();
		await user.click(screen.getByRole("menuitem", { name: "Mark as read" }));
		expect(onToggleRead).toHaveBeenCalledWith("a1", true);

		await menu();
		await user.click(
			screen.getByRole("menuitem", { name: "Add to favorites" }),
		);
		expect(onToggleFavorite).toHaveBeenCalledWith("a1", true);

		await menu();
		await user.click(screen.getByRole("menuitem", { name: "Move to Trash" }));
		expect(onDelete).toHaveBeenCalledWith("a1");

		await menu();
		await user.click(screen.getByRole("menuitem", { name: "Select" }));
		expect(onSelect).toHaveBeenCalledWith("a1", true);
		expect(onOpenArticle).not.toHaveBeenCalled();
	});

	it("toggles selection instead of opening the article while selecting", async () => {
		const user = userEvent.setup();
		const onSelect = vi.fn();
		const onOpenArticle = vi.fn();

		renderWithProviders(
			<ArticleCardMobile
				article={buildArticle({ tags: [] })}
				selected
				selectionMode
				onSelect={onSelect}
				onOpenArticle={onOpenArticle}
				onToggleRead={vi.fn()}
				onToggleFavorite={vi.fn()}
				onDelete={vi.fn()}
			/>,
		);

		expect(
			screen.getByRole("checkbox", { name: "Select Design systems" }),
		).toBeChecked();
		await user.click(screen.getByText("Design systems"));
		expect(onSelect).toHaveBeenCalledWith("a1", false);
		expect(onOpenArticle).not.toHaveBeenCalled();
	});
});
