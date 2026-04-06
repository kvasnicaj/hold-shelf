import { describe, expect, it, vi } from "vitest";
import {
	handleGetDashboardStats,
	handleGetRecentArticles,
} from "#/server/dashboard-runtime";

describe("dashboard-runtime", () => {
	it("requires a user id and normalizes the dashboard stats shape", async () => {
		const requireUserIdFn = vi.fn().mockResolvedValue("user-1");
		const repo = {
			getStats: vi.fn().mockResolvedValue({
				total: 10,
				unread: 4,
				readThisWeek: 3,
				savedThisWeek: 5,
			}),
			getRecentArticles: vi.fn(),
		};

		const result = await handleGetDashboardStats({
			repo,
			requireUserIdFn,
		});

		expect(repo.getStats).toHaveBeenCalledWith("user-1");
		expect(result).toEqual({
			total: 10,
			unread: 4,
			read: 6,
			readThisWeek: 3,
			savedThisWeek: 5,
		});
	});

	it("delegates recent article loading to the dashboard repository", async () => {
		const requireUserIdFn = vi.fn().mockResolvedValue("user-1");
		const recentResult = {
			recentlySaved: [{ id: "a1" }],
			recentlyFavorite: [{ id: "a3" }],
			oldestUnread: [{ id: "a2" }],
		};
		const repo = {
			getStats: vi.fn(),
			getRecentArticles: vi.fn().mockResolvedValue(recentResult),
		};

		const result = await handleGetRecentArticles({
			repo,
			requireUserIdFn,
		});

		expect(repo.getRecentArticles).toHaveBeenCalledWith("user-1");
		expect(result).toEqual(recentResult);
	});
});
