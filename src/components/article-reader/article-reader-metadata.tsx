import {
	getReadingTimeLabel,
	getUnreadAgeLabel,
} from "#/components/article-reader/helpers";
import type { ArticleReaderPayload } from "#/components/article-reader/types";
import { formatDate } from "#/lib/formatters";

type ArticleReaderMetadataProps = {
	payload: ArticleReaderPayload;
};

export function ArticleReaderMetadata({ payload }: ArticleReaderMetadataProps) {
	const { article, content } = payload;
	const unreadAge = getUnreadAgeLabel(article);
	const readingTime =
		content.status === "ready" ? getReadingTimeLabel(content.wordCount) : null;
	const parts = [
		article.hostname,
		readingTime,
		article.createdAt ? `Saved ${formatDate(article.createdAt)}` : null,
		unreadAge,
	].filter((part): part is string => Boolean(part));

	return (
		<p
			className="flex flex-wrap items-center gap-x-2 gap-y-1 font-sans text-[0.8125rem] text-muted-foreground"
			title={
				content.status === "ready"
					? `Saved copy captured ${content.fetchedAt.toLocaleString()}`
					: undefined
			}
		>
			{article.faviconUrl && (
				<img
					src={article.faviconUrl}
					alt=""
					className="size-4 rounded-[3px]"
					onError={(event) => {
						event.currentTarget.style.display = "none";
					}}
				/>
			)}
			{parts.map((part, index) => (
				<span key={part} className="tabular-nums">
					{index > 0 && (
						<span aria-hidden="true" className="mr-2">
							·
						</span>
					)}
					{part}
				</span>
			))}
		</p>
	);
}
