import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getRouteApi, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useAutoMarkReadOnOpen } from "#/components/articles/use-auto-mark-read-on-open";
import { deleteArticles, getArticles, updateArticle } from "#/server/articles";
import {
	addTagToArticles,
	createTag,
	getTags,
	removeTagFromArticles,
} from "#/server/tags";

const route = getRouteApi("/app/archive");

export function useArchivePage() {
	const initialData = route.useLoaderData();
	const { q, filter, sort, tag, tags, page: searchPage } = route.useSearch();
	const page = searchPage ?? 1;
	const selectedTagIds = tags?.length ? tags : tag ? [tag] : [];
	const queryClient = useQueryClient();
	const router = useRouter();
	const navigate = useNavigate({ from: "/app/archive" });
	const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
	const { handleOpenArticle } = useAutoMarkReadOnOpen();

	const isRead =
		filter === "read" ? true : filter === "unread" ? false : undefined;

	const { data: result } = useQuery({
		queryKey: ["articles", "archive", q, filter, sort, selectedTagIds, page],
		queryFn: () =>
			getArticles({
				data: {
					isRead,
					search: q,
					sort,
					tagIds: selectedTagIds,
					limit: 20,
					offset: (page - 1) * 20,
				},
			}),
		initialData: initialData.articles,
	});
	const { data: tagList = [] } = useQuery({
		queryKey: ["tags"],
		queryFn: () => getTags(),
		initialData: initialData.tags,
	});

	const articles = result?.items ?? [];
	const total = result?.total ?? 0;
	const totalPages = Math.ceil(total / 20);
	const selectedIds = Object.keys(rowSelection).filter(
		(id) => rowSelection[id],
	);

	function invalidateAll() {
		queryClient.invalidateQueries({ queryKey: ["articles"] });
		queryClient.invalidateQueries({ queryKey: ["tags"] });
		router.invalidate();
	}

	async function handleToggleRead(id: string, readState: boolean) {
		await updateArticle({ data: { id, isRead: readState } });
		invalidateAll();
	}

	async function handleToggleFavorite(id: string, favoriteState: boolean) {
		await updateArticle({ data: { id, isFavorite: favoriteState } });
		invalidateAll();
	}

	async function handleDelete(ids: string[]) {
		await deleteArticles({ data: { ids } });
		setRowSelection({});
		invalidateAll();
	}

	async function handleBulkToggleRead(ids: string[], readState: boolean) {
		await Promise.all(
			ids.map((id) => updateArticle({ data: { id, isRead: readState } })),
		);
		setRowSelection({});
		invalidateAll();
	}

	async function handleAddTag(tagId: string, articleIds: string[]) {
		await addTagToArticles({ data: { tagId, articleIds } });
		invalidateAll();
	}

	async function handleRemoveTag(tagId: string, articleIds: string[]) {
		await removeTagFromArticles({ data: { tagId, articleIds } });
		invalidateAll();
	}

	async function handleCreateTag(name: string) {
		const newTag = await createTag({ data: { name } });
		invalidateAll();
		return { id: newTag.id, name: newTag.name, color: newTag.color };
	}

	function updateSearch(partial: {
		q?: string;
		tag?: string;
		tags?: string[];
		filter?: "all" | "read" | "unread";
		sort?: "newest" | "oldest" | "title";
		page?: number;
	}) {
		navigate({
			search: (prev) => ({
				...prev,
				...partial,
			}),
			replace: true,
		});
	}

	function goToPage(nextPage: number) {
		const clampedPage = Math.min(
			Math.max(nextPage, 1),
			Math.max(totalPages, 1),
		);

		updateSearch({ page: clampedPage > 1 ? clampedPage : undefined });
	}

	return {
		q,
		filter,
		sort,
		tag,
		selectedTagIds,
		page,
		articles,
		total,
		totalPages,
		tagList,
		rowSelection,
		selectedIds,
		setRowSelection,
		handleOpenArticle,
		handleToggleRead,
		handleToggleFavorite,
		handleDelete,
		handleBulkToggleRead,
		handleAddTag,
		handleRemoveTag,
		handleCreateTag,
		updateQuery: (nextQuery: string) =>
			updateSearch({
				q: nextQuery.trim() ? nextQuery : undefined,
				page: undefined,
			}),
		updateTags: (nextTags: string[]) =>
			updateSearch({
				tag: undefined,
				tags: nextTags.length > 0 ? nextTags : undefined,
				page: undefined,
			}),
		updateFilter: (nextFilter?: "all" | "read" | "unread") =>
			updateSearch({ filter: nextFilter, page: undefined }),
		updateSort: (nextSort: "newest" | "oldest" | "title") =>
			updateSearch({
				sort: nextSort === "newest" ? undefined : nextSort,
				page: undefined,
			}),
		goToPage,
		clearSelection: () => setRowSelection({}),
	};
}
