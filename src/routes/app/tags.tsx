import { createFileRoute } from "@tanstack/react-router";
import {
	loadArticleCollectionRoute,
	validateArticleCollectionSearch,
} from "#/components/articles/helpers";
import { TagsPage } from "#/components/tags/tags-page";
import { getTags } from "#/server/tags";

type TagsSearch = {
	tag?: string;
	q?: string;
	sort?: "newest" | "oldest" | "title";
	page?: number;
};

export const Route = createFileRoute("/app/tags")({
	validateSearch: (search: Record<string, unknown>): TagsSearch => ({
		...validateArticleCollectionSearch(search),
		tag: typeof search.tag === "string" ? search.tag : undefined,
	}),
	loaderDeps: ({ search }) => search,
	loader: async ({ deps }) => {
		if (!deps.tag) {
			const tags = await getTags();
			return { tags, articles: null };
		}

		return loadArticleCollectionRoute({
			filters: { tagId: deps.tag },
			search: deps,
		});
	},
	component: TagsPage,
});
