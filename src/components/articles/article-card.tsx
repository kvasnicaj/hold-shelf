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
		// biome-ignore lint/a11y/useSemanticElements: The composite card contains nested controls, so it cannot be a native button.
		<div
			className="group flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/50"
			onClick={() => void onOpenArticle(article.id, article.isRead)}
			onKeyDown={(event) => {
				if (event.key === "Enter" && event.target === event.currentTarget) {
					void onOpenArticle(article.id, article.isRead);
				}
			}}
			role="button"
			tabIndex={0}
		>
			<Checkbox
				aria-label={`Select ${article.title ?? article.url}`}
				checked={selected}
				onCheckedChange={(checked) => onSelect(article.id, !!checked)}
				onClick={(event) => event.stopPropagation()}
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
