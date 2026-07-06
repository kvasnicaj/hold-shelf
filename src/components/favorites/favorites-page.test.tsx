import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ArticleCollectionLoaderData } from "#/components/articles/types";
import { FavoritesPage } from "#/components/favorites/favorites-page";
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
			articles: { items: [], total: 0 },
			tags: [] as Tag[],
		} as ArticleCollectionLoaderData,
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

vi.mock("#/components/articles/use-auto-mark-read-on-open", () => ({
	useAutoMarkReadOnOpen: () => ({
		markReadOnOpen: true,
		handleOpenArticle: vi.fn().mockResolvedValue(undefined),
	}),
}));

vi.mock("#/components/articles/add-article-dialog", () => ({
	AddArticleDialog: ({ onAdd }: { onAdd: (url: string) => Promise<void> }) => (
		<button
			type="button"
			onClick={() => void onAdd("https://example.com/favorite")}
		>
			Mock add article
		</button>
	),
}));

vi.mock("#/components/articles/article-list", () => ({
	ArticleList: ({
		articles,
		onSelect,
		onToggleFavorite,
	}: {
		articles: Array<{ id: string; title: string | null; isFavorite: boolean }>;
		onSelect: (id: string, selected: boolean) => void;
		onToggleFavorite: (id: string, isFavorite: boolean) => void;
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
						onClick={() => onToggleFavorite(article.id, !article.isFavorite)}
					>{`favorite-${article.id}`}</button>
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

const tagFixtures = [{ id: "t1", name: "Design", color: null }];
const favoriteFixtures = [
	{
		id: "a1",
		url: "https://example.com/a1",
		title: "Favorite article",
		description: "One",
		hostname: "example.com",
		faviconUrl: null,
		isRead: false,
		isFavorite: true,
		createdAt: new Date("2024-01-01T00:00:00.000Z"),
		tags: [],
	},
];

describe("FavoritesPage", () => {
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

	it("renders the favorites empty state", () => {
		renderWithProviders(<FavoritesPage />);

		expect(screen.getByText("No favorite articles yet.")).toBeInTheDocument();
	});

	it("updates sorting and toggles favorite state", async () => {
		const user = userEvent.setup();
		routeState.loaderData = {
			articles: { items: favoriteFixtures, total: 1 },
			tags: tagFixtures,
		};
		getArticlesMock.mockResolvedValue(routeState.loaderData.articles);

		renderWithProviders(<FavoritesPage />);

		expect(screen.getByText("Favorite article")).toBeInTheDocument();
		await user.type(screen.getByLabelText("Search favorites..."), "design");
		expect(navigateMock).toHaveBeenCalled();

		await user.click(screen.getByRole("combobox", { name: "Sort articles" }));
		await user.click(screen.getByRole("option", { name: "Title A-Z" }));
		expect(navigateMock).toHaveBeenCalled();

		await user.click(screen.getByRole("button", { name: "favorite-a1" }));
		expect(updateArticleMock).toHaveBeenCalledWith({
			data: { id: "a1", isFavorite: false },
		});
	});

	it("reveals bulk actions after selecting a favorite article", async () => {
		const user = userEvent.setup();
		routeState.loaderData = {
			articles: { items: favoriteFixtures, total: 1 },
			tags: tagFixtures,
		};
		getArticlesMock.mockResolvedValue(routeState.loaderData.articles);

		renderWithProviders(<FavoritesPage />);
		await user.click(screen.getByRole("button", { name: "select-a1" }));

		expect(screen.getByText("1 selected")).toBeInTheDocument();
	});
});
