import { ArticleExternalLink } from "#/components/articles/article-external-link";
import { ArticleMetaLine } from "#/components/articles/article-meta-line";
import type { ArticleWithTags } from "#/components/articles/types";
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
			<div className="flex min-w-0 items-start gap-2">
				{article.faviconUrl && (
					<img
						src={article.faviconUrl}
						alt=""
						className="mt-[0.1875rem] size-4 shrink-0 rounded-[3px]"
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
						"line-clamp-2 text-[15px] leading-snug break-words no-underline hover:underline",
						article.isRead
							? "font-normal text-muted-foreground"
							: "font-semibold text-foreground",
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

			<ArticleMetaLine
				hostname={article.hostname}
				timeAgo={timeAgo}
				tags={article.tags}
				className="pt-0.5"
			/>
		</div>
	);
}
