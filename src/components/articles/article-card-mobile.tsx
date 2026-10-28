import { ArticleCardActions } from "#/components/articles/article-card-actions";
import { ArticleExternalLink } from "#/components/articles/article-external-link";
import { ReadStateSpine } from "#/components/articles/read-state-spine";
import type { ArticleCardProps } from "#/components/articles/types";
import { Badge } from "#/components/ui/badge";
import { Checkbox } from "#/components/ui/checkbox";
import { formatTimeAgo } from "#/lib/formatters";
import { cn } from "#/lib/utils";

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
			className={cn(
				"grid cursor-pointer grid-cols-[6px_minmax(0,1fr)] gap-x-2.5 py-3.5 pr-3 pl-3",
				selected && "bg-select",
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
			<ReadStateSpine isRead={article.isRead} className="mt-1" />
			<div className="min-w-0 space-y-2">
				<ArticleExternalLink
					articleId={article.id}
					href={article.url}
					isRead={article.isRead}
					onOpenArticle={onOpenArticle}
					className={cn(
						"line-clamp-2 break-words text-[15px] leading-snug font-semibold no-underline",
						article.isRead ? "text-muted-foreground" : "text-foreground",
					)}
				>
					{article.title ?? article.hostname ?? article.url}
				</ArticleExternalLink>
				<div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
					{article.hostname && <span>{article.hostname}</span>}
					{article.hostname && timeAgo && <span aria-hidden="true">·</span>}
					{timeAgo && <span className="tabular-nums">{timeAgo}</span>}
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<div className="-ml-1 flex shrink-0 items-center gap-1">
						<Checkbox
							aria-label={`Select ${article.title ?? article.url}`}
							checked={selected}
							onCheckedChange={(checked) => onSelect(article.id, !!checked)}
							onClick={(event) => event.stopPropagation()}
							className="mx-1"
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
						<div className="flex min-w-0 flex-1 flex-wrap gap-1">
							{article.tags.map((tag) => (
								<Badge
									key={tag.id}
									variant="secondary"
									className="px-1.5 py-0 text-[11px] font-semibold"
								>
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
