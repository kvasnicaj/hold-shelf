import { ArticleCardActions } from "#/components/articles/article-card-actions";
import { ArticleCardContent } from "#/components/articles/article-card-content";
import { ReadStateSpine } from "#/components/articles/read-state-spine";
import type { ArticleCardProps } from "#/components/articles/types";
import { Checkbox } from "#/components/ui/checkbox";
import { formatTimeAgo } from "#/lib/formatters";
import { cn } from "#/lib/utils";

export function ArticleCard({
	article,
	selected,
	selectionMode = false,
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
			className={cn(
				"group flex cursor-pointer items-start gap-3 px-2 py-4 transition-colors hover:bg-background",
				selected && "bg-select hover:bg-select",
			)}
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
				className={cn(
					"mt-1 transition-opacity focus-visible:opacity-100 group-hover:opacity-100",
					selected || selectionMode ? "opacity-100" : "opacity-0",
				)}
			/>
			<ReadStateSpine isRead={article.isRead} className="mt-1" />

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
