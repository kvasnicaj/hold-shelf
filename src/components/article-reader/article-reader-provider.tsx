import { useMemo, useState } from "react";
import { ArticleReaderContext } from "#/components/article-reader/use-article-reader";

type ArticleReaderProviderProps = {
	children: React.ReactNode;
};

export function ArticleReaderProvider({
	children,
}: ArticleReaderProviderProps) {
	const [articleId, setArticleId] = useState<string | null>(null);

	const value = useMemo(
		() => ({
			articleId,
			isOpen: Boolean(articleId),
			openArticle: (id: string) => setArticleId(id),
			closeArticle: () => setArticleId(null),
		}),
		[articleId],
	);

	return (
		<ArticleReaderContext.Provider value={value}>
			{children}
		</ArticleReaderContext.Provider>
	);
}
