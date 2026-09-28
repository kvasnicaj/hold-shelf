import { and, asc, desc, eq, sql } from "drizzle-orm";
import { getDb } from "#/db/index";
import { articles } from "#/db/schema";
import { createArticlesRepository } from "#/server/articles-repository";
import { getArticlesForUser } from "#/server/articles-service";
import type { DashboardRepository } from "#/server/dashboard-runtime";

export function createDashboardRepository(): DashboardRepository {
	const db = getDb();
	const articleRepository = createArticlesRepository();

	return {
		getStats: async (userId) => {
			const [stats] = await db
				.select({
					total: sql<number>`COUNT(*)`,
					unread: sql<number>`SUM(CASE WHEN ${articles.isRead} = 0 THEN 1 ELSE 0 END)`,
					readThisWeek: sql<number>`SUM(CASE WHEN ${articles.readAt} >= unixepoch('now', '-7 days') THEN 1 ELSE 0 END)`,
					savedThisWeek: sql<number>`SUM(CASE WHEN ${articles.createdAt} >= unixepoch('now', '-7 days') THEN 1 ELSE 0 END)`,
				})
				.from(articles)
				.where(eq(articles.userId, userId));

			return stats ?? null;
		},
		getRecentArticles: async (userId) => {
			const [recentlySavedResult, oldestUnread, recentlyFavorite] =
				await Promise.all([
					getArticlesForUser({
						repo: articleRepository,
						userId,
						data: { sort: "newest", limit: 5 },
					}),
					db
						.select({
							id: articles.id,
							title: articles.title,
							hostname: articles.hostname,
							url: articles.url,
							faviconUrl: articles.faviconUrl,
							createdAt: articles.createdAt,
							isRead: articles.isRead,
						})
						.from(articles)
						.where(and(eq(articles.userId, userId), eq(articles.isRead, false)))
						.orderBy(asc(articles.createdAt))
						.limit(5),
					db
						.select({
							id: articles.id,
							title: articles.title,
							hostname: articles.hostname,
							url: articles.url,
							faviconUrl: articles.faviconUrl,
							createdAt: articles.createdAt,
							isRead: articles.isRead,
						})
						.from(articles)
						.where(
							and(eq(articles.userId, userId), eq(articles.isFavorite, true)),
						)
						.orderBy(desc(articles.updatedAt))
						.limit(5),
				]);

			return {
				recentlySaved: recentlySavedResult.items.map((article) => ({
					id: article.id,
					title: article.title,
					hostname: article.hostname,
					url: article.url,
					faviconUrl: article.faviconUrl,
					createdAt: article.createdAt,
					isRead: article.isRead,
					tags: article.tags,
				})),
				recentlyFavorite,
				oldestUnread,
			};
		},
	};
}
