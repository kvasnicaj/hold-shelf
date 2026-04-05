import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getRouteApi, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useSaveArticle } from "#/components/articles/use-save-article";
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
	const { q, filter, sort, tag, page: searchPage } = route.useSearch();
	const page = searchPage ?? 1;
	const queryClient = useQueryClient();
	const router = useRouter();
	const navigate = useNavigate({ from: "/app/archive" });
	const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
	const { handleAdd } = useSaveArticle();

	const isRead =
		filter === "read" ? true : filter === "unread" ? false : undefined;

	const { data: result } = useQuery({
		queryKey: ["articles", "archive", q, filter, sort, tag, page],
		queryFn: () =>
			getArticles({
				data: {
					isRead,
					search: q,
					sort,
					tagId: tag,
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
	const activeTag = tag
		? tagList.find((currentTag) => currentTag.id === tag)
		: null;
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
		tag?: string;
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

	return {
		q,
		filter,
		sort,
		tag,
		page,
		articles,
		total,
		totalPages,
		tagList,
		activeTag,
		rowSelection,
		selectedIds,
		setRowSelection,
		handleAdd,
		handleToggleRead,
		handleDelete,
		handleBulkToggleRead,
		handleAddTag,
		handleRemoveTag,
		handleCreateTag,
		clearTag: () => updateSearch({ tag: undefined, page: undefined }),
		updateTag: (nextTag?: string) =>
			updateSearch({ tag: nextTag, page: undefined }),
		updateFilter: (nextFilter?: "all" | "read" | "unread") =>
			updateSearch({ filter: nextFilter, page: undefined }),
		updateSort: (nextSort: "newest" | "oldest" | "title") =>
			updateSearch({
				sort: nextSort === "newest" ? undefined : nextSort,
				page: undefined,
			}),
		goToPreviousPage: () =>
			updateSearch({ page: page > 2 ? page - 1 : undefined }),
		goToNextPage: () => updateSearch({ page: page + 1 }),
		clearSelection: () => setRowSelection({}),
	};
}
