import { createServerFn } from "@tanstack/react-start";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { getDb } from "#/db/index";
import { articles } from "#/db/schema";
import {
	type DashboardRepository,
	handleGetDashboardStats,
	handleGetRecentArticles,
} from "#/server/dashboard-runtime";
import { requireUserId } from "#/server/helpers";

function createDashboardRepository(): DashboardRepository {
	const db = getDb();

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
			const recentlySaved = await db
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
				.where(eq(articles.userId, userId))
				.orderBy(desc(articles.createdAt))
				.limit(5);

			const oldestUnread = await db
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
				.limit(5);

			const recentlyFavorite = await db
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
				.where(and(eq(articles.userId, userId), eq(articles.isFavorite, true)))
				.orderBy(desc(articles.updatedAt))
				.limit(5);

			return { recentlySaved, recentlyFavorite, oldestUnread };
		},
	};
}

export const getDashboardStats = createServerFn({ method: "GET" }).handler(
	async () =>
		handleGetDashboardStats({
			repo: createDashboardRepository(),
			requireUserIdFn: requireUserId,
		}),
);

export const getRecentArticles = createServerFn({ method: "GET" }).handler(
	async () =>
		handleGetRecentArticles({
			repo: createDashboardRepository(),
			requireUserIdFn: requireUserId,
		}),
);
