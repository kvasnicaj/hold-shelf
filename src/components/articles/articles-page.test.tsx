import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ArticlesPage } from "#/components/articles/articles-page";
import type { ArticleWithTags } from "#/components/articles/types";
import type { Tag } from "#/components/tags/types";
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
			tags: [] as Tag[],
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

vi.mock("#/components/articles/add-article-dialog", () => ({
	AddArticleDialog: ({ onAdd }: { onAdd: (url: string) => Promise<void> }) => (
		<button
			type="button"
			onClick={() => void onAdd("https://example.com/added")}
		>
			Mock add article
		</button>
	),
}));

vi.mock("#/components/articles/article-list", () => ({
	ArticleList: ({
		articles,
		onDelete,
		onSelect,
		onToggleRead,
	}: {
		articles: Array<{ id: string; title: string | null; isRead: boolean }>;
		onDelete: (ids: string[]) => void;
		onSelect: (id: string, selected: boolean) => void;
		onToggleRead: (id: string, isRead: boolean) => void;
	}) => (
		<div>
			{articles.map((article) => (
				<div key={article.id}>
					<span>{article.title}</span>
					<button
						type="button"
						onClick={() => onSelect(article.id, true)}
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
	BulkActionsPanel: ({ count }: { count: number }) => (
		<div>{count} selected</div>
	),
}));

vi.mock("#/components/layout/toolbar-actions", () => ({
	ToolbarSlot: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	ToolbarSearch: ({ onSearch }: { onSearch: (value: string) => void }) => (
		<input
			aria-label="Search unread articles"
			onChange={(event) => onSearch(event.target.value)}
		/>
	),
}));

vi.mock("#/components/ui/native-select", () => ({
	NativeSelect: ({ children, ...props }: React.ComponentProps<"select">) => (
		<select {...props}>{children}</select>
	),
}));

const tagFixtures = [{ id: "t1", name: "Design", color: null }];
const articleFixtures = [
	{
		id: "a1",
		url: "https://example.com/a1",
		title: "Article one",
		description: "One",
		hostname: "example.com",
		faviconUrl: null,
		isRead: false,
		isFavorite: false,
		createdAt: new Date("2024-01-01T00:00:00.000Z"),
		tags: [],
	},
	{
		id: "a2",
		url: "https://example.com/a2",
		title: "Article two",
		description: "Two",
		hostname: "example.com",
		faviconUrl: null,
		isRead: true,
		isFavorite: false,
		createdAt: new Date("2024-01-02T00:00:00.000Z"),
		tags: [],
	},
];

describe("ArticlesPage", () => {
	beforeEach(() => {
		routeState.loaderData = {
			articles: { items: [], total: 0 },
			tags: tagFixtures,
		};
		routeState.search = {};
		navigateMock.mockReset();
		routerInvalidateMock.mockReset();
		createArticleMock.mockReset().mockResolvedValue({});
		deleteArticlesMock.mockReset().mockResolvedValue({});
		getArticlesMock
			.mockReset()
			.mockResolvedValue(routeState.loaderData.articles);
		updateArticleMock.mockReset().mockResolvedValue({});
		getTagsMock.mockReset().mockResolvedValue(tagFixtures);
		addTagToArticlesMock.mockReset().mockResolvedValue({});
		removeTagFromArticlesMock.mockReset().mockResolvedValue({});
		createTagMock.mockReset().mockResolvedValue({
			id: "t2",
			name: "Research",
			color: null,
		});
	});

	it("renders the empty state from loader data", () => {
		renderWithProviders(<ArticlesPage />);

		expect(screen.getByText("No unread articles yet.")).toBeInTheDocument();
	});

	it("renders article titles from initial data and updates search params for sorting", async () => {
		routeState.loaderData = {
			articles: { items: articleFixtures, total: 2 },
			tags: tagFixtures,
		};
		getArticlesMock.mockResolvedValue(routeState.loaderData.articles);

		renderWithProviders(<ArticlesPage />);

		expect(screen.getByText("Article one")).toBeInTheDocument();
		expect(screen.getByText("Article two")).toBeInTheDocument();

		fireEvent.change(screen.getByRole("combobox"), {
			target: { value: "title" },
		});

		expect(navigateMock).toHaveBeenCalled();
		const latestNavigateCall = navigateMock.mock.calls.at(-1);
		expect(latestNavigateCall?.[0]?.replace).toBe(true);
		expect(latestNavigateCall?.[0]?.search).toEqual(expect.any(Function));
	});

	it("reveals bulk actions after selecting an article", async () => {
		const user = userEvent.setup();
		routeState.loaderData = {
			articles: { items: articleFixtures, total: 2 },
			tags: tagFixtures,
		};
		getArticlesMock.mockResolvedValue(routeState.loaderData.articles);

		renderWithProviders(<ArticlesPage />);
		await user.click(screen.getByRole("button", { name: "select-a1" }));

		expect(screen.getByText("1 selected")).toBeInTheDocument();
	});

	it("runs add, toggle, and delete mutations and invalidates cached state", async () => {
		const user = userEvent.setup();
		routeState.loaderData = {
			articles: { items: articleFixtures, total: 2 },
			tags: tagFixtures,
		};
		getArticlesMock.mockResolvedValue(routeState.loaderData.articles);
		const { queryClient } = renderWithProviders(<ArticlesPage />);
		const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

		await user.click(screen.getByRole("button", { name: /mock add article/i }));
		await waitFor(() =>
			expect(createArticleMock).toHaveBeenCalledWith({
				data: { url: "https://example.com/added" },
			}),
		);

		await user.click(screen.getByRole("button", { name: "toggle-a1" }));
		await waitFor(() =>
			expect(updateArticleMock).toHaveBeenCalledWith({
				data: { id: "a1", isRead: true },
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
		expect(invalidateQueriesSpy).toHaveBeenCalledWith({
			queryKey: ["tags"],
		});
		expect(routerInvalidateMock).toHaveBeenCalled();
	});
});
