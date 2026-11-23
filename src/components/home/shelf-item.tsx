import type { ReactNode } from "react";
import { ArticleExternalLink } from "#/components/articles/article-external-link";
import { ReadStateSpine } from "#/components/articles/read-state-spine";
import { ArticleSource } from "#/components/home/article-source";
import type { RecentArticle } from "#/components/home/types";
import { cn } from "#/lib/utils";

type ShelfItemProps = {
	article: RecentArticle;
	onOpenArticle: (id: string, isRead: boolean) => void | Promise<void>;
	note?: string | null;
	actions?: ReactNode;
	className?: string;
};

export function ShelfItem({
	article,
	onOpenArticle,
	note,
	actions,
	className,
}: ShelfItemProps) {
	return (
		<li
			className={cn(
				"group/item relative flex items-start gap-2.5 border-b py-2.5 md:gap-2 md:py-3.5",
				className,
			)}
		>
			<ReadStateSpine isRead={article.isRead} className="mt-1 h-4 md:hidden" />
			<div className="min-w-0 flex-1 space-y-0.5 md:space-y-1.5">
				<ArticleExternalLink
					articleId={article.id}
					href={article.url}
					isRead={article.isRead}
					onOpenArticle={onOpenArticle}
					className={cn(
						"block font-serif text-lg leading-tight no-underline hover:underline md:text-base md:leading-snug md:text-pretty",
						!actions && "after:absolute after:inset-0 md:after:hidden",
						article.isRead
							? "font-normal text-muted-foreground"
							: "font-semibold text-foreground",
					)}
				>
					<span className="line-clamp-2 wrap-anywhere">
						{article.title ?? article.hostname ?? article.url}
					</span>
				</ArticleExternalLink>
				<div className="flex min-w-0 items-center gap-1.5 text-meta text-muted-foreground">
					<ArticleSource article={article} />
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
