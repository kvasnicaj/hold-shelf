import { getRouteApi } from "@tanstack/react-router";
import { useArticleMutations } from "#/components/articles/use-article-mutations";
import { useOpenArticle } from "#/components/articles/use-open-article";
import { ContinueReadingSection } from "#/components/home/continue-reading-section";
import { EmptyLibraryCta } from "#/components/home/empty-library-cta";
import { getHomeSummary } from "#/components/home/helpers";
import { HomeStatsSection } from "#/components/home/home-stats-section";
import { RecentArticlesSection } from "#/components/home/recent-articles-section";

const route = getRouteApi("/app/home");

export function HomePage() {
	const { stats, recent, tags } = route.useLoaderData();
	const { handleOpenArticle } = useOpenArticle();
	const { handleAddTag, handleRemoveTag, handleCreateTag } =
		useArticleMutations();

	return (
		<div className="w-full space-y-8">
			<header className="space-y-2">
				<h1 className="font-serif text-[2rem] leading-tight font-semibold text-balance">
					Make time for a good read
				</h1>
				<p className="text-[15px] text-muted-foreground">
					{getHomeSummary(stats)}
				</p>
				<HomeStatsSection stats={stats} />
			</header>

			<ContinueReadingSection />
			{stats.total === 0 ? (
				<EmptyLibraryCta />
			) : (
				<RecentArticlesSection
					recentlySaved={recent.recentlySaved}
					recentlyFavorite={recent.recentlyFavorite}
					oldestUnread={recent.oldestUnread}
					onOpenArticle={handleOpenArticle}
					availableTags={tags}
					onAddTag={handleAddTag}
					onRemoveTag={handleRemoveTag}
					onCreateTag={handleCreateTag}
				/>
			)}
		</div>
	);
}
