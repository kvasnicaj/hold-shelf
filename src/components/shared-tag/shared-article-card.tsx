import { ArrowSquareOut } from "@phosphor-icons/react";
import type { SharedArticle } from "#/components/shared-tag/types";
import { formatFullDate } from "#/lib/formatters";

type SharedArticleCardProps = {
	article: SharedArticle;
};

export function SharedArticleCard({ article }: SharedArticleCardProps) {
	return (
		<article className="-mx-2 px-2 py-4 transition-colors hover:bg-card">
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
							className="mt-0.5 size-4 shrink-0 rounded-[3px]"
							onError={(event) => {
								event.currentTarget.style.display = "none";
							}}
						/>
					) : null}
					<div className="min-w-0 flex-1">
						<div className="flex items-start gap-2">
							<h2 className="min-w-0 flex-1 text-[15px] leading-snug font-semibold text-foreground group-hover:underline">
								{article.title ?? article.hostname ?? article.url}
							</h2>
							<ArrowSquareOut className="mt-1 size-3.5 shrink-0 text-muted-foreground" />
						</div>
						{article.description ? (
							<p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
								{article.description}
							</p>
						) : null}
						<div className="mt-2 flex flex-wrap gap-x-2 text-xs text-muted-foreground">
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
