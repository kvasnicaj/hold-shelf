import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { createArticle } from "#/server/articles";
import { addTagToArticles } from "#/server/tags";

export function useSaveArticle() {
	const queryClient = useQueryClient();
	const router = useRouter();

	/** Saves a link, assigns the chosen tags and returns the new article. */
	async function handleAdd(url: string, tagIds: string[] = []) {
		const article = await createArticle({ data: { url } });
		for (const tagId of tagIds) {
			await addTagToArticles({ data: { tagId, articleIds: [article.id] } });
		}
		queryClient.invalidateQueries({ queryKey: ["articles"] });
		queryClient.invalidateQueries({ queryKey: ["tags"] });
		router.invalidate();
		return article;
	}

	return { handleAdd };
}
