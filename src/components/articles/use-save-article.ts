import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { createArticle } from "#/server/articles";
import { addTagToArticles } from "#/server/tags";

export function useSaveArticle() {
	const queryClient = useQueryClient();
	const router = useRouter();

	/**
	 * Saves a link, then assigns the chosen tags. The article is committed
	 * before tagging, so a tag failure is reported as a partial success
	 * instead of a failed save (retrying the save would hit a duplicate).
	 */
	async function handleAdd(url: string, tagIds: string[] = []) {
		const article = await createArticle({ data: { url } });
		const results = await Promise.allSettled(
			tagIds.map((tagId) =>
				addTagToArticles({ data: { tagId, articleIds: [article.id] } }),
			),
		);
		queryClient.invalidateQueries({ queryKey: ["articles"] });
		queryClient.invalidateQueries({ queryKey: ["tags"] });
		router.invalidate();
		const failedTagCount = results.filter(
			(result) => result.status === "rejected",
		).length;
		return { article, failedTagCount };
	}

	return { handleAdd };
}
