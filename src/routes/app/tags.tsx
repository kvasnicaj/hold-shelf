import { createFileRoute } from "@tanstack/react-router";
import { TagsPage } from "#/components/tags/tags-page";
import { getArticles } from "#/server/articles";
import { getTags } from "#/server/tags";

const PAGE_SIZE = 20;

type TagsSearch = {
	tag?: string;
	page?: number;
};

export const Route = createFileRoute("/app/tags")({
	validateSearch: (search: Record<string, unknown>): TagsSearch => ({
		tag: typeof search.tag === "string" ? search.tag : undefined,
		page:
			typeof search.page === "number" && search.page > 1
				? search.page
				: undefined,
	}),
	loaderDeps: ({ search }) => search,
	loader: async ({ deps }) => {
		const page = deps.page ?? 1;
		const [tags, articles] = await Promise.all([
			getTags(),
			deps.tag
				? getArticles({
						data: {
							tagId: deps.tag,
							limit: PAGE_SIZE,
							offset: (page - 1) * PAGE_SIZE,
						},
					})
				: null,
		]);
		return { tags, articles };
	},
	component: TagsPage,
});
