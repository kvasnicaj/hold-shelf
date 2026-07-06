import type {
	ArticleCollectionFilters,
	ArticleCollectionSearch,
} from "#/components/articles/types";
import { getArticles } from "#/server/articles";
import { getTags } from "#/server/tags";

export const ARTICLE_COLLECTION_PAGE_SIZE = 20;

export function validateArticleCollectionSearch(
	search: Record<string, unknown>,
): ArticleCollectionSearch {
	return {
		q: typeof search.q === "string" ? search.q : undefined,
		sort: ["newest", "oldest", "title"].includes(search.sort as string)
			? (search.sort as ArticleCollectionSearch["sort"])
			: undefined,
		page:
			typeof search.page === "number" && search.page > 1
				? search.page
				: undefined,
	};
}

export async function loadArticleCollectionRoute({
	filters,
	search,
}: {
	filters: ArticleCollectionFilters;
	search: ArticleCollectionSearch;
}) {
	const page = search.page ?? 1;
	const [articles, tags] = await Promise.all([
		getArticles({
			data: {
				...filters,
				search: search.q,
				sort: search.sort,
				limit: ARTICLE_COLLECTION_PAGE_SIZE,
				offset: (page - 1) * ARTICLE_COLLECTION_PAGE_SIZE,
			},
		}),
		getTags(),
	]);

	return { articles, tags };
}
