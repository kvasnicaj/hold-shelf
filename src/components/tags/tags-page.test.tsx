import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ArticleWithTags } from "#/components/articles/types";
import { TagsPage } from "#/components/tags/tags-page";
import { renderWithProviders } from "#/test/render";

const {
	routeState,
	mobileState,
	navigateMock,
	routerInvalidateMock,
	deleteArticlesMock,
	getArticlesMock,
	updateArticleMock,
	addTagToArticlesMock,
	createTagMock,
	deleteTagMock,
	getTagsMock,
	removeTagFromArticlesMock,
	updateTagMock,
} = vi.hoisted(() => ({
	routeState: {
		loaderData: {
			tags: [
				{ id: "t1", name: "Design", color: null, articleCount: 2 },
				{ id: "t2", name: "Research", color: null, articleCount: 1 },
			],
			articles: null as { items: ArticleWithTags[]; total: number } | null,
		},
		search: {},
	},
	mobileState: { value: false },
	navigateMock: vi.fn(),
	routerInvalidateMock: vi.fn(),
	deleteArticlesMock: vi.fn(),
	getArticlesMock: vi.fn(),
	updateArticleMock: vi.fn(),
	addTagToArticlesMock: vi.fn(),
	createTagMock: vi.fn(),
	deleteTagMock: vi.fn(),
	getTagsMock: vi.fn(),
	removeTagFromArticlesMock: vi.fn(),
	updateTagMock: vi.fn(),
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
	deleteArticles: deleteArticlesMock,
	getArticles: getArticlesMock,
	updateArticle: updateArticleMock,
}));

vi.mock("#/server/tags", () => ({
	addTagToArticles: addTagToArticlesMock,
	createTag: createTagMock,
	deleteTag: deleteTagMock,
	getTags: getTagsMock,
	removeTagFromArticles: removeTagFromArticlesMock,
	updateTag: updateTagMock,
}));

vi.mock("#/components/articles/use-auto-mark-read-on-open", () => ({
	useAutoMarkReadOnOpen: () => ({
		markReadOnOpen: true,
		handleOpenArticle: vi.fn().mockResolvedValue(undefined),
	}),
}));

vi.mock("#/components/layout/toolbar-actions", () => ({
	ToolbarSlot: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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

vi.mock("#/hooks/use-mobile", () => ({
	useIsMobile: () => mobileState.value,
}));

const articleFixtures = [
	{
		id: "a1",
		url: "https://example.com/a1",
		title: "Article one",
		description: null,
		hostname: "example.com",
		faviconUrl: null,
		isRead: false,
		isFavorite: false,
		createdAt: new Date("2024-01-01T00:00:00.000Z"),
		tags: [],
	},
];

describe("TagsPage", () => {
	beforeEach(() => {
		routeState.loaderData = {
			tags: [
				{ id: "t1", name: "Design", color: null, articleCount: 2 },
				{ id: "t2", name: "Research", color: null, articleCount: 1 },
			],
			articles: null,
		};
		routeState.search = {};
		mobileState.value = false;
		navigateMock.mockReset();
		routerInvalidateMock.mockReset();
		deleteArticlesMock.mockReset().mockResolvedValue({});
		getArticlesMock
			.mockReset()
			.mockResolvedValue({ items: articleFixtures, total: 1 });
		updateArticleMock.mockReset().mockResolvedValue({});
		addTagToArticlesMock.mockReset().mockResolvedValue({});
		createTagMock.mockReset().mockResolvedValue({
			id: "t3",
			name: "Testing",
			color: null,
		});
		deleteTagMock.mockReset().mockResolvedValue({});
		getTagsMock.mockReset().mockResolvedValue(routeState.loaderData.tags);
		removeTagFromArticlesMock.mockReset().mockResolvedValue({});
		updateTagMock.mockReset().mockResolvedValue({});
	});

	it("renders the list view, filters tags, and supports rename and delete actions", async () => {
		const user = userEvent.setup();
		mobileState.value = true;
		renderWithProviders(<TagsPage />);

		expect(screen.getByText("Design")).toBeInTheDocument();
		expect(screen.getByText("Research")).toBeInTheDocument();

		await user.type(screen.getByLabelText("Search tags"), "res");
		expect(screen.queryByText("Design")).not.toBeInTheDocument();
		expect(screen.getByText("Research")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: /rename research/i }));
		const input = screen.getByDisplayValue("Research");
		await user.clear(input);
		await user.type(input, "Knowledge");
		await user.tab();
		await waitFor(() =>
			expect(updateTagMock).toHaveBeenCalledWith({
				data: { id: "t2", name: "Knowledge" },
			}),
		);

		await user.click(screen.getByRole("button", { name: /delete research/i }));
		await waitFor(() =>
			expect(deleteTagMock).toHaveBeenCalledWith({
				data: { id: "t2" },
			}),
		);
	});

	it("shows a desktop handoff state because tags live in the sidebar", () => {
		renderWithProviders(<TagsPage />);

		expect(
			screen.getByText("Select a tag from the sidebar"),
		).toBeInTheDocument();
		expect(screen.queryByLabelText("Search tags")).not.toBeInTheDocument();
	});

	it("renders the selected tag article view and article actions", async () => {
		const user = userEvent.setup();
		routeState.search = { tag: "t1", page: 1 };
		routeState.loaderData.articles = { items: articleFixtures, total: 25 };
		getArticlesMock.mockResolvedValue(routeState.loaderData.articles);

		const { queryClient } = renderWithProviders(<TagsPage />);
		const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

		expect(screen.getByText("Article one")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /go to page 1/i })).toHaveAttribute(
			"aria-current",
			"page",
		);
		expect(
			screen.getByRole("link", { name: /go to page 2/i }),
		).toBeInTheDocument();
		expect(screen.getByText("Design")).toBeInTheDocument();
		expect(
			screen.getByLabelText("Search tagged articles..."),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /rename design/i }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /delete design/i }),
		).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /back to tags/i }),
		).not.toBeInTheDocument();

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
		expect(routerInvalidateMock).toHaveBeenCalled();
	});

	it("increments the page when using the next control in a selected tag view", async () => {
		const user = userEvent.setup();
		routeState.search = { tag: "t1", page: 1 };
		routeState.loaderData.articles = { items: articleFixtures, total: 25 };
		getArticlesMock.mockResolvedValue(routeState.loaderData.articles);

		renderWithProviders(<TagsPage />);

		await user.click(screen.getByRole("link", { name: /go to next page/i }));

		expect(navigateMock).toHaveBeenCalledTimes(1);
		const latestNavigateCall = navigateMock.mock.calls.at(-1);
		expect(latestNavigateCall?.[0]?.replace).toBe(true);
		expect(latestNavigateCall?.[0]?.search).toEqual(expect.any(Function));
		expect(latestNavigateCall?.[0]?.search({ tag: "t1", page: 1 })).toEqual({
			tag: "t1",
			page: 2,
		});
	});

	it("shows the empty selected-tag state when no articles match", () => {
		routeState.search = { tag: "t1" };
		routeState.loaderData.articles = { items: [], total: 0 };
		getArticlesMock.mockResolvedValue(routeState.loaderData.articles);

		renderWithProviders(<TagsPage />);

		expect(screen.getByText("No articles with this tag.")).toBeInTheDocument();
	});

	it("keeps the one-panel flow on mobile", () => {
		mobileState.value = true;
		routeState.search = { tag: "t1" };
		routeState.loaderData.articles = { items: articleFixtures, total: 1 };
		getArticlesMock.mockResolvedValue(routeState.loaderData.articles);

		renderWithProviders(<TagsPage />);

		expect(
			screen.queryByRole("heading", { name: "Tags" }),
		).not.toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Design" })).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /back to tags/i }),
		).toBeInTheDocument();
	});
});
