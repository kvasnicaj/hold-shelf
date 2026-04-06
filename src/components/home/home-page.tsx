import { getRouteApi } from "@tanstack/react-router";
import { SaveArticleToolbarAction } from "#/components/articles/save-article-toolbar-action";
import { useSaveArticle } from "#/components/articles/use-save-article";
import { EmptyLibraryCta } from "#/components/home/empty-library-cta";
import { HomeArchiveSearch } from "#/components/home/home-archive-search";
import { HomeStatsSection } from "#/components/home/home-stats-section";
import { RecentArticlesSection } from "#/components/home/recent-articles-section";

const route = getRouteApi("/app/home");

export function HomePage() {
	const { stats, recent } = route.useLoaderData();
	const { handleAdd } = useSaveArticle();

	return (
		<div className="mx-auto max-w-5xl space-y-6">
			<SaveArticleToolbarAction onAdd={handleAdd} />

			<div className="rise-in space-y-1">
				<h1 className="display-title text-3xl font-bold">
					Welcome to Hold Shelf
				</h1>
				<p className="text-muted-foreground">Your reading list, organized.</p>
			</div>

			<HomeArchiveSearch />
			<HomeStatsSection stats={stats} />
			<RecentArticlesSection
				recentlySaved={recent.recentlySaved}
				recentlyFavorite={recent.recentlyFavorite}
				oldestUnread={recent.oldestUnread}
			/>

			{stats.total === 0 && <EmptyLibraryCta />}
		</div>
	);
}
