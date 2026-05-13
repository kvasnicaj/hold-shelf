import { eq } from "drizzle-orm";
import { getDb } from "#/db/index";
import { apiTokens } from "#/db/schema";
import type { ApiTokensRepository } from "#/server/api-tokens-service";

export function createApiTokensRepository(): ApiTokensRepository {
	const db = getDb();

	return {
		getApiToken: async (userId) => {
			const [token] = await db
				.select({
					tokenPrefix: apiTokens.tokenPrefix,
					createdAt: apiTokens.createdAt,
					lastUsedAt: apiTokens.lastUsedAt,
				})
				.from(apiTokens)
				.where(eq(apiTokens.userId, userId))
				.limit(1);

			return token ?? null;
		},
		findUserIdByTokenHash: async (tokenHash) => {
			const [token] = await db
				.select({ userId: apiTokens.userId })
				.from(apiTokens)
				.where(eq(apiTokens.tokenHash, tokenHash))
				.limit(1);

			return token?.userId ?? null;
		},
		markApiTokenUsed: async (tokenHash) => {
			await db
				.update(apiTokens)
				.set({ lastUsedAt: new Date() })
				.where(eq(apiTokens.tokenHash, tokenHash));
		},
		upsertApiToken: async ({ userId, tokenHash, tokenPrefix }) => {
			const now = new Date();
			const [token] = await db
				.insert(apiTokens)
				.values({
					userId,
					tokenHash,
					tokenPrefix,
					createdAt: now,
					lastUsedAt: null,
				})
				.onConflictDoUpdate({
					target: apiTokens.userId,
					set: {
						tokenHash,
						tokenPrefix,
						createdAt: now,
						lastUsedAt: null,
					},
				})
				.returning({
					tokenPrefix: apiTokens.tokenPrefix,
					createdAt: apiTokens.createdAt,
					lastUsedAt: apiTokens.lastUsedAt,
				});

			if (!token) {
				throw new Error("Failed to save API token.");
			}

			return token;
		},
		deleteApiToken: async (userId) => {
			await db.delete(apiTokens).where(eq(apiTokens.userId, userId));
		},
	};
}
