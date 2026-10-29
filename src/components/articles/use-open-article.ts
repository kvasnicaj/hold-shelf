import { useArticleReader } from "#/components/article-reader/use-article-reader";

/**
 * Opens an article in the reader. Opening only records the reading position;
 * the reader marks the article read when you reach the end.
 */
export function useOpenArticle() {
	const { openArticle } = useArticleReader();

	async function handleOpenArticle(id: string, _isRead?: boolean) {
		openArticle(id);
	}

	return { handleOpenArticle };
}
