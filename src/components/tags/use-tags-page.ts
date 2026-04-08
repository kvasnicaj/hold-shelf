import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getRouteApi, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useAutoMarkReadOnOpen } from "#/components/articles/use-auto-mark-read-on-open";
import { deleteArticles, getArticles, updateArticle } from "#/server/articles";
import {
	addTagToArticles,
	createTag,
	deleteTag,
	getTags,
	removeTagFromArticles,
	updateTag,
} from "#/server/tags";

const route = getRouteApi("/app/tags");
const PAGE_SIZE = 20;

export function useTagsPage() {
	const initialData = route.useLoaderData();
	const { tag: selectedTagId, page: searchPage } = route.useSearch();
	const page = searchPage ?? 1;
	const queryClient = useQueryClient();
	const router = useRouter();
	const navigate = useNavigate({ from: "/app/tags" });
	const [filter, setFilter] = useState("");
	const [selected, setSelected] = useState<Set<string>>(new Set());
	const { handleOpenArticle } = useAutoMarkReadOnOpen();

	const { data: tagList = [] } = useQuery({
		queryKey: ["tags"],
		queryFn: () => getTags(),
		initialData: initialData.tags,
	});
	const { data: articlesResult } = useQuery({
		queryKey: ["articles", "by-tag", selectedTagId, page],
		queryFn: () =>
			getArticles({
				data: {
					tagId: selectedTagId,
					limit: PAGE_SIZE,
					offset: (page - 1) * PAGE_SIZE,
				},
			}),
		initialData: initialData.articles ?? undefined,
		enabled: !!selectedTagId,
	});

	const articles = articlesResult?.items ?? [];
	const total = articlesResult?.total ?? 0;
	const totalPages = Math.ceil(total / PAGE_SIZE);
	const filteredTags = filter
		? tagList.filter((tag) =>
				tag.name.toLowerCase().includes(filter.toLowerCase()),
			)
		: tagList;
	const activeTag = tagList.find((tag) => tag.id === selectedTagId);

	function invalidateAll() {
		queryClient.invalidateQueries({ queryKey: ["articles"] });
		queryClient.invalidateQueries({ queryKey: ["tags"] });
		router.invalidate();
	}

	async function handleCreateTag(name: string) {
		await createTag({ data: { name } });
		invalidateAll();
	}

	async function handleRename(id: string, name: string) {
		await updateTag({ data: { id, name } });
		invalidateAll();
	}

	async function handleDeleteTag(id: string) {
		await deleteTag({ data: { id } });
		if (selectedTagId === id) {
			navigate({ search: {}, replace: true });
		}
		invalidateAll();
	}

	async function handleToggleRead(id: string, isRead: boolean) {
		await updateArticle({ data: { id, isRead } });
		invalidateAll();
	}

	async function handleToggleFavorite(id: string, isFavorite: boolean) {
		await updateArticle({ data: { id, isFavorite } });
		invalidateAll();
	}

	function handleSelect(id: string, isSelected: boolean) {
		setSelected((prev) => {
			const next = new Set(prev);
			if (isSelected) next.add(id);
			else next.delete(id);
			return next;
		});
	}

	async function handleDeleteArticles(ids: string[]) {
		await deleteArticles({ data: { ids } });
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

	async function handleCreateTagFromPicker(name: string) {
		const newTag = await createTag({ data: { name } });
		invalidateAll();
		return { id: newTag.id, name: newTag.name, color: newTag.color };
	}

	function navigateToTag(tagId: string) {
		navigate({
			search: { tag: tagId },
			replace: true,
		});
	}

	function goBackToTags() {
		navigate({ search: {}, replace: true });
	}

	function goToPage(nextPage: number) {
		const clampedPage = Math.min(
			Math.max(nextPage, 1),
			Math.max(totalPages, 1),
		);

		navigate({
			search: (prev) => ({
				...prev,
				page: clampedPage > 1 ? clampedPage : undefined,
			}),
			replace: true,
		});
	}

	return {
		selectedTagId,
		page,
		filter,
		selected,
		tagList,
		filteredTags,
		activeTag,
		articles,
		total,
		totalPages,
		setFilter,
		handleCreateTag,
		handleRename,
		handleDeleteTag,
		handleToggleRead,
		handleToggleFavorite,
		handleOpenArticle,
		handleSelect,
		handleDeleteArticles,
		handleAddTag,
		handleRemoveTag,
		handleCreateTagFromPicker,
		navigateToTag,
		goBackToTags,
		goToPage,
	};
}
