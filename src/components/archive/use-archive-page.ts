import { useQuery } from "@tanstack/react-query";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
	articleListOptions,
	tagListOptions,
} from "#/components/articles/query-options";
import type { ArticleSort } from "#/components/articles/types";
import { useArticleMutations } from "#/components/articles/use-article-mutations";
import { useAutoMarkReadOnOpen } from "#/components/articles/use-auto-mark-read-on-open";

const route = getRouteApi("/app/archive");

export function useArchivePage() {
	const initialData = route.useLoaderData();
	const { q, filter, sort, tag, tags, page: searchPage } = route.useSearch();
	const page = searchPage ?? 1;
	const selectedTagIds = tags?.length ? tags : tag ? [tag] : [];
	const navigate = useNavigate({ from: "/app/archive" });
	const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
	const { handleOpenArticle } = useAutoMarkReadOnOpen();
	const {
		handleToggleRead,
		handleToggleFavorite,
		handleDelete,
		handleBulkToggleRead,
		handleAddTag,
		handleRemoveTag,
		handleCreateTag,
	} = useArticleMutations({
		onSelectionClear: () => setRowSelection({}),
	});

	const isRead =
		filter === "read" ? true : filter === "unread" ? false : undefined;

	const { data: result } = useQuery({
		...articleListOptions({
			isRead,
			search: q,
			sort,
			tagIds: selectedTagIds,
			limit: 20,
			offset: (page - 1) * 20,
		}),
		initialData: initialData.articles,
	});
	const { data: tagList = [] } = useQuery({
		...tagListOptions(),
		initialData: initialData.tags,
	});

	const articles = result?.items ?? [];
	const total = result?.total ?? 0;
	const totalPages = Math.ceil(total / 20);
	useEffect(() => {
		if (result && page > Math.max(1, totalPages))
			void navigate({
				search: (prev) => ({
					...prev,
					page: totalPages > 1 ? totalPages : undefined,
				}),
				replace: true,
			});
	}, [result, page, totalPages, navigate]);

	const selectedIds = Object.keys(rowSelection).filter(
		(id) => rowSelection[id],
	);

	function updateSearch(partial: {
		q?: string;
		tag?: string;
		tags?: string[];
		filter?: "all" | "read" | "unread";
		sort?: ArticleSort;
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
		updateSort: (nextSort: ArticleSort) =>
			updateSearch({
				sort: nextSort === "newest" ? undefined : nextSort,
				page: undefined,
			}),
		goToPage,
		clearSelection: () => setRowSelection({}),
	};
}
