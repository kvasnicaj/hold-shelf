import { useQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { useArticleMutations } from "#/components/articles/use-article-mutations";
import { useOpenArticle } from "#/components/articles/use-open-article";
import { ContinueReadingSection } from "#/components/home/continue-reading-section";
import { EmptyLibraryCta } from "#/components/home/empty-library-cta";
import { getHomeSummary } from "#/components/home/helpers";
import { HomeStatsSection } from "#/components/home/home-stats-section";
import { continueReadingOptions } from "#/components/home/query-options";
import { RecentArticlesSection } from "#/components/home/recent-articles-section";

const route = getRouteApi("/app/home");

export function HomePage() {
	const { stats, recent, tags, continueReading } = route.useLoaderData();
	const { data: inProgress } = useQuery({
		...continueReadingOptions(),
		initialData: continueReading,
	});
	const { handleOpenArticle } = useOpenArticle();
	const { handleAddTag, handleRemoveTag, handleCreateTag } =
		useArticleMutations();

	return (
		<div className="flex w-full flex-col gap-5 md:gap-8">
			<h1 className="sr-only md:hidden">Home</h1>
			<header className="hidden space-y-2 md:block">
				<h1 className="font-serif text-[2rem] leading-tight font-semibold text-balance">
					Make time for a good read
				</h1>
				<p className="text-[15px] text-muted-foreground">
					{getHomeSummary(stats)}
				</p>
				<HomeStatsSection stats={stats} />
			</header>

			<ContinueReadingSection articles={inProgress} />
			{stats.total === 0 ? (
				<EmptyLibraryCta />
			) : (
				<RecentArticlesSection
					latestUnread={recent.latestUnread}
					unreadCount={stats.unread}
					inProgress={inProgress}
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
