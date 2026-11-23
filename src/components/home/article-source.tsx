import type { RecentArticle } from "#/components/home/types";

type ArticleSourceProps = {
	article: Pick<RecentArticle, "hostname" | "url" | "faviconUrl">;
};

export function ArticleSource({ article }: ArticleSourceProps) {
	return (
		<span className="flex min-w-0 items-center gap-1.5">
			{article.faviconUrl && (
				<img
					src={article.faviconUrl}
					alt=""
					className="hidden size-3.5 shrink-0 rounded-[3px] md:block"
					onError={(event) => {
						event.currentTarget.style.display = "none";
					}}
				/>
			)}
			<span className="truncate">
				{article.hostname ?? new URL(article.url).hostname}
			</span>
		</span>
	);
}
