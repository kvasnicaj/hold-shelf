import { describe, expect, it, vi } from "vitest";
import {
	addTagToArticlesForUser,
	createTagForUser,
	deleteTagForUser,
	getTagsForUser,
	removeTagFromArticlesForUser,
	type TagsRepository,
	updateTagForUser,
} from "#/server/tags-service";

type StoredTag = {
	id: string;
	userId: string;
	name: string;
	color: string | null;
	createdAt: Date;
};

function createTagsRepoFixture() {
	const tags: StoredTag[] = [
		{
			id: "t1",
			userId: "user-1",
			name: "Design",
			color: null,
			createdAt: new Date("2024-01-01T00:00:00.000Z"),
		},
		{
			id: "t2",
			userId: "user-1",
			name: "Engineering",
			color: "#123456",
			createdAt: new Date("2024-01-02T00:00:00.000Z"),
		},
	];
	const articles = new Map([
		["a1", { id: "a1", userId: "user-1" }],
		["a2", { id: "a2", userId: "user-1" }],
		["a3", { id: "a3", userId: "user-2" }],
	]);
	const assignments = new Map<string, Set<string>>([
		["a1", new Set(["t1"])],
		["a2", new Set()],
	]);

	const repo: TagsRepository = {
		listTags: vi.fn(async ({ userId }) =>
			tags
				.filter((tag) => tag.userId === userId)
				.map((tag) => ({
					...tag,
					articleCount: Array.from(assignments.values()).filter((tagIds) =>
						tagIds.has(tag.id),
					).length,
				})),
		),
		createTag: vi.fn(async ({ userId, name, color }) => {
			const tag: StoredTag = {
				id: `t${tags.length + 1}`,
				userId,
				name,
				color: color ?? null,
				createdAt: new Date("2024-01-03T00:00:00.000Z"),
			};
			tags.push(tag);
			return tag;
		}),
		updateTag: vi.fn(async ({ userId, id, name }) => {
			const tag = tags.find(
				(candidate) => candidate.userId === userId && candidate.id === id,
			);
			if (!tag) {
				throw new Error("Tag not found in fixture");
			}

			tag.name = name;
			return tag;
		}),
		deleteTag: vi.fn(async ({ userId, id }) => {
			const remaining = tags.filter(
				(tag) => tag.userId !== userId || tag.id !== id,
			);
			tags.splice(0, tags.length, ...remaining);
			for (const tagIds of assignments.values()) {
				tagIds.delete(id);
			}
		}),
		hasOwnedTag: vi.fn(async ({ userId, tagId }) =>
			tags.some((tag) => tag.userId === userId && tag.id === tagId),
		),
		countOwnedArticles: vi.fn(
			async ({ userId, articleIds }) =>
				articleIds.filter(
					(articleId: string) => articles.get(articleId)?.userId === userId,
				).length,
		),
		addTagToArticles: vi.fn(async ({ tagId, articleIds }) => {
			for (const articleId of articleIds) {
				const tagIds = assignments.get(articleId) ?? new Set<string>();
				tagIds.add(tagId);
				assignments.set(articleId, tagIds);
			}
		}),
		removeTagFromArticles: vi.fn(async ({ tagId, articleIds }) => {
			for (const articleId of articleIds) {
				assignments.get(articleId)?.delete(tagId);
			}
		}),
	};

	return { repo, tags, assignments };
}

describe("tags service", () => {
	it("creates, renames, deletes, and lists tags with article counts", async () => {
		const { repo, tags } = createTagsRepoFixture();

		const created = await createTagForUser({
			repo,
			userId: "user-1",
			name: " Research ",
		});
		expect(created.name).toBe("Research");

		const renamed = await updateTagForUser({
			repo,
			userId: "user-1",
			id: "t1",
			name: " Product Design ",
		});
		expect(renamed.name).toBe("Product Design");

		const listed = await getTagsForUser({ repo, userId: "user-1" });
		expect(listed.find((tag) => tag.id === "t1")?.articleCount).toBe(1);

		await deleteTagForUser({ repo, userId: "user-1", id: "t2" });
		expect(tags.map((tag) => tag.id)).not.toContain("t2");
	});

	it("rejects addTag when the tag is not owned by the user", async () => {
		const { repo } = createTagsRepoFixture();

		await expect(
			addTagToArticlesForUser({
				repo,
				userId: "user-1",
				tagId: "missing",
				articleIds: ["a1"],
			}),
		).rejects.toThrow("Tag not found.");
	});

	it("rejects addTag when one of the articles is not owned by the user", async () => {
		const { repo } = createTagsRepoFixture();

		await expect(
			addTagToArticlesForUser({
				repo,
				userId: "user-1",
				tagId: "t1",
				articleIds: ["a1", "a3"],
			}),
		).rejects.toThrow("One or more articles were not found.");
	});

	it("treats duplicate assignments as harmless and can remove tags afterward", async () => {
		const { repo, assignments } = createTagsRepoFixture();

		await addTagToArticlesForUser({
			repo,
			userId: "user-1",
			tagId: "t1",
			articleIds: ["a1", "a1", "a2"],
		});

		expect(Array.from(assignments.get("a1") ?? [])).toEqual(["t1"]);
		expect(Array.from(assignments.get("a2") ?? [])).toEqual(["t1"]);

		await removeTagFromArticlesForUser({
			repo,
			userId: "user-1",
			tagId: "t1",
			articleIds: ["a1", "a2"],
		});

		expect(Array.from(assignments.get("a1") ?? [])).toEqual([]);
		expect(Array.from(assignments.get("a2") ?? [])).toEqual([]);
	});
});
