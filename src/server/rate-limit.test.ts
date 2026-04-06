import { describe, expect, it, vi } from "vitest";
import {
	checkRateLimitWithStore,
	type RateLimitStore,
} from "#/server/rate-limit";

vi.mock("#/db/index", () => ({
	getDb: () => {
		throw new Error("getDb should not be called in rate-limit store tests");
	},
}));

function createMemoryStore() {
	const entries = new Map<string, { count: number; resetAt: number }>();

	const store: RateLimitStore = {
		deleteExpired: async (now) => {
			for (const [cacheKey, entry] of entries) {
				if (entry.resetAt < now) {
					entries.delete(cacheKey);
				}
			}
		},
		getEntry: async ({ name, key }) => entries.get(`${name}:${key}`) ?? null,
		upsertEntry: async ({ name, key, count, resetAt }) => {
			entries.set(`${name}:${key}`, { count, resetAt });
		},
		updateCount: async ({ name, key, count }) => {
			const existing = entries.get(`${name}:${key}`);
			if (!existing) {
				return;
			}

			entries.set(`${name}:${key}`, { ...existing, count });
		},
	};

	return { store, entries };
}

describe("checkRateLimitWithStore", () => {
	it("allows the first request and stores the first counter", async () => {
		const { store, entries } = createMemoryStore();

		const result = await checkRateLimitWithStore(
			{ name: "auth", windowMs: 1_000, max: 2 },
			"ip:1.2.3.4",
			{ store, now: 100 },
		);

		expect(result).toEqual({ allowed: true, retryAfterMs: 0 });
		expect(entries.get("auth:ip:1.2.3.4")).toEqual({
			count: 1,
			resetAt: 1_100,
		});
	});

	it("increments repeated requests and rejects requests over the limit", async () => {
		const { store, entries } = createMemoryStore();

		await checkRateLimitWithStore(
			{ name: "auth", windowMs: 1_000, max: 2 },
			"ip:1.2.3.4",
			{ store, now: 100 },
		);
		const second = await checkRateLimitWithStore(
			{ name: "auth", windowMs: 1_000, max: 2 },
			"ip:1.2.3.4",
			{ store, now: 150 },
		);
		const third = await checkRateLimitWithStore(
			{ name: "auth", windowMs: 1_000, max: 2 },
			"ip:1.2.3.4",
			{ store, now: 200 },
		);

		expect(second).toEqual({ allowed: true, retryAfterMs: 0 });
		expect(entries.get("auth:ip:1.2.3.4")?.count).toBe(2);
		expect(third.allowed).toBe(false);
		expect(third.retryAfterMs).toBe(900);
	});

	it("resets the counter after the window expires", async () => {
		const { store, entries } = createMemoryStore();

		await checkRateLimitWithStore(
			{ name: "auth", windowMs: 500, max: 1 },
			"ip:1.2.3.4",
			{ store, now: 100 },
		);

		const afterExpiry = await checkRateLimitWithStore(
			{ name: "auth", windowMs: 500, max: 1 },
			"ip:1.2.3.4",
			{ store, now: 650 },
		);

		expect(afterExpiry).toEqual({ allowed: true, retryAfterMs: 0 });
		expect(entries.get("auth:ip:1.2.3.4")).toEqual({
			count: 1,
			resetAt: 1_150,
		});
	});

	it("treats a stale entry as expired even if the store still returns it", async () => {
		const upsertEntry = vi.fn();
		const store: RateLimitStore = {
			deleteExpired: vi.fn(),
			getEntry: vi.fn().mockResolvedValue({ count: 4, resetAt: 99 }),
			upsertEntry,
			updateCount: vi.fn(),
		};

		const result = await checkRateLimitWithStore(
			{ name: "auth", windowMs: 1_000, max: 2 },
			"ip:1.2.3.4",
			{ store, now: 100 },
		);

		expect(result).toEqual({ allowed: true, retryAfterMs: 0 });
		expect(upsertEntry).toHaveBeenCalledWith({
			name: "auth",
			key: "ip:1.2.3.4",
			count: 1,
			resetAt: 1_100,
		});
		expect(store.updateCount).not.toHaveBeenCalled();
	});

	it("returns a zero retry delay when a request lands exactly on resetAt", async () => {
		const store: RateLimitStore = {
			deleteExpired: vi.fn(),
			getEntry: vi.fn().mockResolvedValue({ count: 2, resetAt: 100 }),
			upsertEntry: vi.fn(),
			updateCount: vi.fn(),
		};

		const result = await checkRateLimitWithStore(
			{ name: "auth", windowMs: 1_000, max: 2 },
			"ip:1.2.3.4",
			{ store, now: 100 },
		);

		expect(result).toEqual({ allowed: false, retryAfterMs: 0 });
		expect(store.upsertEntry).not.toHaveBeenCalled();
		expect(store.updateCount).not.toHaveBeenCalled();
	});

	it("cleans up expired entries before checking the current counter", async () => {
		const deleteExpired = vi.fn();
		const getEntry = vi.fn().mockResolvedValue(null);
		const upsertEntry = vi.fn();
		const store: RateLimitStore = {
			deleteExpired,
			getEntry,
			upsertEntry,
			updateCount: vi.fn(),
		};

		await checkRateLimitWithStore(
			{ name: "auth", windowMs: 1_000, max: 2 },
			"ip:1.2.3.4",
			{ store, now: 100 },
		);

		expect(deleteExpired).toHaveBeenCalledWith(100);
		expect(getEntry).toHaveBeenCalledWith({
			name: "auth",
			key: "ip:1.2.3.4",
		});
		expect(deleteExpired.mock.invocationCallOrder[0]).toBeLessThan(
			getEntry.mock.invocationCallOrder[0],
		);
		expect(upsertEntry).toHaveBeenCalledOnce();
	});
});
