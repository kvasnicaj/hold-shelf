import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { chunks } from "#/lib/helpers";
import { deleteArticles, updateArticle } from "#/server/articles";
import { finishReading, restoreArticles } from "#/server/library";
import {
	addTagToArticles,
	createTag,
	removeTagFromArticles,
} from "#/server/tags";

type UseArticleMutationsOptions = { onSelectionClear?: () => void };
export function useArticleMutations({
	onSelectionClear,
}: UseArticleMutationsOptions = {}) {
	const client = useQueryClient();
	const router = useRouter();
	const mutation = useMutation({
		mutationKey: ["library-edit"],
		mutationFn: (run: () => Promise<void>) => run(),
		onError: (error) =>
			toast.error(
				error instanceof Error
					? error.message
					: "Could not save the change. Please try again.",
			),
		onSettled: async () => {
			await Promise.all([
				...[
					"articles",
					"tags",
					"article-reader",
					"trash",
					"continue-reading",
					"reading-progress",
				].map((key) => client.invalidateQueries({ queryKey: [key] })),
				router.invalidate(),
			]);
		},
	});
	// Click handlers resolve after displaying errors, avoiding unhandled rejections.
	async function run(action: () => Promise<void>) {
		try {
			await mutation.mutateAsync(action);
		} catch {
			/* onError displays the failure */
		}
	}
	async function handleFinishReading(id: string) {
		await run(async () => {
			await finishReading({ data: { id } });
		});
	}

	async function handleToggleRead(id: string, isRead: boolean) {
		await run(async () => {
			await updateArticle({ data: { id, isRead } });
		});
	}
	async function handleToggleFavorite(id: string, isFavorite: boolean) {
		await run(async () => {
			await updateArticle({ data: { id, isFavorite } });
		});
	}
	async function handleDelete(ids: string[]) {
		await run(async () => {
			for (const batch of chunks(ids, 100))
				await deleteArticles({ data: { ids: batch } });
			onSelectionClear?.();
			toast.success("Moved to Trash", {
				action: {
					label: "Undo",
					onClick: () => {
						void run(async () => {
							for (const batch of chunks(ids, 100))
								await restoreArticles({ data: { ids: batch } });
						});
					},
				},
			});
		});
	}
	async function handleBulkToggleRead(ids: string[], isRead: boolean) {
		await run(async () => {
			let failures = 0;
			for (const batch of chunks(ids, 5)) {
				const results = await Promise.allSettled(
					batch.map((id) => updateArticle({ data: { id, isRead } })),
				);
				failures += results.filter(
					(result) => result.status === "rejected",
				).length;
			}
			if (failures)
				throw new Error(
					`${failures} articles could not be updated. Your successful changes have been saved; please retry.`,
				);
			onSelectionClear?.();
		});
	}
	async function handleAddTag(tagId: string, articleIds: string[]) {
		await mutation.mutateAsync(async () => {
			for (const batch of chunks(articleIds, 100))
				await addTagToArticles({ data: { tagId, articleIds: batch } });
		});
	}
	async function handleRemoveTag(tagId: string, articleIds: string[]) {
		await mutation.mutateAsync(async () => {
			for (const batch of chunks(articleIds, 100))
				await removeTagFromArticles({ data: { tagId, articleIds: batch } });
		});
	}
	async function handleCreateTag(name: string) {
		let result: Awaited<ReturnType<typeof createTag>> | undefined;
		await mutation.mutateAsync(async () => {
			result = await createTag({ data: { name } });
		});
		if (!result) throw new Error("Could not create tag.");
		return result;
	}
	return {
		handleFinishReading,
		handleToggleRead,
		handleToggleFavorite,
		handleDelete,
		handleBulkToggleRead,
		handleAddTag,
		handleRemoveTag,
		handleCreateTag,
		isPending: mutation.isPending,
	};
}
