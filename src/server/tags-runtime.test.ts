import { describe, expect, it, vi } from "vitest";
import {
	handleAddTagToArticles,
	handleGetTags,
	validateCreateTagInput,
	validateTagMutationInput,
} from "#/server/tags-runtime";

describe("tags-runtime", () => {
	it("rejects invalid tag input", () => {
		expect(() => validateCreateTagInput({ name: "" })).toThrow(
			"Invalid tag data.",
		);
	});

	it("requires a user id and delegates tag listing", async () => {
		const requireUserIdFn = vi.fn().mockResolvedValue("user-1");
		const createRepository = vi.fn().mockReturnValue({ repo: true });
		const getTagsForUserFn = vi.fn().mockResolvedValue([]);

		await handleGetTags({
			createRepository,
			requireUserIdFn,
			getTagsForUserFn,
		});

		expect(requireUserIdFn).toHaveBeenCalled();
		expect(getTagsForUserFn).toHaveBeenCalledWith({
			repo: { repo: true },
			userId: "user-1",
		});
	});

	it("delegates tag assignment mutations to the tag service", async () => {
		const requireUserIdFn = vi.fn().mockResolvedValue("user-1");
		const createRepository = vi.fn().mockReturnValue({ repo: true });
		const addTagToArticlesForUserFn = vi.fn().mockResolvedValue(undefined);

		await handleAddTagToArticles(
			validateTagMutationInput({ tagId: "t1", articleIds: ["a1"] }),
			{
				createRepository,
				requireUserIdFn,
				addTagToArticlesForUserFn,
			},
		);

		expect(addTagToArticlesForUserFn).toHaveBeenCalledWith({
			repo: { repo: true },
			userId: "user-1",
			tagId: "t1",
			articleIds: ["a1"],
		});
	});
});
