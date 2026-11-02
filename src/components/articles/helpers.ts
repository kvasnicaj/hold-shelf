import type { QueryClient } from "@tanstack/react-query";
import {
	articleListOptions,
	tagListOptions,
} from "#/components/articles/query-options";
import type {
	ArticleCollectionFilters,
	ArticleCollectionSearch,
} from "#/components/articles/types";

export const ARTICLE_COLLECTION_PAGE_SIZE = 20;
export const UNREAD_PAGE_SIZE = 10;

export function validateArticleCollectionSearch(
	search: Record<string, unknown>,
	pageSize = ARTICLE_COLLECTION_PAGE_SIZE,
): ArticleCollectionSearch {
	return {
		q: typeof search.q === "string" ? search.q : undefined,
		sort: ["newest", "oldest", "title"].includes(search.sort as string)
			? (search.sort as ArticleCollectionSearch["sort"])
			: undefined,
		page:
			typeof search.page === "number" &&
			Number.isInteger(search.page) &&
			search.page > 1 &&
			search.page <= Math.floor(10000 / pageSize) + 1
				? search.page
				: undefined,
	};
}

export async function loadArticleCollectionRoute({
	filters,
	search,
	queryClient,
	pageSize = ARTICLE_COLLECTION_PAGE_SIZE,
}: {
	queryClient: QueryClient;
	filters: ArticleCollectionFilters;
	search: ArticleCollectionSearch;
	pageSize?: number;
}) {
	const page = search.page ?? 1;
	const [articles, tags] = await Promise.all([
		queryClient.ensureQueryData(
			articleListOptions({
				...filters,
				search: search.q,
				sort: search.sort,
				limit: pageSize,
				offset: (page - 1) * pageSize,
			}),
		),
		queryClient.ensureQueryData(tagListOptions()),
	]);

	return { articles, tags };
}
