import { and, eq, lt, sql } from "drizzle-orm";
import { getDb } from "#/db/index";
import { rateLimits } from "#/db/schema";

type RateLimitConfig = {
	name: string;
	windowMs: number;
	max: number;
};

type RateLimitEntry = {
	count: number;
	resetAt: number;
};

export type RateLimitStore = {
	deleteExpired: (now: number) => Promise<void>;
	getEntry: (args: {
		name: string;
		key: string;
	}) => Promise<RateLimitEntry | null>;
	upsertEntry: (args: {
		name: string;
		key: string;
		count: number;
		resetAt: number;
	}) => Promise<void>;
	updateCount: (args: {
		name: string;
		key: string;
		count: number;
	}) => Promise<void>;
};

function createRateLimitStore(): RateLimitStore {
	const db = getDb();

	return {
		deleteExpired: async (now) => {
			await db.delete(rateLimits).where(lt(rateLimits.resetAt, now));
		},
		getEntry: async ({ name, key }) => {
			const [existing] = await db
				.select({
					count: rateLimits.count,
					resetAt: rateLimits.resetAt,
				})
				.from(rateLimits)
				.where(and(eq(rateLimits.name, name), eq(rateLimits.key, key)))
				.limit(1);

			return existing ?? null;
		},
		upsertEntry: async ({ name, key, count, resetAt }) => {
			await db
				.insert(rateLimits)
				.values({
					name,
					key,
					count,
					resetAt,
					updatedAt: sql`(unixepoch())`,
				})
				.onConflictDoUpdate({
					target: [rateLimits.name, rateLimits.key],
					set: {
						count,
						resetAt,
						updatedAt: sql`(unixepoch())`,
					},
				});
		},
		updateCount: async ({ name, key, count }) => {
			await db
				.update(rateLimits)
				.set({
					count,
					updatedAt: sql`(unixepoch())`,
				})
				.where(and(eq(rateLimits.name, name), eq(rateLimits.key, key)));
		},
	};
}

export async function checkRateLimitWithStore(
	config: RateLimitConfig,
	key: string,
	{
		store,
		now = Date.now(),
	}: {
		store: RateLimitStore;
		now?: number;
	},
): Promise<{ allowed: boolean; retryAfterMs: number }> {
	const windowEnd = now + config.windowMs;

	await store.deleteExpired(now);
	const existing = await store.getEntry({ name: config.name, key });

	if (!existing || now > existing.resetAt) {
		await store.upsertEntry({
			name: config.name,
			key,
			count: 1,
			resetAt: windowEnd,
		});

		return { allowed: true, retryAfterMs: 0 };
	}

	if (existing.count >= config.max) {
		return {
			allowed: false,
			retryAfterMs: Math.max(0, existing.resetAt - now),
		};
	}

	await store.updateCount({
		name: config.name,
		key,
		count: existing.count + 1,
	});

	return { allowed: true, retryAfterMs: 0 };
}

export async function checkRateLimit(
	config: RateLimitConfig,
	key: string,
): Promise<{ allowed: boolean; retryAfterMs: number }> {
	return checkRateLimitWithStore(config, key, {
		store: createRateLimitStore(),
		now: Date.now(),
	});
}
