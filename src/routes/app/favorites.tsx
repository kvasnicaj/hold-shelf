import { createFileRoute } from "@tanstack/react-router";
import { FavoritesPage } from "#/components/favorites/favorites-page";
import { getArticles } from "#/server/articles";
import { getTags } from "#/server/tags";

const PAGE_SIZE = 20;

type FavoritesSearch = {
	q?: string;
	sort?: "newest" | "oldest" | "title";
	page?: number;
};

export const Route = createFileRoute("/app/favorites")({
	validateSearch: (search: Record<string, unknown>): FavoritesSearch => ({
		q: typeof search.q === "string" ? search.q : undefined,
		sort: ["newest", "oldest", "title"].includes(search.sort as string)
			? (search.sort as FavoritesSearch["sort"])
			: undefined,
		page:
			typeof search.page === "number" && search.page > 1
				? search.page
				: undefined,
	}),
	loaderDeps: ({ search }) => search,
	loader: async ({ deps }) => {
		const page = deps.page ?? 1;
		const [articles, tags] = await Promise.all([
			getArticles({
				data: {
					isFavorite: true,
					search: deps.q,
					sort: deps.sort,
					limit: PAGE_SIZE,
					offset: (page - 1) * PAGE_SIZE,
				},
			}),
			getTags(),
		]);
		return { articles, tags };
	},
	component: FavoritesPage,
});
