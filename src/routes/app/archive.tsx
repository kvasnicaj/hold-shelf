import { createFileRoute } from "@tanstack/react-router";
import { ArchivePage } from "#/components/archive/archive-page";
import {
	articleListOptions,
	tagListOptions,
} from "#/components/articles/query-options";

const PAGE_SIZE = 20;

type ArchiveSearch = {
	q?: string;
	filter?: "all" | "read" | "unread";
	sort?: "newest" | "oldest" | "title";
	tag?: string;
	tags?: string[];
	page?: number;
};

export const Route = createFileRoute("/app/archive")({
	validateSearch: (search: Record<string, unknown>): ArchiveSearch => {
		const tags = Array.isArray(search.tags)
			? search.tags.filter((tag): tag is string => typeof tag === "string")
			: undefined;

		return {
			q: typeof search.q === "string" ? search.q : undefined,
			filter: ["all", "read", "unread"].includes(search.filter as string)
				? (search.filter as ArchiveSearch["filter"])
				: undefined,
			sort: ["newest", "oldest", "title"].includes(search.sort as string)
				? (search.sort as ArchiveSearch["sort"])
				: undefined,
			tag: typeof search.tag === "string" ? search.tag : undefined,
			tags: tags && tags.length > 0 ? tags : undefined,
			page:
				typeof search.page === "number" &&
				Number.isInteger(search.page) &&
				search.page > 1 &&
				search.page <= 501
					? search.page
					: undefined,
		};
	},
	loaderDeps: ({ search }) => search,
	loader: async ({ deps, context }) => {
		const isRead =
			deps.filter === "read"
				? true
				: deps.filter === "unread"
					? false
					: undefined;
		const page = deps.page ?? 1;
		const tagIds = deps.tags?.length ? deps.tags : deps.tag ? [deps.tag] : [];
		const [articles, tags] = await Promise.all([
			context.queryClient.ensureQueryData(
				articleListOptions({
					isRead,
					search: deps.q,
					sort: deps.sort,
					tagIds,
					limit: PAGE_SIZE,
					offset: (page - 1) * PAGE_SIZE,
				}),
			),
			context.queryClient.ensureQueryData(tagListOptions()),
		]);
		return { articles, tags };
	},
	component: ArchivePage,
});
