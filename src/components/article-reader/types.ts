import type { ArticleWithTags } from "#/components/articles/types";
import type { ArticleReaderContent } from "#/server/article-content";

export type ArticleReaderPayload = {
	article: ArticleWithTags & {
		readAt?: Date | null;
		updatedAt?: Date | null;
	};
	content: ArticleReaderContent;
};

export type ArticleReaderContextValue = {
	articleId: string | null;
	isOpen: boolean;
	openArticle: (id: string) => void;
	closeArticle: () => void;
};
