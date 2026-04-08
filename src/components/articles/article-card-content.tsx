import { ExternalLink } from "lucide-react";
import { ArticleExternalLink } from "#/components/articles/article-external-link";
import type { ArticleWithTags } from "#/components/articles/types";
import { Badge } from "#/components/ui/badge";

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
		<div className="min-w-0 flex-1">
			<div className="flex items-center gap-2">
				{article.faviconUrl && (
					<img
						src={article.faviconUrl}
						alt=""
						className="h-5 w-5 shrink-0"
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
					className="truncate font-medium no-underline hover:underline"
				>
					{article.title ?? article.hostname ?? article.url}
				</ArticleExternalLink>
				<ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
			</div>

			{article.description && (
				<p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
					{article.description}
				</p>
			)}

			<div className="mt-2 flex items-center gap-2">
				{article.hostname && (
					<span className="text-xs text-muted-foreground">
						{article.hostname}
					</span>
				)}
				{timeAgo && (
					<>
						<span className="text-xs text-muted-foreground">·</span>
						<span className="text-xs text-muted-foreground">{timeAgo}</span>
					</>
				)}
				{article.tags.map((tag) => (
					<Badge key={tag.id} variant="secondary" className="text-xs">
						{tag.name}
					</Badge>
				))}
			</div>
		</div>
	);
}
