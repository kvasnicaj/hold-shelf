import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ARTICLE_COLLECTION_PAGE_SIZE } from "#/components/articles/helpers";
import type {
	ArticleCollectionFilters,
	ArticleCollectionLoaderData,
	ArticleCollectionNavigate,
	ArticleCollectionQueryKey,
	ArticleCollectionSearch,
	ArticleSort,
} from "#/components/articles/types";
import { useArticleMutations } from "#/components/articles/use-article-mutations";
import { useAutoMarkReadOnOpen } from "#/components/articles/use-auto-mark-read-on-open";
import { getArticles } from "#/server/articles";
import { getTags } from "#/server/tags";

type UseArticleCollectionPageOptions = {
	initialData: ArticleCollectionLoaderData;
	search: ArticleCollectionSearch;
	queryKey: ArticleCollectionQueryKey;
	filters: ArticleCollectionFilters;
	navigate: ArticleCollectionNavigate;
	enabled?: boolean;
};

export function useArticleCollectionPage({
	initialData,
	search,
	queryKey,
	filters,
	navigate,
	enabled = true,
}: UseArticleCollectionPageOptions) {
	const { q, sort, page: searchPage } = search;
	const page = searchPage ?? 1;
	const [selected, setSelected] = useState<Set<string>>(new Set());
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
		onSelectionClear: () => setSelected(new Set()),
	});

	const { data: result } = useQuery({
		queryKey: ["articles", queryKey, q, sort, page],
		queryFn: () =>
			getArticles({
				data: {
					...filters,
					search: q,
					sort,
					limit: ARTICLE_COLLECTION_PAGE_SIZE,
					offset: (page - 1) * ARTICLE_COLLECTION_PAGE_SIZE,
				},
			}),
		initialData: initialData.articles,
		enabled,
	});
	const { data: tagList = [] } = useQuery({
		queryKey: ["tags"],
		queryFn: () => getTags(),
		initialData: initialData.tags,
	});

	const articles = result?.items ?? [];
	const total = result?.total ?? 0;
	const totalPages = Math.ceil(total / ARTICLE_COLLECTION_PAGE_SIZE);
	const selectedIds = Array.from(selected);

	function handleSelect(id: string, isSelected: boolean) {
		setSelected((prev) => {
			const next = new Set(prev);
			if (isSelected) next.add(id);
			else next.delete(id);
			return next;
		});
	}

	function updateSort(nextSort: ArticleSort) {
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

	function goToPage(nextPage: number) {
		const clampedPage = Math.min(
			Math.max(nextPage, 1),
			Math.max(totalPages, 1),
		);

		void navigate({
			search: (prev) => ({
				...prev,
				page: clampedPage > 1 ? clampedPage : undefined,
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
		handleOpenArticle,
		handleToggleRead,
		handleToggleFavorite,
		handleDelete,
		handleBulkToggleRead,
		handleAddTag,
		handleRemoveTag,
		handleCreateTag,
		updateQuery,
		updateSort,
		goToPage,
		clearSelection: () => setSelected(new Set()),
	};
}
