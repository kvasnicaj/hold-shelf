import { ArticleExternalLink } from "#/components/articles/article-external-link";
import type { ArticleWithTags } from "#/components/articles/types";
import { Badge } from "#/components/ui/badge";
import { cn } from "#/lib/utils";

type ArticleCardContentProps = {
	article: ArticleWithTags;
	onOpenArticle: (id: string, isRead: boolean) => void | Promise<void>;
	timeAgo: string;
};

export function ArticleCardContent({
	article,
	onOpenArticle,
	timeAgo,
}: ArticleCardContentProps) {
	return (
		<div className="min-w-0 flex-1 space-y-1">
			<div className="flex min-w-0 items-center gap-2">
				{article.faviconUrl && (
					<img
						src={article.faviconUrl}
						alt=""
						className="size-4 shrink-0 rounded-[3px]"
						onError={(e) => {
							e.currentTarget.style.display = "none";
						}}
					/>
				)}
				<ArticleExternalLink
					articleId={article.id}
					href={article.url}
					isRead={article.isRead}
					onOpenArticle={onOpenArticle}
					className={cn(
						"truncate text-[15px] font-semibold leading-snug no-underline hover:underline",
						article.isRead ? "text-muted-foreground" : "text-foreground",
					)}
				>
					{article.title ?? article.hostname ?? article.url}
				</ArticleExternalLink>
			</div>

			{article.description && (
				<p className="line-clamp-2 max-w-[70ch] text-sm leading-relaxed text-muted-foreground">
					{article.description}
				</p>
			)}

			<div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 pt-0.5 text-xs text-muted-foreground">
				{article.hostname && <span>{article.hostname}</span>}
				{article.hostname && timeAgo && <span aria-hidden="true">·</span>}
				{timeAgo && <span className="tabular-nums">{timeAgo}</span>}
				{article.tags.map((tag) => (
					<Badge
						key={tag.id}
						variant="secondary"
						className="ml-0.5 px-1.5 py-0 text-[11px] font-semibold"
					>
						{tag.name}
					</Badge>
				))}
			</div>
		</div>
	);
}
