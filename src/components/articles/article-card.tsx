import { ArticleCardActions } from "#/components/articles/article-card-actions";
import { ArticleCardContent } from "#/components/articles/article-card-content";
import type { ArticleWithTags } from "#/components/articles/types";
import type { Tag } from "#/components/tags/types";
import { Checkbox } from "#/components/ui/checkbox";
import { formatTimeAgo } from "#/lib/formatters";

type ArticleCardProps = {
	article: ArticleWithTags;
	selected: boolean;
	onSelect: (id: string, selected: boolean) => void;
	onToggleRead: (id: string, isRead: boolean) => void;
	onDelete: (id: string) => void;
	availableTags?: Tag[];
	onAddTag?: (tagId: string, articleIds: string[]) => void;
	onRemoveTag?: (tagId: string, articleIds: string[]) => void;
	onCreateTag?: (name: string) => Promise<Tag>;
};

export function ArticleCard({
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
		<div className="group flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/50">
			<Checkbox
				checked={selected}
				onCheckedChange={(checked) => onSelect(article.id, !!checked)}
				className="mt-1"
			/>

			<ArticleCardContent article={article} timeAgo={timeAgo} />
			<ArticleCardActions
				articleId={article.id}
				isRead={article.isRead}
				tagIds={article.tags.map((tag) => tag.id)}
				availableTags={availableTags}
				onToggleRead={onToggleRead}
				onDelete={onDelete}
				onAddTag={onAddTag}
				onRemoveTag={onRemoveTag}
				onCreateTag={onCreateTag}
			/>
		</div>
	);
}
