import { describe, expect, it, vi } from "vitest";
import { handleV1DashboardGet } from "#/routes/api/v1/-dashboard-handlers";
import { handleV1MeGet } from "#/routes/api/v1/-me-handlers";
import { handleV1TagsGet } from "#/routes/api/v1/-tags-handlers";
import type { DashboardRepository } from "#/server/dashboard-runtime";
import type { TagsRepository } from "#/server/tags-service";

function createAuthDependencies(userId: string | null = "user-1") {
	return {
		checkRateLimitFn: vi
			.fn()
			.mockResolvedValue({ allowed: true, retryAfterMs: 0 }),
		createApiTokensRepositoryFn: vi.fn().mockReturnValue({}),
		getUserIdFromBearerTokenFn: vi.fn().mockResolvedValue(userId),
	};
}

function createRequest(path: string) {
	return new Request(`https://hold-shelf.com${path}`, {
		headers: { authorization: "Bearer hs_token" },
	});
}

describe("v1 resource API handlers", () => {
	it("validates the current API credential", async () => {
		const response = await handleV1MeGet(
			{ request: createRequest("/api/v1/me") },
			createAuthDependencies(),
		);

		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toEqual({ authenticated: true });
	});

	it("uses the shared unauthorized response", async () => {
		const response = await handleV1MeGet(
			{ request: createRequest("/api/v1/me") },
			createAuthDependencies(null),
		);

		expect(response.status).toBe(401);
		await expect(response.json()).resolves.toEqual({
			code: "UNAUTHORIZED",
			message: "Invalid or missing API token.",
		});
	});

	it("lists tag summaries for the token owner", async () => {
		const repo = {} as TagsRepository;
		const getTagsForUserFn = vi.fn().mockResolvedValue([
			{
				id: "tag-1",
				name: "Research",
				color: null,
				createdAt: new Date("2026-08-30T10:00:00.000Z"),
				articleCount: 3,
			},
		]);

		const response = await handleV1TagsGet(
			{ request: createRequest("/api/v1/tags") },
			{
				...createAuthDependencies(),
				createTagsRepositoryFn: () => repo,
				getTagsForUserFn,
			},
		);

		expect(response.status).toBe(200);
		expect(getTagsForUserFn).toHaveBeenCalledWith({
			repo,
			userId: "user-1",
		});
		await expect(response.json()).resolves.toEqual([
			{
				id: "tag-1",
				name: "Research",
				color: null,
				createdAt: "2026-08-30T10:00:00.000Z",
				articleCount: 3,
			},
		]);
	});

	it("does not expose internal service errors", async () => {
		const consoleError = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});
		const response = await handleV1TagsGet(
			{ request: createRequest("/api/v1/tags") },
			{
				...createAuthDependencies(),
				createTagsRepositoryFn: () => ({}) as TagsRepository,
				getTagsForUserFn: vi
					.fn()
					.mockRejectedValue(new Error("private database details")),
			},
		);

		expect(response.status).toBe(500);
		await expect(response.json()).resolves.toEqual({
			code: "LIST_TAGS_FAILED",
			message: "Failed to list tags.",
		});
		expect(consoleError).toHaveBeenCalledOnce();
		consoleError.mockRestore();
	});

	it("returns normalized dashboard stats for the token owner", async () => {
		const repo: DashboardRepository = {
			getStats: vi.fn().mockResolvedValue({
				total: 7,
				unread: 2,
				readThisWeek: null,
				savedThisWeek: 4,
			}),
			getRecentArticles: vi.fn(),
		};

		const response = await handleV1DashboardGet(
			{ request: createRequest("/api/v1/dashboard") },
			{
				...createAuthDependencies(),
				createDashboardRepositoryFn: () => repo,
			},
		);

		expect(response.status).toBe(200);
		expect(repo.getStats).toHaveBeenCalledWith("user-1");
		await expect(response.json()).resolves.toEqual({
			total: 7,
			unread: 2,
			read: 5,
			readThisWeek: 0,
			savedThisWeek: 4,
		});
	});
});
