import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ArchiveTable } from "#/components/archive/archive-table";
import type { ArticleWithTags } from "#/components/articles/types";
import type { Tag } from "#/components/tags/types";
import { renderWithProviders } from "#/test/render";

const { archiveTableMobileMock, useIsMobileMock } = vi.hoisted(() => ({
	archiveTableMobileMock: vi.fn(),
	useIsMobileMock: vi.fn(),
}));

vi.mock("#/components/archive/archive-table-mobile", () => ({
	ArchiveTableMobile: (props: {
		articles: ArticleWithTags[];
		onOpenArticle: (id: string, isRead: boolean) => Promise<void>;
	}) => {
		archiveTableMobileMock(props);
		return (
			<div data-testid="archive-table-mobile">
				mobile:{props.articles.length}
			</div>
		);
	},
}));

vi.mock("#/components/tags/tag-picker", () => ({
	TagPicker: ({ selectedTagIds }: { selectedTagIds: string[] }) => (
		<div data-testid="tag-picker">{selectedTagIds.join(",")}</div>
	),
}));

vi.mock("#/hooks/use-mobile", () => ({
	useIsMobile: useIsMobileMock,
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

function renderArchiveTable(
	props: Partial<React.ComponentProps<typeof ArchiveTable>> = {},
) {
	return renderWithProviders(
		<ArchiveTable
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
			{...props}
		/>,
	);
}

describe("ArchiveTable", () => {
	beforeEach(() => {
		archiveTableMobileMock.mockClear();
		useIsMobileMock.mockReturnValue(false);
	});

	it("renders the desktop table layout and forwards row actions", async () => {
		const user = userEvent.setup();
		const onRowSelectionChange = vi.fn();
		const onToggleRead = vi.fn().mockResolvedValue(undefined);
		const onDelete = vi.fn().mockResolvedValue(undefined);

		renderArchiveTable({
			onRowSelectionChange,
			onToggleRead,
			onDelete,
		});

		expect(screen.getByRole("table")).toBeInTheDocument();
		expect(
			screen.getByRole("columnheader", { name: "Title" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("columnheader", { name: "Tags" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: "Archived article" }),
		).toHaveAttribute("href", "https://example.com/article");
		expect(screen.getByText("example.com")).toBeInTheDocument();
		expect(screen.getByTestId("tag-picker")).toHaveTextContent("t1");
		expect(screen.getAllByRole("checkbox")).toHaveLength(2);

		await user.click(screen.getAllByRole("checkbox")[1]);
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
		await user.click(screen.getByRole("menuitem", { name: /^delete$/i }));
		expect(onDelete).toHaveBeenCalledWith(["a1"]);
		expect(archiveTableMobileMock).not.toHaveBeenCalled();
	});

	it("delegates to the mobile table when the viewport is mobile", () => {
		useIsMobileMock.mockReturnValue(true);

		renderArchiveTable({ rowSelection: { a1: true } });

		expect(screen.getByTestId("archive-table-mobile")).toHaveTextContent(
			"mobile:1",
		);
		expect(screen.queryByRole("table")).not.toBeInTheDocument();
		expect(archiveTableMobileMock.mock.calls[0]?.[0]).toEqual(
			expect.objectContaining({
				articles: [expect.objectContaining({ id: "a1" })],
				rowSelection: { a1: true },
				availableTags,
			}),
		);
	});
});
