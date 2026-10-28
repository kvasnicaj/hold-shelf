import { ArticleCard } from "#/components/articles/article-card";
import { ArticleCardMobile } from "#/components/articles/article-card-mobile";
import type { ArticleWithTags } from "#/components/articles/types";
import type { Tag } from "#/components/tags/types";
import { useIsMobile } from "#/hooks/use-mobile";

type ArticleListProps = {
	articles: ArticleWithTags[];
	selected: Set<string>;
	onSelect: (id: string, selected: boolean) => void;
	onOpenArticle: (id: string, isRead: boolean) => void | Promise<void>;
	onToggleRead: (id: string, isRead: boolean) => void;
	onToggleFavorite: (id: string, isFavorite: boolean) => void;
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
	onOpenArticle,
	onToggleRead,
	onToggleFavorite,
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
		<div className="-mx-3 divide-y border-y bg-card sm:-mx-6 md:mx-0 md:bg-transparent">
			{articles.map((article) => (
				<CardComponent
					key={article.id}
					article={article}
					selected={selected.has(article.id)}
					selectionMode={selected.size > 0}
					onSelect={onSelect}
					onOpenArticle={onOpenArticle}
					onToggleRead={onToggleRead}
					onToggleFavorite={onToggleFavorite}
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
