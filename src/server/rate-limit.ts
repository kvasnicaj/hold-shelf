import { lt, sql } from "drizzle-orm";
import { getDb } from "#/db/index";
import { rateLimits } from "#/db/schema";

type RateLimitConfig = { name: string; windowMs: number; max: number };
export type RateLimitStore = {
	consume: (
		args: RateLimitConfig & { key: string; now: number },
	) => Promise<{ count: number; resetAt: number }>;
};

export function createRateLimitStore(): RateLimitStore {
	const db = getDb();
	return {
		consume: async ({ name, key, now, windowMs, max }) => {
			const [entry] = await db
				.insert(rateLimits)
				.values({ name, key, count: 1, resetAt: now + windowMs })
				.onConflictDoUpdate({
					target: [rateLimits.name, rateLimits.key],
					set: {
						count: sql`CASE WHEN ${rateLimits.resetAt} <= ${now} THEN 1 ELSE MIN(${rateLimits.count} + 1, ${max + 1}) END`,
						resetAt: sql`CASE WHEN ${rateLimits.resetAt} <= ${now} THEN ${now + windowMs} ELSE ${rateLimits.resetAt} END`,
						updatedAt: sql`unixepoch()`,
					},
				})
				.returning({ count: rateLimits.count, resetAt: rateLimits.resetAt });
			if (!entry) throw new Error("Could not check request limit.");
			return entry;
		},
	};
}

export async function checkRateLimitWithStore(
	config: RateLimitConfig,
	key: string,
	{ store, now = Date.now() }: { store: RateLimitStore; now?: number },
) {
	const entry = await store.consume({ ...config, key, now });
	const allowed = entry.count <= config.max;
	return {
		allowed,
		retryAfterMs: allowed ? 0 : Math.max(0, entry.resetAt - now),
	};
}
export async function checkRateLimit(config: RateLimitConfig, key: string) {
	return checkRateLimitWithStore(config, key, {
		store: createRateLimitStore(),
	});
}

export async function cleanupRateLimits() {
	await getDb()
		.delete(rateLimits)
		.where(lt(rateLimits.resetAt, Date.now() - 86400000));
}
