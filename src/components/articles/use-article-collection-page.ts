import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import type {
	ArticleCollectionLoaderData,
	ArticleCollectionSearch,
} from "#/components/articles/types";
import { useSaveArticle } from "#/components/articles/use-save-article";
import { deleteArticles, getArticles, updateArticle } from "#/server/articles";
import {
	addTagToArticles,
	createTag,
	getTags,
	removeTagFromArticles,
} from "#/server/tags";

type UseArticleCollectionPageOptions = {
	initialData: ArticleCollectionLoaderData;
	search: ArticleCollectionSearch;
	queryKey: "unread" | "favorites";
	filters: {
		isRead?: boolean;
		isFavorite?: boolean;
	};
	navigate: (options: {
		search: (
			prev: ArticleCollectionSearch,
		) => Partial<ArticleCollectionSearch> | ArticleCollectionSearch;
		replace: boolean;
	}) => void | Promise<void>;
};

const PAGE_SIZE = 20;

export function useArticleCollectionPage({
	initialData,
	search,
	queryKey,
	filters,
	navigate,
}: UseArticleCollectionPageOptions) {
	const { q, sort, page: searchPage } = search;
	const page = searchPage ?? 1;
	const queryClient = useQueryClient();
	const router = useRouter();
	const [selected, setSelected] = useState<Set<string>>(new Set());
	const { handleAdd } = useSaveArticle();

	const { data: result } = useQuery({
		queryKey: ["articles", queryKey, q, sort, page],
		queryFn: () =>
			getArticles({
				data: {
					...filters,
					search: q,
					sort,
					limit: PAGE_SIZE,
					offset: (page - 1) * PAGE_SIZE,
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
	const totalPages = Math.ceil(total / PAGE_SIZE);
	const selectedIds = Array.from(selected);

	function invalidateAll() {
		void queryClient.invalidateQueries({ queryKey: ["articles"] });
		void queryClient.invalidateQueries({ queryKey: ["tags"] });
		void router.invalidate();
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

	async function handleToggleFavorite(id: string, isFavorite: boolean) {
		await updateArticle({ data: { id, isFavorite } });
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
		void navigate({
			search: (prev) => ({
				...prev,
				sort: nextSort === "newest" ? undefined : nextSort,
				page: undefined,
			}),
			replace: true,
		});
	}

	function updateQuery(query: string) {
		void navigate({
			search: (prev) => ({
				...prev,
				q: query.trim() ? query : undefined,
				page: undefined,
			}),
			replace: true,
		});
	}

	function goToPreviousPage() {
		void navigate({
			search: (prev) => ({
				...prev,
				page: page > 2 ? page - 1 : undefined,
			}),
			replace: true,
		});
	}

	function goToNextPage() {
		void navigate({
			search: (prev) => ({
				...prev,
				page: Math.min(page + 1, Math.max(totalPages, 1)),
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
		handleToggleFavorite,
		handleDelete,
		handleBulkToggleRead,
		handleAddTag,
		handleRemoveTag,
		handleCreateTag,
		updateQuery,
		updateSort,
		goToPreviousPage,
		goToNextPage,
		clearSelection: () => setSelected(new Set()),
	};
}
