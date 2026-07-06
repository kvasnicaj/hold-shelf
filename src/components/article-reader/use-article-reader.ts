import { createContext, useContext } from "react";
import type { ArticleReaderContextValue } from "#/components/article-reader/types";

export const ArticleReaderContext =
	createContext<ArticleReaderContextValue | null>(null);

export function useArticleReader() {
	const context = useContext(ArticleReaderContext);
	if (!context) {
		throw new Error(
			"useArticleReader must be used within ArticleReaderProvider.",
		);
	}

	return context;
}
