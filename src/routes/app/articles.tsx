import { createFileRoute } from "@tanstack/react-router";
import { ArticlesPage } from "#/components/articles/articles-page";
import {
	loadArticleCollectionRoute,
	UNREAD_PAGE_SIZE,
	validateArticleCollectionSearch,
} from "#/components/articles/helpers";

export const Route = createFileRoute("/app/articles")({
	validateSearch: (search) =>
		validateArticleCollectionSearch(search, UNREAD_PAGE_SIZE),
	loaderDeps: ({ search }) => search,
	loader: ({ deps, context }) =>
		loadArticleCollectionRoute({
			queryClient: context.queryClient,
			filters: { isRead: false },
			search: deps,
			pageSize: UNREAD_PAGE_SIZE,
		}),
	component: ArticlesPage,
});
