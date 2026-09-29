import { queryOptions } from "@tanstack/react-query";
import type { ArticleCollectionLoaderData } from "#/components/articles/types";
import { getArticles } from "#/server/articles";
import type { GetArticlesInput } from "#/server/articles-service";
import { getTags } from "#/server/tags";
export function articleListOptions(data: GetArticlesInput) {
	return queryOptions<ArticleCollectionLoaderData["articles"]>({
		queryKey: ["articles", data],
		queryFn: () => getArticles({ data }),
		staleTime: 30000,
	});
}
export function tagListOptions() {
	return queryOptions<ArticleCollectionLoaderData["tags"]>({
		queryKey: ["tags"],
		queryFn: () => getTags(),
		staleTime: 30000,
	});
}
