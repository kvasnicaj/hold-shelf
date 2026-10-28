import type { ReactNode } from "react";
import { ArticleExternalLink } from "#/components/articles/article-external-link";
import type { RecentArticle } from "#/components/home/types";

type ShelfItemProps = {
	article: RecentArticle;
	onOpenArticle: (id: string, isRead: boolean) => void | Promise<void>;
	note?: string | null;
	actions?: ReactNode;
};

export function ShelfItem({
	article,
	onOpenArticle,
	note,
	actions,
}: ShelfItemProps) {
	return (
		<li className="group/item flex items-start gap-2 border-b py-3.5">
			<div className="min-w-0 flex-1 space-y-1.5">
				<ArticleExternalLink
					articleId={article.id}
					href={article.url}
					isRead={article.isRead}
					onOpenArticle={onOpenArticle}
					className="line-clamp-2 font-serif text-base leading-snug font-semibold text-pretty text-foreground no-underline hover:underline"
				>
					{article.title ?? article.hostname ?? article.url}
				</ArticleExternalLink>
				<div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
					{article.faviconUrl && (
						<img
							src={article.faviconUrl}
							alt=""
							className="size-3.5 shrink-0 rounded-[3px]"
							onError={(event) => {
								event.currentTarget.style.display = "none";
							}}
						/>
					)}
					<span className="truncate">
						{article.hostname ?? new URL(article.url).hostname}
					</span>
					{note && (
						<>
							<span aria-hidden="true">·</span>
							<span className="shrink-0">{note}</span>
						</>
					)}
				</div>
			</div>
			{actions && (
				<div className="shrink-0 opacity-0 transition-opacity group-hover/item:opacity-100 group-focus-within/item:opacity-100">
					{actions}
				</div>
			)}
		</li>
	);
}
