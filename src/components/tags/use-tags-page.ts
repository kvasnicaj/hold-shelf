import { useQueryClient } from "@tanstack/react-query";
import { getRouteApi, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useArticleCollectionPage } from "#/components/articles/use-article-collection-page";
import { createTag, deleteTag, updateTag } from "#/server/tags";

const route = getRouteApi("/app/tags");

export function useTagsPage() {
	const initialData = route.useLoaderData();
	const search = route.useSearch();
	const selectedTagId = search.tag;
	const queryClient = useQueryClient();
	const router = useRouter();
	const navigate = useNavigate({ from: "/app/tags" });
	const [filter, setFilter] = useState("");

	const collectionState = useArticleCollectionPage({
		initialData: {
			articles: initialData.articles ?? { items: [], total: 0 },
			tags: initialData.tags,
		},
		search,
		queryKey: selectedTagId ? `tag:${selectedTagId}` : "tag:none",
		filters: selectedTagId ? { tagId: selectedTagId } : {},
		navigate,
		enabled: !!selectedTagId,
	});

	const tagList = collectionState.tagList;
	const tagSummaries = tagList.map((tag) => ({
		...tag,
		articleCount: tag.articleCount ?? 0,
	}));
	const filteredTags = filter
		? tagSummaries.filter((tag) =>
				tag.name.toLowerCase().includes(filter.toLowerCase()),
			)
		: tagSummaries;
	const activeTag = tagSummaries.find((tag) => tag.id === selectedTagId);

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

	function navigateToTag(tagId: string) {
		navigate({
			search: { tag: tagId },
			replace: true,
		});
	}

	function goBackToTags() {
		navigate({ search: {}, replace: true });
	}

	return {
		...collectionState,
		activeShare: initialData.share,
		selectedTagId,
		filter,
		tagList,
		filteredTags,
		activeTag,
		setFilter,
		handleCreateTag,
		handleCreateTagFromPicker: collectionState.handleCreateTag,
		handleRename,
		handleDeleteTag,
		navigateToTag,
		goBackToTags,
	};
}
