import { getUnreadAgeLabel } from "#/components/article-reader/helpers";
import { ArticleExternalLink } from "#/components/articles/article-external-link";
import { ArticleMetaLine } from "#/components/articles/article-meta-line";
import { ArticleRowMenu } from "#/components/articles/article-row-menu";
import { ArticleStateMarks } from "#/components/articles/article-state-marks";
import type { ArticleCardProps } from "#/components/articles/types";
import { Checkbox } from "#/components/ui/checkbox";
import { formatTimeAgo } from "#/lib/formatters";
import { cn } from "#/lib/utils";

export function ArticleCardMobile({
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
	// Unread articles show how long they have waited; read ones show when they were saved.
	const timeAgo =
		getUnreadAgeLabel(article) ??
		(article.createdAt ? formatTimeAgo(article.createdAt) : "");

	// While selecting, a tap toggles the row instead of opening the article.
	function activate() {
		if (selectionMode) {
			onSelect(article.id, !selected);
			return;
		}
		void onOpenArticle(article.id, article.isRead);
	}

	return (
		<article
			className={cn(
				"grid cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-2.5 py-3 pr-1 pl-3",
				selected && "bg-select",
			)}
			onClick={activate}
			onKeyDown={(event) => {
				if (event.key === "Enter" && event.target === event.currentTarget) {
					activate();
				}
			}}
			aria-label={article.title ?? article.url}
		>
			<div className="flex items-center gap-3 pt-0.5">
				{selectionMode && (
					<Checkbox
						aria-label={`Select ${article.title ?? article.url}`}
						checked={selected}
						onCheckedChange={(checked) => onSelect(article.id, !!checked)}
						onClick={(event) => event.stopPropagation()}
						className="ml-1"
					/>
				)}
				<ArticleStateMarks
					isRead={article.isRead}
					isFavorite={article.isFavorite}
				/>
			</div>
			<div className="min-w-0 space-y-1.5 py-0.5">
				<ArticleExternalLink
					articleId={article.id}
					href={article.url}
					isRead={article.isRead}
					onOpenArticle={onOpenArticle}
					onClick={(event) => {
						if (!selectionMode) return;
						event.preventDefault();
						event.stopPropagation();
						activate();
					}}
					className={cn(
						"line-clamp-2 break-words text-[15px] leading-snug no-underline",
						article.isRead
							? "font-normal text-muted-foreground"
							: "font-semibold text-foreground",
					)}
				>
					{article.title ?? article.hostname ?? article.url}
				</ArticleExternalLink>
				<ArticleMetaLine
					hostname={article.hostname}
					timeAgo={timeAgo}
					tags={article.tags}
				/>
			</div>
			<ArticleRowMenu
				article={article}
				triggerSize="icon-touch"
				triggerClassName="-mt-2.5 text-muted-foreground"
				selected={selected}
				onSelect={onSelect}
				onToggleRead={onToggleRead}
				onToggleFavorite={onToggleFavorite}
				onDelete={onDelete}
				availableTags={availableTags}
				onAddTag={onAddTag}
				onRemoveTag={onRemoveTag}
				onCreateTag={onCreateTag}
			/>
		</article>
	);
}
