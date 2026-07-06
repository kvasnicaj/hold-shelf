import { getRouteApi } from "@tanstack/react-router";
import { useAutoMarkReadOnOpen } from "#/components/articles/use-auto-mark-read-on-open";
import { EmptyLibraryCta } from "#/components/home/empty-library-cta";
import { HomeStatsSection } from "#/components/home/home-stats-section";
import { RecentArticlesSection } from "#/components/home/recent-articles-section";

const route = getRouteApi("/app/home");

export function HomePage() {
	const { stats, recent } = route.useLoaderData();
	const { handleOpenArticle } = useAutoMarkReadOnOpen();

	return (
		<div className="w-full space-y-6">
			<div className="rise-in space-y-1">
				<h1 className="display-title text-3xl font-bold">
					Welcome to Hold Shelf
				</h1>
				<p className="text-muted-foreground">Your reading list, organized.</p>
			</div>

			<HomeStatsSection stats={stats} />
			<RecentArticlesSection
				recentlySaved={recent.recentlySaved}
				recentlyFavorite={recent.recentlyFavorite}
				oldestUnread={recent.oldestUnread}
				onOpenArticle={handleOpenArticle}
			/>

			{stats.total === 0 && <EmptyLibraryCta />}
		</div>
	);
}
