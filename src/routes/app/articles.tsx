import { createFileRoute } from "@tanstack/react-router";
import { ArticlesPage } from "#/components/articles/articles-page";
import {
	loadArticleCollectionRoute,
	validateArticleCollectionSearch,
} from "#/components/articles/helpers";

export const Route = createFileRoute("/app/articles")({
	validateSearch: validateArticleCollectionSearch,
	loaderDeps: ({ search }) => search,
	loader: ({ deps }) =>
		loadArticleCollectionRoute({
			filters: { isRead: false },
			search: deps,
		}),
	component: ArticlesPage,
});
