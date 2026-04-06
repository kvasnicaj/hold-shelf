import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ArchivePage } from "#/components/archive/archive-page";
import type { ArticleWithTags } from "#/components/articles/types";
import { renderWithProviders } from "#/test/render";

const {
	routeState,
	navigateMock,
	routerInvalidateMock,
	createArticleMock,
	deleteArticlesMock,
	getArticlesMock,
	updateArticleMock,
	getTagsMock,
	addTagToArticlesMock,
	removeTagFromArticlesMock,
	createTagMock,
} = vi.hoisted(() => ({
	routeState: {
		loaderData: {
			articles: { items: [] as ArticleWithTags[], total: 0 },
			tags: [{ id: "t1", name: "Design", color: null, articleCount: 1 }],
		},
		search: {},
	},
	navigateMock: vi.fn(),
	routerInvalidateMock: vi.fn(),
	createArticleMock: vi.fn(),
	deleteArticlesMock: vi.fn(),
	getArticlesMock: vi.fn(),
	updateArticleMock: vi.fn(),
	getTagsMock: vi.fn(),
	addTagToArticlesMock: vi.fn(),
	removeTagFromArticlesMock: vi.fn(),
	createTagMock: vi.fn(),
}));

vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);

	return {
		...actual,
		getRouteApi: () => ({
			useLoaderData: () => routeState.loaderData,
			useSearch: () => routeState.search,
		}),
		useNavigate: () => navigateMock,
		useRouter: () => ({
			invalidate: routerInvalidateMock,
		}),
	};
});

vi.mock("#/server/articles", () => ({
	createArticle: createArticleMock,
	deleteArticles: deleteArticlesMock,
	getArticles: getArticlesMock,
	updateArticle: updateArticleMock,
}));

vi.mock("#/server/tags", () => ({
	addTagToArticles: addTagToArticlesMock,
	createTag: createTagMock,
	getTags: getTagsMock,
	removeTagFromArticles: removeTagFromArticlesMock,
}));

vi.mock("#/components/archive/archive-toolbar-actions", () => ({
	ArchiveToolbarActions: ({
		onAdd,
	}: {
		onAdd: (url: string) => Promise<void>;
	}) => (
		<button type="button" onClick={() => void onAdd("https://example.com/new")}>
			Mock add article
		</button>
	),
}));

vi.mock("#/components/archive/archive-table", () => ({
	ArchiveTable: ({
		articles,
		onDelete,
		onToggleRead,
		onRowSelectionChange,
	}: {
		articles: Array<{ id: string; title: string | null; isRead: boolean }>;
		onDelete: (ids: string[]) => void;
		onToggleRead: (id: string, isRead: boolean) => void;
		onRowSelectionChange: (value: Record<string, boolean>) => void;
	}) => (
		<div>
			{articles.map((article) => (
				<div key={article.id}>
					<span>{article.title}</span>
					<button
						type="button"
						onClick={() => onRowSelectionChange({ [article.id]: true })}
					>{`select-${article.id}`}</button>
					<button
						type="button"
						onClick={() => onToggleRead(article.id, !article.isRead)}
					>{`toggle-${article.id}`}</button>
					<button
						type="button"
						onClick={() => onDelete([article.id])}
					>{`delete-${article.id}`}</button>
				</div>
			))}
		</div>
	),
}));

vi.mock("#/components/articles/bulk-actions-panel", () => ({
	BulkActionsPanel: ({
		count,
		onMarkRead,
		onClear,
	}: {
		count: number;
		onMarkRead: () => void;
		onClear: () => void;
	}) => (
		<div>
			<span>{count} selected</span>
			<button type="button" onClick={onMarkRead}>
				bulk-read
			</button>
			<button type="button" onClick={onClear}>
				clear-selection
			</button>
		</div>
	),
}));

vi.mock("#/components/ui/native-select", () => ({
	NativeSelect: ({ children, ...props }: React.ComponentProps<"select">) => (
		<select {...props}>{children}</select>
	),
}));

const articleFixtures = [
	{
		id: "a1",
		url: "https://example.com/a1",
		title: "Archived article",
		description: null,
		hostname: "example.com",
		faviconUrl: null,
		isRead: true,
		isFavorite: false,
		createdAt: new Date("2024-01-01T00:00:00.000Z"),
		tags: [],
	},
];

describe("ArchivePage", () => {
	beforeEach(() => {
		routeState.loaderData = {
			articles: { items: articleFixtures, total: 25 },
			tags: [{ id: "t1", name: "Design", color: null, articleCount: 1 }],
		};
		routeState.search = { page: 2, tag: "t1" };
		navigateMock.mockReset();
		routerInvalidateMock.mockReset();
		createArticleMock.mockReset().mockResolvedValue({});
		deleteArticlesMock.mockReset().mockResolvedValue({});
		getArticlesMock
			.mockReset()
			.mockResolvedValue(routeState.loaderData.articles);
		updateArticleMock.mockReset().mockResolvedValue({});
		getTagsMock.mockReset().mockResolvedValue(routeState.loaderData.tags);
		addTagToArticlesMock.mockReset().mockResolvedValue({});
		removeTagFromArticlesMock.mockReset().mockResolvedValue({});
		createTagMock.mockReset().mockResolvedValue({
			id: "t2",
			name: "Research",
			color: null,
		});
	});

	it("updates filters and clears the active tag filter through navigation", async () => {
		const user = userEvent.setup();
		renderWithProviders(<ArchivePage />);

		const selects = screen.getAllByRole("combobox");
		const [tagSelect, filterSelect, sortSelect] = selects;
		if (!tagSelect || !filterSelect || !sortSelect) {
			throw new Error("Expected archive filter selects");
		}

		fireEvent.change(tagSelect, { target: { value: "" } });
		fireEvent.change(filterSelect, { target: { value: "unread" } });
		fireEvent.change(sortSelect, { target: { value: "title" } });
		await user.click(screen.getByRole("button", { name: /clear tag filter/i }));

		expect(navigateMock).toHaveBeenCalledTimes(4);
	});

	it("reveals bulk actions and runs archive mutations", async () => {
		const user = userEvent.setup();
		const { queryClient } = renderWithProviders(<ArchivePage />);
		const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

		await user.click(screen.getByRole("button", { name: /mock add article/i }));
		await waitFor(() =>
			expect(createArticleMock).toHaveBeenCalledWith({
				data: { url: "https://example.com/new" },
			}),
		);

		await user.click(screen.getByRole("button", { name: "select-a1" }));
		expect(screen.getByText("1 selected")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "bulk-read" }));
		await waitFor(() =>
			expect(updateArticleMock).toHaveBeenCalledWith({
				data: { id: "a1", isRead: true },
			}),
		);

		await user.click(screen.getByRole("button", { name: "toggle-a1" }));
		await waitFor(() =>
			expect(updateArticleMock).toHaveBeenCalledWith({
				data: { id: "a1", isRead: false },
			}),
		);

		await user.click(screen.getByRole("button", { name: "delete-a1" }));
		await waitFor(() =>
			expect(deleteArticlesMock).toHaveBeenCalledWith({
				data: { ids: ["a1"] },
			}),
		);

		expect(invalidateQueriesSpy).toHaveBeenCalledWith({
			queryKey: ["articles"],
		});
		expect(routerInvalidateMock).toHaveBeenCalled();
	});

	it("renders numeric pagination and keeps the current page inactive", async () => {
		const user = userEvent.setup();
		renderWithProviders(<ArchivePage />);

		expect(
			screen.getByRole("link", { name: /go to page 1/i }),
		).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /go to page 2/i })).toHaveAttribute(
			"aria-current",
			"page",
		);
		expect(
			screen.getByRole("link", { name: /go to previous page/i }),
		).toHaveAttribute("aria-disabled", "false");

		await user.click(screen.getByRole("link", { name: /go to page 2/i }));

		expect(navigateMock).not.toHaveBeenCalled();
	});

	it("removes the page param when going back from page two", async () => {
		const user = userEvent.setup();
		renderWithProviders(<ArchivePage />);

		await user.click(
			screen.getByRole("link", { name: /go to previous page/i }),
		);

		expect(navigateMock).toHaveBeenCalledTimes(1);
		const latestNavigateCall = navigateMock.mock.calls.at(-1);
		expect(latestNavigateCall?.[0]?.replace).toBe(true);
		expect(latestNavigateCall?.[0]?.search).toEqual(expect.any(Function));
		expect(
			latestNavigateCall?.[0]?.search({
				q: "query",
				filter: "read",
				sort: "title",
				tag: "t1",
				page: 2,
			}),
		).toEqual({
			q: "query",
			filter: "read",
			sort: "title",
			tag: "t1",
			page: undefined,
		});
	});
});
