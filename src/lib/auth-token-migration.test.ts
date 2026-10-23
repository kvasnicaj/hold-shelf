import { readFile } from "node:fs/promises";
import { expect, it } from "vitest";
import { account, apiTokens, session, user } from "#/db/schema";
import { createTestDatabase } from "#/test/d1";

it("removes legacy GitHub credentials without changing linked identity or app credentials", async () => {
	const database = await createTestDatabase({ beforeMigration: "0011" });
	try {
		const now = new Date();
		await database.db.insert(user).values({
			id: "synthetic-owner",
			name: "Synthetic User",
			email: "synthetic@example.test",
			emailVerified: true,
			createdAt: now,
			updatedAt: now,
		});
		const binding = {
			id: "synthetic-account",
			accountId: "424242",
			providerId: "github",
			userId: "synthetic-owner",
			scope: "read:user,user:email",
			createdAt: now,
			updatedAt: now,
		};
		await database.db.insert(account).values({
			...binding,
			accessToken: "synthetic-legacy-access-token",
			refreshToken: "synthetic-legacy-refresh-token",
			idToken: "synthetic-legacy-id-token",
			accessTokenExpiresAt: now,
			refreshTokenExpiresAt: now,
		});
		await database.db.insert(session).values({
			id: "synthetic-session",
			userId: binding.userId,
			token: "synthetic-app-session",
			expiresAt: new Date(Date.now() + 60_000),
			createdAt: now,
			updatedAt: now,
		});
		await database.db.insert(apiTokens).values({
			userId: binding.userId,
			tokenHash: "synthetic-hash",
			tokenPrefix: "hs_synthetic",
		});
		const oldSessions = await database.db.select().from(session);
		const oldApiTokens = await database.db.select().from(apiTokens);
		const migration = await readFile(
			"drizzle/0011_clear_unused_oauth_tokens.sql",
			"utf8",
		);
		await database.binding.exec(
			migration.replace(/^\s*--.*$/gm, "").replace(/\n/g, " "),
		);
		const [cleaned] = await database.db.select().from(account);
		expect(cleaned).toMatchObject({
			id: binding.id,
			accountId: binding.accountId,
			providerId: binding.providerId,
			userId: binding.userId,
			scope: binding.scope,
			accessToken: null,
			refreshToken: null,
			idToken: null,
			accessTokenExpiresAt: null,
			refreshTokenExpiresAt: null,
		});
		expect(await database.db.select().from(session)).toEqual(oldSessions);
		expect(await database.db.select().from(apiTokens)).toEqual(oldApiTokens);
	} finally {
		await database.runtime.dispose();
	}
}, 30_000);
