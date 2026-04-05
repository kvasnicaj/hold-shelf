import { createFileRoute } from "@tanstack/react-router";
import { ArchivePage } from "#/components/archive/archive-page";
import { getArticles } from "#/server/articles";
import { getTags } from "#/server/tags";

const PAGE_SIZE = 20;

type ArchiveSearch = {
	q?: string;
	filter?: "all" | "read" | "unread";
	sort?: "newest" | "oldest" | "title";
	tag?: string;
	page?: number;
};

export const Route = createFileRoute("/app/archive")({
	validateSearch: (search: Record<string, unknown>): ArchiveSearch => ({
		q: typeof search.q === "string" ? search.q : undefined,
		filter: ["all", "read", "unread"].includes(search.filter as string)
			? (search.filter as ArchiveSearch["filter"])
			: undefined,
		sort: ["newest", "oldest", "title"].includes(search.sort as string)
			? (search.sort as ArchiveSearch["sort"])
			: undefined,
		tag: typeof search.tag === "string" ? search.tag : undefined,
		page:
			typeof search.page === "number" && search.page > 1
				? search.page
				: undefined,
	}),
	loaderDeps: ({ search }) => search,
	loader: async ({ deps }) => {
		const isRead =
			deps.filter === "read"
				? true
				: deps.filter === "unread"
					? false
					: undefined;
		const page = deps.page ?? 1;
		const [articles, tags] = await Promise.all([
			getArticles({
				data: {
					isRead,
					search: deps.q,
					sort: deps.sort,
					tagId: deps.tag,
					limit: PAGE_SIZE,
					offset: (page - 1) * PAGE_SIZE,
				},
			}),
			getTags(),
		]);
		return { articles, tags };
	},
	component: ArchivePage,
});
