import { describe, expect, it } from "vitest";
import {
	createArticleInputSchema,
	tagMutationInputSchema,
	updateArticleInputSchema,
	updateUserSettingsInputSchema,
	validateInput,
} from "#/server/input-schemas";

describe("input schemas", () => {
	it("accepts only http/https article URLs", () => {
		expect(() =>
			validateInput(createArticleInputSchema, { url: "ftp://example.com" }),
		).toThrow("Invalid request data.");

		const valid = validateInput(createArticleInputSchema, {
			url: "https://example.com",
		});
		expect(valid.url).toBe("https://example.com");
	});

	it("requires at least one field for article update", () => {
		expect(() =>
			validateInput(updateArticleInputSchema, { id: "abc123" }),
		).toThrow("Invalid request data.");

		const valid = validateInput(updateArticleInputSchema, {
			id: "abc123",
			isRead: true,
		});
		expect(valid.isRead).toBe(true);
	});

	it("bounds bulk tag mutations", () => {
		expect(() =>
			validateInput(tagMutationInputSchema, {
				tagId: "t1",
				articleIds: [],
			}),
		).toThrow("Invalid request data.");

		const valid = validateInput(tagMutationInputSchema, {
			tagId: "t1",
			articleIds: ["a1", "a2"],
		});
		expect(valid.articleIds).toHaveLength(2);
	});

	it("requires a boolean for user settings updates", () => {
		expect(() =>
			validateInput(updateUserSettingsInputSchema, {
				markReadOnOpen: "yes",
			}),
		).toThrow("Invalid request data.");

		const valid = validateInput(updateUserSettingsInputSchema, {
			markReadOnOpen: false,
		});
		expect(valid.markReadOnOpen).toBe(false);
	});
});
