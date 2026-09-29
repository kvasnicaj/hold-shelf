import {
	getReadingTimeLabel,
	getUnreadAgeLabel,
} from "#/components/article-reader/helpers";
import type { ArticleReaderPayload } from "#/components/article-reader/types";
import { Badge } from "#/components/ui/badge";
import { formatDate } from "#/lib/formatters";

type ArticleReaderMetadataProps = {
	payload: ArticleReaderPayload;
};

export function ArticleReaderMetadata({ payload }: ArticleReaderMetadataProps) {
	const { article, content } = payload;
	const unreadAge = getUnreadAgeLabel(article);
	const readingTime =
		content.status === "ready" ? getReadingTimeLabel(content.wordCount) : null;

	return (
		<div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
			{article.hostname && <span>{article.hostname}</span>}
			{article.createdAt && <span>Saved {formatDate(article.createdAt)}</span>}

			{unreadAge && <Badge variant="secondary">{unreadAge}</Badge>}
			{readingTime && <Badge variant="outline">{readingTime}</Badge>}
			{content.status === "ready" && (
				<span title={`Captured ${content.fetchedAt.toLocaleString()}`}>
					Saved content
				</span>
			)}
		</div>
	);
}
