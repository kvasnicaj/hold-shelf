import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ArchiveTableMobile } from "#/components/archive/archive-table-mobile";
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
		title: "Archived article",
		description: "Description",
		hostname: "example.com",
		faviconUrl: "https://example.com/favicon.ico",
		isRead: false,
		isFavorite: false,
		createdAt: new Date("2024-01-01T00:00:00.000Z"),
		tags: [{ id: "t1", name: "Design", color: null }],
		...overrides,
	};
}

describe("ArchiveTableMobile", () => {
	it("renders the compact mobile layout with title, controls, hostname, and side tags", () => {
		const { container } = renderWithProviders(
			<ArchiveTableMobile
				articles={[buildArticle()]}
				rowSelection={{}}
				onRowSelectionChange={vi.fn()}
				availableTags={availableTags}
				onAddTag={vi.fn().mockResolvedValue(undefined)}
				onRemoveTag={vi.fn().mockResolvedValue(undefined)}
				onCreateTag={vi.fn().mockResolvedValue(availableTags[0])}
				onOpenArticle={vi.fn().mockResolvedValue(undefined)}
				onToggleRead={vi.fn().mockResolvedValue(undefined)}
				onToggleFavorite={vi.fn().mockResolvedValue(undefined)}
				onDelete={vi.fn().mockResolvedValue(undefined)}
			/>,
		);

		expect(screen.getByText("Archived article")).toBeInTheDocument();
		expect(screen.getByText("example.com")).toBeInTheDocument();
		expect(screen.getByLabelText("Unread")).toBeInTheDocument();
		expect(container.querySelector("img")).toBeNull();
		expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
		expect(screen.getAllByText("Design")).not.toHaveLength(0);
		expect(
			screen.getByRole("button", {
				name: /article actions for archived article/i,
			}),
		).toBeInTheDocument();
	});

	it("forwards row selection and archive actions from the dropdown", async () => {
		const user = userEvent.setup();
		const onRowSelectionChange = vi.fn();
		const onToggleRead = vi.fn().mockResolvedValue(undefined);
		const onToggleFavorite = vi.fn().mockResolvedValue(undefined);
		const onDelete = vi.fn().mockResolvedValue(undefined);

		renderWithProviders(
			<ArchiveTableMobile
				articles={[buildArticle({ tags: [] })]}
				rowSelection={{}}
				onRowSelectionChange={onRowSelectionChange}
				availableTags={availableTags}
				onAddTag={vi.fn().mockResolvedValue(undefined)}
				onRemoveTag={vi.fn().mockResolvedValue(undefined)}
				onCreateTag={vi.fn().mockResolvedValue(availableTags[0])}
				onOpenArticle={vi.fn().mockResolvedValue(undefined)}
				onToggleRead={onToggleRead}
				onToggleFavorite={onToggleFavorite}
				onDelete={onDelete}
			/>,
		);

		await user.click(
			screen.getByRole("button", {
				name: /article actions for archived article/i,
			}),
		);
		await user.click(screen.getByRole("menuitem", { name: /select article/i }));
		expect(onRowSelectionChange).toHaveBeenCalled();

		await user.click(
			screen.getByRole("button", {
				name: /article actions for archived article/i,
			}),
		);
		await user.click(screen.getByRole("menuitem", { name: /mark read/i }));
		expect(onToggleRead).toHaveBeenCalledWith("a1", true);

		await user.click(
			screen.getByRole("button", {
				name: /article actions for archived article/i,
			}),
		);
		await user.click(
			screen.getByRole("menuitem", { name: /add to favorites/i }),
		);
		expect(onToggleFavorite).toHaveBeenCalledWith("a1", true);

		await user.click(
			screen.getByRole("button", {
				name: /article actions for archived article/i,
			}),
		);
		await user.click(screen.getByRole("menuitem", { name: /^delete$/i }));
		expect(onDelete).toHaveBeenCalledWith(["a1"]);
	});

	it("shows the checkbox when bulk selection mode is active", () => {
		renderWithProviders(
			<ArchiveTableMobile
				articles={[buildArticle({ tags: [] })]}
				rowSelection={{ a1: true }}
				onRowSelectionChange={vi.fn()}
				availableTags={availableTags}
				onAddTag={vi.fn().mockResolvedValue(undefined)}
				onRemoveTag={vi.fn().mockResolvedValue(undefined)}
				onCreateTag={vi.fn().mockResolvedValue(availableTags[0])}
				onOpenArticle={vi.fn().mockResolvedValue(undefined)}
				onToggleRead={vi.fn().mockResolvedValue(undefined)}
				onToggleFavorite={vi.fn().mockResolvedValue(undefined)}
				onDelete={vi.fn().mockResolvedValue(undefined)}
			/>,
		);

		expect(screen.getByRole("checkbox")).toBeInTheDocument();
	});

	it("shows a read indicator for read articles", () => {
		renderWithProviders(
			<ArchiveTableMobile
				articles={[buildArticle({ isRead: true, tags: [] })]}
				rowSelection={{}}
				onRowSelectionChange={vi.fn()}
				availableTags={availableTags}
				onAddTag={vi.fn().mockResolvedValue(undefined)}
				onRemoveTag={vi.fn().mockResolvedValue(undefined)}
				onCreateTag={vi.fn().mockResolvedValue(availableTags[0])}
				onOpenArticle={vi.fn().mockResolvedValue(undefined)}
				onToggleRead={vi.fn().mockResolvedValue(undefined)}
				onToggleFavorite={vi.fn().mockResolvedValue(undefined)}
				onDelete={vi.fn().mockResolvedValue(undefined)}
			/>,
		);

		expect(screen.getByLabelText("Read")).toBeInTheDocument();
	});
});
