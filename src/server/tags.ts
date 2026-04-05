import { createServerFn } from "@tanstack/react-start";
import { and, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "#/db/index";
import { articles, articleTags, tags } from "#/db/schema";
import { requireUserId } from "#/server/helpers";
import {
	handleAddTagToArticles,
	handleCreateTag,
	handleDeleteTag,
	handleGetTags,
	handleRemoveTagFromArticles,
	handleUpdateTag,
	validateCreateTagInput,
	validateDeleteTagInput,
	validateTagMutationInput,
	validateUpdateTagInput,
} from "#/server/tags-runtime";
import type { TagsRepository } from "#/server/tags-service";

function createTagsRepository(): TagsRepository {
	const db = getDb();

	return {
		listTags: async ({ userId }) =>
			db
				.select({
					id: tags.id,
					name: tags.name,
					color: tags.color,
					createdAt: tags.createdAt,
					articleCount: sql<number>`COUNT(${articles.id})`.as("article_count"),
				})
				.from(tags)
				.leftJoin(articleTags, eq(articleTags.tagId, tags.id))
				.leftJoin(
					articles,
					and(
						eq(articles.id, articleTags.articleId),
						eq(articles.userId, userId),
					),
				)
				.where(eq(tags.userId, userId))
				.groupBy(tags.id, tags.name, tags.color, tags.createdAt)
				.orderBy(tags.name),
		createTag: async ({ userId, name, color }) => {
			const [tag] = await db
				.insert(tags)
				.values({
					userId,
					name,
					color: color ?? null,
				})
				.returning();

			return tag;
		},
		updateTag: async ({ userId, id, name }) => {
			const [tag] = await db
				.update(tags)
				.set({ name })
				.where(and(eq(tags.id, id), eq(tags.userId, userId)))
				.returning();

			return tag;
		},
		deleteTag: async ({ userId, id }) => {
			await db
				.delete(tags)
				.where(and(eq(tags.id, id), eq(tags.userId, userId)));
		},
		hasOwnedTag: async ({ userId, tagId }) => {
			const [ownedTag] = await db
				.select({ id: tags.id })
				.from(tags)
				.where(and(eq(tags.id, tagId), eq(tags.userId, userId)))
				.limit(1);

			return !!ownedTag;
		},
		countOwnedArticles: async ({ userId, articleIds }) => {
			const ownedArticles = await db
				.select({ id: articles.id })
				.from(articles)
				.where(
					and(eq(articles.userId, userId), inArray(articles.id, articleIds)),
				);

			return ownedArticles.length;
		},
		addTagToArticles: async ({ tagId, articleIds }) => {
			await db
				.insert(articleTags)
				.values(
					articleIds.map((articleId) => ({
						articleId,
						tagId,
					})),
				)
				.onConflictDoNothing();
		},
		removeTagFromArticles: async ({ tagId, articleIds }) => {
			await db
				.delete(articleTags)
				.where(
					and(
						inArray(articleTags.articleId, articleIds),
						eq(articleTags.tagId, tagId),
					),
				);
		},
	};
}

export const getTags = createServerFn({ method: "GET" }).handler(async () =>
	handleGetTags({
		createRepository: createTagsRepository,
		requireUserIdFn: requireUserId,
	}),
);

export const createTag = createServerFn({ method: "POST" })
	.inputValidator(validateCreateTagInput)
	.handler(async ({ data }) =>
		handleCreateTag(data, {
			createRepository: createTagsRepository,
			requireUserIdFn: requireUserId,
		}),
	);

export const updateTag = createServerFn({ method: "POST" })
	.inputValidator(validateUpdateTagInput)
	.handler(async ({ data }) =>
		handleUpdateTag(data, {
			createRepository: createTagsRepository,
			requireUserIdFn: requireUserId,
		}),
	);

export const deleteTag = createServerFn({ method: "POST" })
	.inputValidator(validateDeleteTagInput)
	.handler(async ({ data }) =>
		handleDeleteTag(data, {
			createRepository: createTagsRepository,
			requireUserIdFn: requireUserId,
		}),
	);

export const addTagToArticles = createServerFn({ method: "POST" })
	.inputValidator(validateTagMutationInput)
	.handler(async ({ data }) =>
		handleAddTagToArticles(data, {
			createRepository: createTagsRepository,
			requireUserIdFn: requireUserId,
		}),
	);

export const removeTagFromArticles = createServerFn({ method: "POST" })
	.inputValidator((input) =>
		validateTagMutationInput(input, "Invalid tag removal."),
	)
	.handler(async ({ data }) =>
		handleRemoveTagFromArticles(data, {
			createRepository: createTagsRepository,
			requireUserIdFn: requireUserId,
		}),
	);
