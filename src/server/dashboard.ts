import { createServerFn } from "@tanstack/react-start";
import { createDashboardRepository } from "#/server/dashboard-repository";
import {
	handleGetDashboardStats,
	handleGetRecentArticles,
} from "#/server/dashboard-runtime";
import { requireUserId } from "#/server/helpers";

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
