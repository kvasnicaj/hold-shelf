import { ArticleCardActions } from "#/components/articles/article-card-actions";
import { ArticleExternalLink } from "#/components/articles/article-external-link";
import type { ArticleCardProps } from "#/components/articles/types";
import { Badge } from "#/components/ui/badge";
import { Checkbox } from "#/components/ui/checkbox";
import { formatTimeAgo } from "#/lib/formatters";

export function ArticleCardMobile({
	article,
	selected,
	onSelect,
	onOpenArticle,
	onToggleRead,
	onToggleFavorite,
	onDelete,
	availableTags,
	onAddTag,
	onRemoveTag,
	onCreateTag,
}: ArticleCardProps) {
	const timeAgo = article.createdAt ? formatTimeAgo(article.createdAt) : "";

	return (
		// biome-ignore lint/a11y/useSemanticElements: The composite card contains nested controls, so it cannot be a native button.
		<div
			className="cursor-pointer rounded-lg border p-4 transition-colors hover:bg-accent/50"
			onClick={() => void onOpenArticle(article.id, article.isRead)}
			onKeyDown={(event) => {
				if (event.key === "Enter") {
					void onOpenArticle(article.id, article.isRead);
				}
			}}
			role="button"
			tabIndex={0}
		>
			<div className="space-y-3">
				<ArticleExternalLink
					articleId={article.id}
					href={article.url}
					isRead={article.isRead}
					onOpenArticle={onOpenArticle}
					className="block break-words font-medium leading-snug no-underline hover:underline"
				>
					{article.title ?? article.hostname ?? article.url}
				</ArticleExternalLink>

				<div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
					{article.hostname && <span>{article.hostname}</span>}
					{article.hostname && timeAgo && <span>&middot;</span>}
					{timeAgo && <span>{timeAgo}</span>}
				</div>

				<div className="flex flex-wrap items-start gap-2">
					<div className="flex shrink-0 items-center gap-1">
						<Checkbox
							checked={selected}
							onCheckedChange={(checked) => onSelect(article.id, !!checked)}
							onClick={(event) => event.stopPropagation()}
						/>
						<ArticleCardActions
							articleId={article.id}
							isRead={article.isRead}
							isFavorite={article.isFavorite}
							tagIds={article.tags.map((tag) => tag.id)}
							availableTags={availableTags}
							persistent
							iconSize="mobile"
							onToggleRead={onToggleRead}
							onToggleFavorite={onToggleFavorite}
							onDelete={onDelete}
							onAddTag={onAddTag}
							onRemoveTag={onRemoveTag}
							onCreateTag={onCreateTag}
						/>
					</div>

					{article.tags.length > 0 ? (
						<div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
							{article.tags.map((tag) => (
								<Badge key={tag.id} variant="secondary" className="text-xs">
									{tag.name}
								</Badge>
							))}
						</div>
					) : null}
				</div>
			</div>
		</div>
	);
}
