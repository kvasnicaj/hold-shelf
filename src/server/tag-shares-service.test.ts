import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
	TagShareRecord,
	TagSharesRepository,
} from "#/server/tag-shares-service";
import {
	createTagShareForUser,
	getFirstName,
	getSharedTagByToken,
	getTagShareForUser,
	revokeTagShareForUser,
} from "#/server/tag-shares-service";

function createRepositoryFixture() {
	let share: TagShareRecord | null = null;
	const repo: TagSharesRepository = {
		getOwnedTagShare: vi.fn(async ({ userId, tagId }) =>
			userId === "user-1" && tagId === "tag-1" ? share : null,
		),
		hasOwnedTag: vi.fn(
			async ({ userId, tagId }) => userId === "user-1" && tagId === "tag-1",
		),
		insertTagShare: vi.fn(async ({ tagId, token }) => {
			if (share) {
				return null;
			}
			share = {
				tagId,
				token,
				createdAt: new Date("2026-07-31T00:00:00.000Z"),
			};
			return share;
		}),
		deleteTagShare: vi.fn(async () => {
			share = null;
		}),
		getSharedTag: vi.fn(async ({ token }) =>
			token === "hss_shared"
				? {
						ownerName: " Jaroslav Novak ",
						tagName: "Research",
						items: [
							{
								url: "https://example.com/article",
								title: "Example",
								description: "Public description",
								hostname: "example.com",
								faviconUrl: null,
								createdAt: new Date("2026-07-30T00:00:00.000Z"),
							},
						],
						total: 21,
					}
				: null,
		),
	};

	return { repo };
}

describe("tag shares service", () => {
	let repo: TagSharesRepository;

	beforeEach(() => {
		({ repo } = createRepositoryFixture());
	});

	it("does not create a link while checking an unshared tag", async () => {
		await expect(
			getTagShareForUser({ repo, userId: "user-1", tagId: "tag-1" }),
		).resolves.toBeNull();
		expect(repo.insertTagShare).not.toHaveBeenCalled();
	});

	it("creates one active link and returns it idempotently", async () => {
		const generateTokenFn = vi.fn(() => "hss_first");
		const first = await createTagShareForUser({
			repo,
			userId: "user-1",
			tagId: "tag-1",
			generateTokenFn,
		});
		const second = await createTagShareForUser({
			repo,
			userId: "user-1",
			tagId: "tag-1",
			generateTokenFn,
		});

		expect(first.token).toBe("hss_first");
		expect(second).toEqual(first);
		expect(repo.insertTagShare).toHaveBeenCalledTimes(1);
		expect(generateTokenFn).toHaveBeenCalledTimes(1);
	});

	it("revokes an active link and creates a fresh token afterward", async () => {
		const tokens = ["hss_first", "hss_second"];
		const generateTokenFn = vi.fn(() => tokens.shift() ?? "hss_fallback");
		await createTagShareForUser({
			repo,
			userId: "user-1",
			tagId: "tag-1",
			generateTokenFn,
		});
		await revokeTagShareForUser({ repo, userId: "user-1", tagId: "tag-1" });
		const recreated = await createTagShareForUser({
			repo,
			userId: "user-1",
			tagId: "tag-1",
			generateTokenFn,
		});

		expect(recreated.token).toBe("hss_second");
		expect(repo.deleteTagShare).toHaveBeenCalledWith("tag-1");
	});

	it("rejects sharing or revoking a tag owned by someone else", async () => {
		await expect(
			createTagShareForUser({
				repo,
				userId: "user-2",
				tagId: "tag-1",
			}),
		).rejects.toThrow("Tag not found.");
		await expect(
			revokeTagShareForUser({
				repo,
				userId: "user-2",
				tagId: "tag-1",
			}),
		).rejects.toThrow("Tag not found.");
	});

	it("returns only the first name and paginated public collection", async () => {
		const shared = await getSharedTagByToken({
			repo,
			token: "hss_shared",
			page: 2,
		});

		expect(shared).toEqual({
			ownerFirstName: "Jaroslav",
			tagName: "Research",
			articles: {
				items: [
					expect.objectContaining({
						url: "https://example.com/article",
						title: "Example",
					}),
				],
				total: 21,
			},
		});
		expect(repo.getSharedTag).toHaveBeenCalledWith({
			token: "hss_shared",
			limit: 20,
			offset: 20,
		});
	});

	it("uses a privacy-safe fallback for a blank account name", () => {
		expect(getFirstName("   ")).toBe("Someone");
	});
});
