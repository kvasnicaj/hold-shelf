import type { articles } from "#/db/schema";

export type DashboardStatsRow = {
	total: number | null;
	unread: number | null;
	readThisWeek: number | null;
	savedThisWeek: number | null;
};

export type DashboardRecentArticle = Pick<
	typeof articles.$inferSelect,
	"id" | "title" | "hostname" | "url" | "faviconUrl" | "createdAt" | "isRead"
>;

export type DashboardRepository = {
	getStats: (userId: string) => Promise<DashboardStatsRow | null>;
	getRecentArticles: (userId: string) => Promise<{
		recentlySaved: DashboardRecentArticle[];
		recentlyFavorite: DashboardRecentArticle[];
		oldestUnread: DashboardRecentArticle[];
	}>;
};

type DashboardRuntimeDependencies = {
	repo: DashboardRepository;
	requireUserIdFn: () => Promise<string>;
};

export async function handleGetDashboardStats(
	deps: DashboardRuntimeDependencies,
) {
	const userId = await deps.requireUserIdFn();
	const stats = await deps.repo.getStats(userId);

	return {
		total: stats?.total ?? 0,
		unread: stats?.unread ?? 0,
		read: (stats?.total ?? 0) - (stats?.unread ?? 0),
		readThisWeek: stats?.readThisWeek ?? 0,
		savedThisWeek: stats?.savedThisWeek ?? 0,
	};
}

export async function handleGetRecentArticles(
	deps: DashboardRuntimeDependencies,
) {
	const userId = await deps.requireUserIdFn();
	return deps.repo.getRecentArticles(userId);
}
