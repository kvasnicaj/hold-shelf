import { ExternalLink } from "lucide-react";
import { ArticleExternalLink } from "#/components/articles/article-external-link";

type ArticleLinkProps = {
	article: {
		id: string;
		url: string;
		title: string | null;
		hostname: string | null;
		faviconUrl: string | null;
		isRead: boolean;
	};
	onOpenArticle: (id: string, isRead: boolean) => void | Promise<void>;
	variant?: "compact" | "with-site-column";
};

export function ArticleLink({
	article,
	onOpenArticle,
	variant = "compact",
}: ArticleLinkProps) {
	const isDetailed = variant === "with-site-column";

	return (
		<ArticleExternalLink
			articleId={article.id}
			href={article.url}
			isRead={article.isRead}
			onOpenArticle={onOpenArticle}
			className={
				isDetailed
					? "grid w-full min-w-0 grid-cols-[minmax(0,1fr)_minmax(7rem,auto)_auto] items-center gap-3 overflow-hidden rounded-md px-2 py-2 text-sm no-underline transition-colors hover:bg-accent"
					: "flex w-full min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 py-1.5 text-sm no-underline transition-colors hover:bg-accent"
			}
		>
			<div className="flex min-w-0 items-center gap-2">
				{article.faviconUrl && (
					<img
						src={article.faviconUrl}
						alt=""
						className="h-4 w-4 shrink-0"
						onError={(e) => {
							e.currentTarget.style.display = "none";
						}}
					/>
				)}
				<span className="min-w-0 flex-1 truncate">
					{article.title ?? article.hostname}
				</span>
			</div>
			{isDetailed && (
				<span className="truncate text-right text-xs text-muted-foreground">
					{article.hostname ?? new URL(article.url).hostname}
				</span>
			)}
			<ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
		</ArticleExternalLink>
	);
}
