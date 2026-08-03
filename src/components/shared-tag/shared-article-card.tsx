import { ExternalLink } from "lucide-react";
import type { SharedArticle } from "#/components/shared-tag/types";
import { formatFullDate } from "#/lib/formatters";

type SharedArticleCardProps = {
	article: SharedArticle;
};

export function SharedArticleCard({ article }: SharedArticleCardProps) {
	return (
		<article className="rounded-xl border bg-card p-4 shadow-sm transition-colors hover:bg-accent/40">
			<a
				href={article.url}
				target="_blank"
				rel="noopener noreferrer"
				referrerPolicy="no-referrer"
				className="group block min-w-0 no-underline"
			>
				<div className="flex items-start gap-3">
					{article.faviconUrl ? (
						<img
							src={article.faviconUrl}
							alt=""
							referrerPolicy="no-referrer"
							className="mt-0.5 size-5 shrink-0"
							onError={(event) => {
								event.currentTarget.style.display = "none";
							}}
						/>
					) : null}
					<div className="min-w-0 flex-1">
						<div className="flex items-start gap-2">
							<h2 className="min-w-0 flex-1 font-semibold text-foreground group-hover:underline">
								{article.title ?? article.hostname ?? article.url}
							</h2>
							<ExternalLink className="mt-1 size-3.5 shrink-0 text-muted-foreground" />
						</div>
						{article.description ? (
							<p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
								{article.description}
							</p>
						) : null}
						<div className="mt-3 flex flex-wrap gap-x-2 text-xs text-muted-foreground">
							{article.hostname ? <span>{article.hostname}</span> : null}
							{article.hostname ? <span aria-hidden="true">·</span> : null}
							<span>Saved {formatFullDate(article.createdAt)}</span>
						</div>
					</div>
				</div>
			</a>
		</article>
	);
}
