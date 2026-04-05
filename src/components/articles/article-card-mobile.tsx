import { ArticleCardActions } from "#/components/articles/article-card-actions";
import type { ArticleCardProps } from "#/components/articles/types";
import { Badge } from "#/components/ui/badge";
import { Checkbox } from "#/components/ui/checkbox";
import { formatTimeAgo } from "#/lib/formatters";

export function ArticleCardMobile({
	article,
	selected,
	onSelect,
	onToggleRead,
	onDelete,
	availableTags,
	onAddTag,
	onRemoveTag,
	onCreateTag,
}: ArticleCardProps) {
	const timeAgo = article.createdAt ? formatTimeAgo(article.createdAt) : "";

	return (
		<div className="rounded-lg border p-4">
			<div className="space-y-3">
				<a
					href={article.url}
					target="_blank"
					rel="noopener noreferrer"
					className="block break-words font-medium leading-snug no-underline hover:underline"
				>
					{article.title ?? article.hostname ?? article.url}
				</a>

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
						/>
						<ArticleCardActions
							articleId={article.id}
							isRead={article.isRead}
							tagIds={article.tags.map((tag) => tag.id)}
							availableTags={availableTags}
							persistent
							onToggleRead={onToggleRead}
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
