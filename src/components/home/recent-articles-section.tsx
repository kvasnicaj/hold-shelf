import { BookOpen, Clock } from "lucide-react";
import { ArticleLink } from "#/components/home/article-link";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";

type RecentArticle = {
	id: string;
	url: string;
	title: string | null;
	hostname: string | null;
	faviconUrl: string | null;
};

type RecentArticlesSectionProps = {
	recentlySaved: RecentArticle[];
	oldestUnread: RecentArticle[];
};

export function RecentArticlesSection({
	recentlySaved,
	oldestUnread,
}: RecentArticlesSectionProps) {
	return (
		<div className="grid gap-6 lg:grid-cols-2">
			{recentlySaved.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-base">
							<Clock className="h-4 w-4" />
							Recently saved
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{recentlySaved.map((article) => (
							<ArticleLink key={article.id} article={article} />
						))}
					</CardContent>
				</Card>
			)}

			{oldestUnread.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-base">
							<BookOpen className="h-4 w-4" />
							Oldest unread
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{oldestUnread.map((article) => (
							<ArticleLink key={article.id} article={article} />
						))}
					</CardContent>
				</Card>
			)}
		</div>
	);
}
