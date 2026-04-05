import { ArticleCard } from "#/components/articles/article-card";
import { ArticleCardMobile } from "#/components/articles/article-card-mobile";
import type { ArticleWithTags } from "#/components/articles/types";
import type { Tag } from "#/components/tags/types";
import { useIsMobile } from "#/hooks/use-mobile";

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
	const isMobile = useIsMobile();

	if (articles.length === 0) {
		return null;
	}

	const CardComponent = isMobile ? ArticleCardMobile : ArticleCard;

	return (
		<div className="space-y-2">
			{articles.map((article) => (
				<CardComponent
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
