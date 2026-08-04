import { BookMarked, BookOpen, Clock } from "lucide-react";
import { getUnreadAgeLabel } from "#/components/article-reader/helpers";
import { ArticleLink } from "#/components/home/article-link";
import { TagPicker } from "#/components/tags/tag-picker";
import type { Tag } from "#/components/tags/types";
import { Badge } from "#/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";

type RecentArticle = {
	id: string;
	url: string;
	title: string | null;
	hostname: string | null;
	faviconUrl: string | null;
	isRead: boolean;
	createdAt?: Date | null;
};

type RecentlySavedArticle = RecentArticle & {
	tags: Tag[];
};

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
	const hasSecondaryCards = recentlySaved.length > 0 || oldestUnread.length > 0;

	return (
		<div className="space-y-6">
			{recentlyFavorite.length > 0 && (
				<Card className="min-w-0 gap-4 overflow-hidden">
					<CardHeader>
						<CardTitle className="flex min-w-0 items-center gap-2 text-base">
							<BookMarked className="h-4 w-4" />
							Favorites
						</CardTitle>
					</CardHeader>
					<CardContent className="min-w-0 space-y-2">
						{recentlyFavorite.map((article) => (
							<ArticleLink
								key={article.id}
								article={article}
								onOpenArticle={onOpenArticle}
								variant="with-site-column"
							/>
						))}
					</CardContent>
				</Card>
			)}

			{hasSecondaryCards && (
				<div className="grid min-w-0 gap-6 lg:grid-cols-2">
					{recentlySaved.length > 0 && (
						<Card className="min-w-0 gap-4 overflow-hidden">
							<CardHeader>
								<CardTitle className="flex min-w-0 items-center gap-2 text-base">
									<Clock className="h-4 w-4" />
									Recently saved
								</CardTitle>
							</CardHeader>
							<CardContent className="min-w-0 space-y-2">
								{recentlySaved.map((article) => (
									<div
										key={article.id}
										className="flex min-w-0 items-center gap-1"
									>
										<ArticleLink
											article={article}
											onOpenArticle={onOpenArticle}
										/>
										<TagPicker
											availableTags={availableTags}
											selectedTagIds={article.tags.map((tag) => tag.id)}
											onAddTag={onAddTag}
											onRemoveTag={onRemoveTag}
											onCreateTag={onCreateTag}
											articleIds={[article.id]}
										/>
									</div>
								))}
							</CardContent>
						</Card>
					)}

					<Card className="min-w-0 gap-4 overflow-hidden">
						<CardHeader>
							<CardTitle className="flex min-w-0 items-center gap-2 text-base">
								<BookOpen className="h-4 w-4" />
								Oldest unread
							</CardTitle>
						</CardHeader>
						<CardContent className="min-w-0 space-y-2">
							{oldestUnread.length > 0 ? (
								oldestUnread.map((article) => {
									const unreadAge = getUnreadAgeLabel(article);

									return (
										<ArticleLink
											key={article.id}
											article={article}
											onOpenArticle={onOpenArticle}
											metadata={
												unreadAge ? (
													<Badge
														variant="secondary"
														className="shrink-0 text-[0.6875rem]"
													>
														{unreadAge}
													</Badge>
												) : null
											}
										/>
									);
								})
							) : (
								<p className="px-2 py-1.5 text-sm text-muted-foreground">
									No unread articles right now.
								</p>
							)}
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}
