import { describe, expect, it, vi } from "vitest";
import { getUserIdFromBearerToken } from "#/server/api-token-auth";
import { hashApiToken } from "#/server/api-tokens-service";

describe("api-token-auth", () => {
	it("returns null when the authorization header is missing or malformed", async () => {
		const repo = {
			findUserIdByTokenHash: vi.fn(),
			markApiTokenUsed: vi.fn(),
		};

		await expect(
			getUserIdFromBearerToken({ authorization: null, repo }),
		).resolves.toBeNull();
		await expect(
			getUserIdFromBearerToken({ authorization: "Basic abc", repo }),
		).resolves.toBeNull();
		await expect(
			getUserIdFromBearerToken({ authorization: "Bearer abc extra", repo }),
		).resolves.toBeNull();
		await expect(
			getUserIdFromBearerToken({
				authorization: `Bearer hs_${"A".repeat(42)}`,
				repo,
			}),
		).resolves.toBeNull();
		await expect(
			getUserIdFromBearerToken({
				authorization: `Bearer oauth_${"A".repeat(43)}`,
				repo,
			}),
		).resolves.toBeNull();
		await expect(
			getUserIdFromBearerToken({
				authorization: `Bearer hs_${"A".repeat(42)}+`,
				repo,
			}),
		).resolves.toBeNull();

		expect(repo.findUserIdByTokenHash).not.toHaveBeenCalled();
	});

	it("hashes the bearer token and marks it as used", async () => {
		const token = `hs_${"A".repeat(43)}`;
		const tokenHash = await hashApiToken(token);
		const repo = {
			findUserIdByTokenHash: vi.fn().mockResolvedValue("user-1"),
			markApiTokenUsed: vi.fn().mockResolvedValue(undefined),
		};

		const userId = await getUserIdFromBearerToken({
			authorization: `Bearer ${token}`,
			repo,
		});

		expect(userId).toBe("user-1");
		expect(repo.findUserIdByTokenHash).toHaveBeenCalledWith(tokenHash);
		expect(repo.markApiTokenUsed).toHaveBeenCalledWith(tokenHash);
	});
});
