import { getUnreadAgeLabel } from "#/components/article-reader/helpers";
import { Shelf } from "#/components/home/shelf";
import { ShelfItem } from "#/components/home/shelf-item";
import type {
	InProgressArticle,
	RecentArticle,
	RecentlySavedArticle,
} from "#/components/home/types";
import { TagPicker } from "#/components/tags/tag-picker";
import type { Tag } from "#/components/tags/types";

type RecentArticlesSectionProps = {
	latestUnread: RecentArticle[];
	unreadCount: number;
	inProgress: InProgressArticle[];
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
	latestUnread,
	unreadCount,
	inProgress,
	recentlySaved,
	recentlyFavorite,
	oldestUnread,
	onOpenArticle,
	availableTags,
	onAddTag,
	onRemoveTag,
	onCreateTag,
}: RecentArticlesSectionProps) {
	const shownOnPhone = new Set(
		[...latestUnread, ...inProgress].map(({ id }) => id),
	);
	const otherInProgress = inProgress.slice(1);
	const hasOlderUnread = oldestUnread.some(({ id }) => !shownOnPhone.has(id));
	return (
		<div className="grid min-w-0 gap-x-8 gap-y-5 md:grid-cols-2 md:gap-y-10 xl:grid-cols-3">
			<Shelf
				className="md:hidden"
				title="Latest unread"
				href="/app/articles"
				linkLabel={unreadCount > 0 ? `All ${unreadCount}` : undefined}
				isEmpty={latestUnread.length === 0}
				emptyMessage="You’re all caught up."
			>
				{latestUnread.map((article) => (
					<ShelfItem
						key={article.id}
						article={article}
						onOpenArticle={onOpenArticle}
					/>
				))}
			</Shelf>
			{otherInProgress.length > 0 && (
				<Shelf title="In progress" className="md:hidden">
					{otherInProgress.map((article) => (
						<ShelfItem
							key={article.id}
							article={article}
							onOpenArticle={onOpenArticle}
							note={`${Math.round(article.progress / 100)}% read`}
						/>
					))}
				</Shelf>
			)}
			<Shelf
				className={hasOlderUnread ? undefined : "hidden md:block"}
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
						className={
							shownOnPhone.has(article.id) ? "hidden md:flex" : undefined
						}
					/>
				))}
			</Shelf>
			<Shelf
				className="hidden md:block"
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
				className="hidden md:block"
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
