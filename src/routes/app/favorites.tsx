import { createFileRoute } from "@tanstack/react-router";
import {
	loadArticleCollectionRoute,
	validateArticleCollectionSearch,
} from "#/components/articles/helpers";
import { FavoritesPage } from "#/components/favorites/favorites-page";

export const Route = createFileRoute("/app/favorites")({
	validateSearch: validateArticleCollectionSearch,
	loaderDeps: ({ search }) => search,
	loader: ({ deps, context }) =>
		loadArticleCollectionRoute({
			queryClient: context.queryClient,
			filters: { isFavorite: true },
			search: deps,
		}),
	component: FavoritesPage,
});
