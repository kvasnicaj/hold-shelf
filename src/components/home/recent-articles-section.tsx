import { getUnreadAgeLabel } from "#/components/article-reader/helpers";
import { Shelf } from "#/components/home/shelf";
import { ShelfItem } from "#/components/home/shelf-item";
import type {
	RecentArticle,
	RecentlySavedArticle,
} from "#/components/home/types";
import { TagPicker } from "#/components/tags/tag-picker";
import type { Tag } from "#/components/tags/types";

type RecentArticlesSectionProps = {
	recentlySaved: RecentlySavedArticle[];
	recentlyFavorite: RecentArticle[];
	oldestUnread: RecentArticle[];
	onOpenArticle: (id: string, isRead: boolean) => void | Promise<void>;
	availableTags: Tag[];
	onAddTag: (tagId: string, articleIds: string[]) => void;
	onRemoveTag: (tagId: string, articleIds: string[]) => void;
	onCreateTag: (name: string) => Promise<Tag>;
};

export function RecentArticlesSection({
	recentlySaved,
	recentlyFavorite,
	oldestUnread,
	onOpenArticle,
	availableTags,
	onAddTag,
	onRemoveTag,
	onCreateTag,
}: RecentArticlesSectionProps) {
	return (
		<div className="grid min-w-0 gap-x-8 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
			<Shelf
				title="Oldest unread"
				href="/app/articles"
				linkLabel="Unread"
				isEmpty={oldestUnread.length === 0}
				emptyMessage="No unread articles right now."
			>
				{oldestUnread.map((article) => (
					<ShelfItem
						key={article.id}
						article={article}
						onOpenArticle={onOpenArticle}
						note={getUnreadAgeLabel(article)}
					/>
				))}
			</Shelf>
			<Shelf
				title="Recently saved"
				href="/app/archive"
				linkLabel="Library"
				isEmpty={recentlySaved.length === 0}
				emptyMessage="Nothing saved yet."
			>
				{recentlySaved.map((article) => (
					<ShelfItem
						key={article.id}
						article={article}
						onOpenArticle={onOpenArticle}
						actions={
							<TagPicker
								availableTags={availableTags}
								selectedTagIds={article.tags.map((tag) => tag.id)}
								onAddTag={onAddTag}
								onRemoveTag={onRemoveTag}
								onCreateTag={onCreateTag}
								articleIds={[article.id]}
							/>
						}
					/>
				))}
			</Shelf>
			<Shelf
				title="Favorites"
				href="/app/favorites"
				linkLabel="All"
				isEmpty={recentlyFavorite.length === 0}
				emptyMessage="Bookmark an article to keep it here."
			>
				{recentlyFavorite.map((article) => (
					<ShelfItem
						key={article.id}
						article={article}
						onOpenArticle={onOpenArticle}
					/>
				))}
			</Shelf>
		</div>
	);
}
