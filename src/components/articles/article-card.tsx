import { ArticleCardActions } from "#/components/articles/article-card-actions";
import { ArticleCardContent } from "#/components/articles/article-card-content";
import type { ArticleCardProps } from "#/components/articles/types";
import { Checkbox } from "#/components/ui/checkbox";
import { formatTimeAgo } from "#/lib/formatters";

export function ArticleCard({
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
		<div className="group flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/50">
			<Checkbox
				checked={selected}
				onCheckedChange={(checked) => onSelect(article.id, !!checked)}
				className="mt-1"
			/>

			<ArticleCardContent
				article={article}
				onOpenArticle={onOpenArticle}
				timeAgo={timeAgo}
			/>
			<ArticleCardActions
				articleId={article.id}
				isRead={article.isRead}
				isFavorite={article.isFavorite}
				tagIds={article.tags.map((tag) => tag.id)}
				availableTags={availableTags}
				onToggleRead={onToggleRead}
				onToggleFavorite={onToggleFavorite}
				onDelete={onDelete}
				onAddTag={onAddTag}
				onRemoveTag={onRemoveTag}
				onCreateTag={onCreateTag}
			/>
		</div>
	);
}
