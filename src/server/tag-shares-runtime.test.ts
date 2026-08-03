import { describe, expect, it, vi } from "vitest";
import {
	handleCreateTagShare,
	handleGetSharedTag,
	validateSharedTagInput,
	validateTagShareInput,
} from "#/server/tag-shares-runtime";

describe("tag shares runtime", () => {
	it("validates owner and public inputs", () => {
		expect(validateTagShareInput({ tagId: "tag-1" })).toEqual({
			tagId: "tag-1",
		});
		expect(() => validateTagShareInput({ tagId: "" })).toThrow(
			"Invalid tag selection.",
		);
		expect(() => validateSharedTagInput({ token: "guessable" })).toThrow(
			"Invalid sharing link.",
		);
	});

	it("requires authentication for link creation", async () => {
		const requireUserIdFn = vi.fn().mockResolvedValue("user-1");
		const createTagShareForUserFn = vi
			.fn()
			.mockResolvedValue({ token: "token" });

		await handleCreateTagShare(validateTagShareInput({ tagId: "tag-1" }), {
			createRepository: () => ({ repo: true }) as never,
			requireUserIdFn,
			createTagShareForUserFn,
		});

		expect(requireUserIdFn).toHaveBeenCalled();
		expect(createTagShareForUserFn).toHaveBeenCalledWith({
			repo: { repo: true },
			userId: "user-1",
			tagId: "tag-1",
		});
	});

	it("resolves a public link without requesting a user session", async () => {
		const getSharedTagByTokenFn = vi
			.fn()
			.mockResolvedValue({ tagName: "Research" });
		const token = `hss_${"a".repeat(32)}`;

		await handleGetSharedTag(validateSharedTagInput({ token, page: 2 }), {
			createRepository: () => ({ repo: true }) as never,
			getSharedTagByTokenFn,
		});

		expect(getSharedTagByTokenFn).toHaveBeenCalledWith({
			repo: { repo: true },
			token,
			page: 2,
		});
	});
});
