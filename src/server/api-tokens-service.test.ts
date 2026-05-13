import { describe, expect, it, vi } from "vitest";
import {
	generateApiTokenForUser,
	getApiTokenForUser,
	revokeApiTokenForUser,
} from "#/server/api-tokens-service";

describe("api-tokens-service", () => {
	it("returns the persisted API token metadata for a user", async () => {
		const token = {
			tokenPrefix: "hs_abc123456",
			createdAt: new Date("2026-05-13T10:00:00.000Z"),
			lastUsedAt: null,
		};
		const repo = {
			getApiToken: vi.fn().mockResolvedValue(token),
			upsertApiToken: vi.fn(),
			deleteApiToken: vi.fn(),
		};

		const result = await getApiTokenForUser({ repo, userId: "user-1" });

		expect(repo.getApiToken).toHaveBeenCalledWith("user-1");
		expect(result).toEqual(token);
	});

	it("generates a token and stores only its hash", async () => {
		const saved = {
			tokenPrefix: "hs_generated",
			createdAt: new Date("2026-05-13T10:00:00.000Z"),
			lastUsedAt: null,
		};
		const repo = {
			getApiToken: vi.fn(),
			upsertApiToken: vi.fn().mockResolvedValue(saved),
			deleteApiToken: vi.fn(),
		};

		const result = await generateApiTokenForUser({
			repo,
			userId: "user-1",
			generateTokenFn: () => "hs_generated_token",
			hashTokenFn: vi.fn().mockResolvedValue("hashed-token"),
		});

		expect(repo.upsertApiToken).toHaveBeenCalledWith({
			userId: "user-1",
			tokenHash: "hashed-token",
			tokenPrefix: "hs_generated",
		});
		expect(result).toEqual({ ...saved, token: "hs_generated_token" });
	});

	it("revokes the user token", async () => {
		const repo = {
			getApiToken: vi.fn(),
			upsertApiToken: vi.fn(),
			deleteApiToken: vi.fn().mockResolvedValue(undefined),
		};

		const result = await revokeApiTokenForUser({ repo, userId: "user-1" });

		expect(repo.deleteApiToken).toHaveBeenCalledWith("user-1");
		expect(result).toEqual({ success: true });
	});
});
