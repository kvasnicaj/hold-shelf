import { ArticleCard } from "#/components/articles/article-card";
import type { ArticleWithTags } from "#/components/articles/types";
import type { Tag } from "#/components/tags/types";

type ArticleListProps = {
	articles: ArticleWithTags[];
	selected: Set<string>;
	onSelect: (id: string, selected: boolean) => void;
	onToggleRead: (id: string, isRead: boolean) => void;
	onDelete: (ids: string[]) => void;
	availableTags?: Tag[];
	onAddTag?: (tagId: string, articleIds: string[]) => void;
	onRemoveTag?: (tagId: string, articleIds: string[]) => void;
	onCreateTag?: (name: string) => Promise<Tag>;
};

export function ArticleList({
	articles,
	selected,
	onSelect,
	onToggleRead,
	onDelete,
	availableTags,
	onAddTag,
	onRemoveTag,
	onCreateTag,
}: ArticleListProps) {
	if (articles.length === 0) {
		return null;
	}

	return (
		<div className="space-y-2">
			{articles.map((article) => (
				<ArticleCard
					key={article.id}
					article={article}
					selected={selected.has(article.id)}
					onSelect={onSelect}
					onToggleRead={onToggleRead}
					onDelete={(id) => onDelete([id])}
					availableTags={availableTags}
					onAddTag={onAddTag}
					onRemoveTag={onRemoveTag}
					onCreateTag={onCreateTag}
				/>
			))}
		</div>
	);
}
