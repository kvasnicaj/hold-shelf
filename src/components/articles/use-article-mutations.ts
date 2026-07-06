import { type QueryKey, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { deleteArticles, updateArticle } from "#/server/articles";
import {
	addTagToArticles,
	createTag,
	removeTagFromArticles,
} from "#/server/tags";

type UseArticleMutationsOptions = {
	onSelectionClear?: () => void;
	extraInvalidationKeys?: QueryKey[];
	invalidateRouter?: boolean;
};

export function useArticleMutations({
	onSelectionClear,
	extraInvalidationKeys = [],
	invalidateRouter = true,
}: UseArticleMutationsOptions = {}) {
	const queryClient = useQueryClient();
	const router = useRouter();

	async function invalidateAll() {
		const invalidations = [
			queryClient.invalidateQueries({ queryKey: ["articles"] }),
			queryClient.invalidateQueries({ queryKey: ["tags"] }),
			...extraInvalidationKeys.map((queryKey) =>
				queryClient.invalidateQueries({ queryKey }),
			),
		];

		if (invalidateRouter) {
			invalidations.push(router.invalidate());
		}

		await Promise.all(invalidations);
	}

	async function handleToggleRead(id: string, isRead: boolean) {
		await updateArticle({ data: { id, isRead } });
		await invalidateAll();
	}

	async function handleToggleFavorite(id: string, isFavorite: boolean) {
		await updateArticle({ data: { id, isFavorite } });
		await invalidateAll();
	}

	async function handleDelete(ids: string[]) {
		await deleteArticles({ data: { ids } });
		onSelectionClear?.();
		await invalidateAll();
	}

	async function handleBulkToggleRead(ids: string[], isRead: boolean) {
		await Promise.all(ids.map((id) => updateArticle({ data: { id, isRead } })));
		onSelectionClear?.();
		await invalidateAll();
	}

	async function handleAddTag(tagId: string, articleIds: string[]) {
		await addTagToArticles({ data: { tagId, articleIds } });
		await invalidateAll();
	}

	async function handleRemoveTag(tagId: string, articleIds: string[]) {
		await removeTagFromArticles({ data: { tagId, articleIds } });
		await invalidateAll();
	}

	async function handleCreateTag(name: string) {
		const tag = await createTag({ data: { name } });
		await invalidateAll();
		return { id: tag.id, name: tag.name, color: tag.color };
	}

	return {
		handleToggleRead,
		handleToggleFavorite,
		handleDelete,
		handleBulkToggleRead,
		handleAddTag,
		handleRemoveTag,
		handleCreateTag,
	};
}
