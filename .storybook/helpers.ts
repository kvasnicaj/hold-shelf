import { QueryClient } from "@tanstack/react-query";
import {
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
} from "@tanstack/react-router";
import { ArchivePage } from "#/components/archive/archive-page";
import { ArticlesPage } from "#/components/articles/articles-page";
import { FavoritesPage } from "#/components/favorites/favorites-page";
import { HomePage } from "#/components/home/home-page";
import { TrashPage } from "#/components/library/trash-page";
import { SettingsPage } from "#/components/settings/settings-page";
import { TagsPage } from "#/components/tags/tags-page";
import type { GetArticlesInput } from "#/server/articles-service";
import { sampleArticles } from "#/stories/fixtures";
import { getMockHomeData, listSampleArticles } from "./mocks/api";
import type { MockScenario } from "./mocks/types";
import { StoryRoot } from "./story-root";

export function createStoryRouter(path: string, scenario: MockScenario) {
	const root = createRootRoute({ component: StoryRoot });
	const app = createRoute({ getParentRoute: () => root, path: "app" });
	const empty = scenario === "empty";
	const collection = (
		search: Record<string, unknown>,
		filters: GetArticlesInput = {},
	) => ({
		articles: empty
			? { items: [], total: 0 }
			: listSampleArticles({
					...filters,
					search: typeof search.q === "string" ? search.q : undefined,
					tagId: typeof search.tag === "string" ? search.tag : undefined,
					tagIds: Array.isArray(search.tags)
						? search.tags.filter((id): id is string => typeof id === "string")
						: undefined,
					isRead:
						search.filter === "read"
							? true
							: search.filter === "unread"
								? false
								: filters.isRead,
					sort:
						search.sort === "title" || search.sort === "oldest"
							? search.sort
							: "newest",
				}),
		tags: getMockHomeData().tags,
		share: null,
	});
	const appRoutes = [
		createRoute({
			getParentRoute: () => app,
			path: "home",
			component: HomePage,
			loader: getMockHomeData,
		}),
		createRoute({
			getParentRoute: () => app,
			path: "articles",
			component: ArticlesPage,
			loaderDeps: ({ search }) => search,
			loader: ({ deps }) => collection(deps, { isRead: false }),
			validateSearch: (search) => search,
		}),
		createRoute({
			getParentRoute: () => app,
			path: "favorites",
			component: FavoritesPage,
			loaderDeps: ({ search }) => search,
			loader: ({ deps }) => collection(deps, { isFavorite: true }),
			validateSearch: (search) => search,
		}),
		createRoute({
			getParentRoute: () => app,
			path: "archive",
			component: ArchivePage,
			loaderDeps: ({ search }) => search,
			loader: ({ deps }) => collection(deps),
			validateSearch: (search) => search,
		}),
		createRoute({
			getParentRoute: () => app,
			path: "tags",
			component: TagsPage,
			loaderDeps: ({ search }) => search,
			loader: ({ deps }) => collection(deps),
			validateSearch: (search) => search,
		}),
		createRoute({
			getParentRoute: () => app,
			path: "settings",
			component: SettingsPage,
		}),
		createRoute({
			getParentRoute: () => app,
			path: "trash",
			component: TrashPage,
		}),
	];
	const publicRoutes = [
		"/",
		"login",
		"about",
		"privacy",
		"api-docs",
		"cli-docs",
		"save",
		"extension/save",
	].map((path) =>
		createRoute({
			getParentRoute: () => root,
			path,
			validateSearch: (search) => search,
		}),
	);
	const shared = createRoute({
		getParentRoute: () => root,
		path: "share/$token",
		validateSearch: (search) => search,
		loader: () => ({
			ownerFirstName: "Alex",
			tagName: "Design",
			articles: {
				items: empty ? [] : sampleArticles,
				total: empty ? 0 : sampleArticles.length,
			},
		}),
	});
	return createRouter({
		routeTree: root.addChildren([
			app.addChildren(appRoutes),
			...publicRoutes,
			shared,
		]),
		history: createMemoryHistory({ initialEntries: [path] }),
		defaultPendingMinMs: 0,
	});
}

export function createStoryQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: { retry: false, staleTime: 30_000, refetchOnWindowFocus: false },
			mutations: { retry: false },
		},
	});
}
