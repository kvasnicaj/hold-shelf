import { QueryClientProvider } from "@tanstack/react-query";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ArchiveTable } from "#/components/archive/archive-table";
import type { ArticleWithTags } from "#/components/articles/types";
import { renderWithProviders } from "#/test/render";

const { mobile } = vi.hoisted(() => ({ mobile: { value: false } }));
vi.mock("#/hooks/use-mobile", () => ({ useIsMobile: () => mobile.value }));

const tags = [
	{ id: "t1", name: "Design", color: null },
	{ id: "t2", name: "Engineering", color: null },
];
const article: ArticleWithTags = {
	id: "a1",
	title: "Article",
	url: "https://example.com",
	description: null,
	hostname: "example.com",
	faviconUrl: null,
	isRead: false,
	isFavorite: true,
	createdAt: null,
	tags: [tags[0]],
};

describe("Library article tags", () => {
	it.each([false, true])(
		"keeps the editor open after selection, creation, and query refreshes (mobile: %s)",
		async (isMobile) => {
			mobile.value = isMobile;
			const user = userEvent.setup();
			const onAddTag = vi.fn().mockResolvedValue(undefined);
			const onOpenArticle = vi.fn();
			const created = { id: "t3", name: "Research", color: null };
			const props = {
				articles: [article],
				availableTags: tags,
				rowSelection: {},
				onRowSelectionChange: vi.fn(),
				onAddTag,
				onRemoveTag: vi.fn(),
				onCreateTag: vi.fn().mockResolvedValue(created),
				onOpenArticle,
				onToggleRead: vi.fn(),
				onToggleFavorite: vi.fn(),
				onDelete: vi.fn(),
			};
			const { rerender, queryClient } = renderWithProviders(
				<ArchiveTable {...props} />,
			);
			await user.click(screen.getByRole("button", { name: "Manage tags" }));
			expect(screen.getByRole("checkbox", { name: "Design" })).toBeChecked();
			expect(
				screen.getByRole("checkbox", { name: "Engineering" }),
			).not.toBeChecked();
			await user.click(screen.getByRole("checkbox", { name: "Engineering" }));
			expect(onAddTag).toHaveBeenCalledWith("t2", ["a1"]);
			const refreshed = {
				...props,
				articles: [{ ...article, tags }],
				onAddTag: vi.fn().mockResolvedValue(undefined),
				onOpenArticle: vi.fn(),
			};
			rerender(
				<QueryClientProvider client={queryClient}>
					<ArchiveTable {...refreshed} />
				</QueryClientProvider>,
			);
			expect(
				screen.getByRole("checkbox", { name: "Engineering" }),
			).toBeChecked();
			expect(screen.getByText("2 selected")).toBeInTheDocument();
			await user.type(
				screen.getByRole("textbox", { name: "Search or create tag" }),
				"Research",
			);
			await user.click(
				screen.getByRole("button", { name: 'Create "Research"' }),
			);
			expect(refreshed.onAddTag).toHaveBeenCalledWith("t3", ["a1"]);
			rerender(
				<QueryClientProvider client={queryClient}>
					<ArchiveTable
						{...refreshed}
						availableTags={[...tags, created]}
						articles={[{ ...article, tags: [...tags, created] }]}
					/>
				</QueryClientProvider>,
			);
			expect(screen.getByRole("checkbox", { name: "Research" })).toBeChecked();
			expect(screen.getByText("3 selected")).toBeInTheDocument();
			expect(onOpenArticle).not.toHaveBeenCalled();
			expect(refreshed.onOpenArticle).not.toHaveBeenCalled();
			await user.click(screen.getByRole("button", { name: "Done" }));
			expect(
				screen.queryByRole("textbox", { name: "Search or create tag" }),
			).not.toBeInTheDocument();
			await user.click(screen.getByRole("button", { name: "Manage tags" }));
			await user.keyboard("{Escape}");
			expect(
				screen.queryByRole("textbox", { name: "Search or create tag" }),
			).not.toBeInTheDocument();
		},
	);
});
