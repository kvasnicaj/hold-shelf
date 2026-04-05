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

const route = getRouteApi("/app/articles");

export function useArticlesPage() {
	const initialData = route.useLoaderData();
	const { q, sort, page: searchPage } = route.useSearch();
	const page = searchPage ?? 1;
	const queryClient = useQueryClient();
	const router = useRouter();
	const navigate = useNavigate({ from: "/app/articles" });
	const [selected, setSelected] = useState<Set<string>>(new Set());
	const { handleAdd } = useSaveArticle();

	const { data: result } = useQuery({
		queryKey: ["articles", "unread", q, sort, page],
		queryFn: () =>
			getArticles({
				data: {
					isRead: false,
					search: q,
					sort,
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
	const selectedIds = Array.from(selected);

	function invalidateAll() {
		queryClient.invalidateQueries({ queryKey: ["articles"] });
		queryClient.invalidateQueries({ queryKey: ["tags"] });
		router.invalidate();
	}

	function handleSelect(id: string, isSelected: boolean) {
		setSelected((prev) => {
			const next = new Set(prev);
			if (isSelected) next.add(id);
			else next.delete(id);
			return next;
		});
	}

	async function handleToggleRead(id: string, isRead: boolean) {
		await updateArticle({ data: { id, isRead } });
		invalidateAll();
	}

	async function handleDelete(ids: string[]) {
		await deleteArticles({ data: { ids } });
		setSelected(new Set());
		invalidateAll();
	}

	async function handleBulkToggleRead(ids: string[], isRead: boolean) {
		await Promise.all(ids.map((id) => updateArticle({ data: { id, isRead } })));
		setSelected(new Set());
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
		const tag = await createTag({ data: { name } });
		invalidateAll();
		return { id: tag.id, name: tag.name, color: tag.color };
	}

	function updateSort(nextSort: "newest" | "oldest" | "title") {
		navigate({
			search: (prev) => ({
				...prev,
				sort: nextSort === "newest" ? undefined : nextSort,
				page: undefined,
			}),
			replace: true,
		});
	}

	function goToPreviousPage() {
		navigate({
			search: (prev) => ({
				...prev,
				page: page > 2 ? page - 1 : undefined,
			}),
			replace: true,
		});
	}

	function goToNextPage() {
		navigate({
			search: (prev) => ({
				...prev,
				page: page + 1,
			}),
			replace: true,
		});
	}

	return {
		q,
		sort,
		page,
		articles,
		total,
		totalPages,
		tagList,
		selected,
		selectedIds,
		handleSelect,
		handleAdd,
		handleToggleRead,
		handleDelete,
		handleBulkToggleRead,
		handleAddTag,
		handleRemoveTag,
		handleCreateTag,
		updateSort,
		goToPreviousPage,
		goToNextPage,
		clearSelection: () => setSelected(new Set()),
	};
}
