import { afterAll, beforeAll, expect, it, vi } from "vitest";
import {
	checkRateLimitWithStore,
	createRateLimitStore,
} from "#/server/rate-limit";
import { createTestDatabase } from "#/test/d1";

const { getDbMock } = vi.hoisted(() => ({ getDbMock: vi.fn() }));
vi.mock("#/db/index", () => ({ getDb: getDbMock }));
let database: Awaited<ReturnType<typeof createTestDatabase>>;
beforeAll(async () => {
	database = await createTestDatabase();
	getDbMock.mockReturnValue(database.db);
}, 30000);
afterAll(async () => {
	await database?.runtime.dispose();
});
it("enforces a shared limit under concurrent D1 requests and resets at the window boundary", async () => {
	getDbMock.mockReturnValue(database.db);
	const store = createRateLimitStore();
	const config = { name: "parallel", windowMs: 1000, max: 2 };
	const results = await Promise.all(
		Array.from({ length: 20 }, () =>
			checkRateLimitWithStore(config, "same-user", { store, now: 100 }),
		),
	);
	expect(results.filter((result) => result.allowed)).toHaveLength(2);
	expect(
		results
			.filter((result) => !result.allowed)
			.every((result) => result.retryAfterMs === 1000),
	).toBe(true);
	expect(
		await checkRateLimitWithStore(config, "other-user", { store, now: 100 }),
	).toEqual({ allowed: true, retryAfterMs: 0 });
	expect(
		await checkRateLimitWithStore(config, "same-user", { store, now: 1100 }),
	).toEqual({ allowed: true, retryAfterMs: 0 });
});

it("atomically charges weighted costs and cannot regain budget by retrying", async () => {
	getDbMock.mockReturnValue(database.db);
	const store = createRateLimitStore();
	const config = { name: "weighted", windowMs: 1000, max: 100, cost: 30 };
	const results = await Promise.all(
		Array.from({ length: 10 }, () =>
			checkRateLimitWithStore(config, "same", { store, now: 100 }),
		),
	);
	expect(results.filter(({ allowed }) => allowed)).toHaveLength(3);
	expect(
		await checkRateLimitWithStore({ ...config, cost: 1 }, "same", {
			store,
			now: 100,
		}),
	).toEqual({ allowed: false, retryAfterMs: 1000 });
	expect(
		await checkRateLimitWithStore({ ...config, cost: 101 }, "oversized", {
			store,
			now: 100,
		}),
	).toEqual({ allowed: false, retryAfterMs: 1000 });
	expect(
		await checkRateLimitWithStore(config, "same", { store, now: 1100 }),
	).toEqual({ allowed: true, retryAfterMs: 0 });
});
