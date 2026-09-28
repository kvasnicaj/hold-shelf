import { createServerFn } from "@tanstack/react-start";
import { requireUserId } from "#/server/helpers";
import { createTagsRepository } from "#/server/tags-repository";
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

export const getTags = createServerFn({ method: "GET" }).handler(async () =>
	handleGetTags({
		createRepository: createTagsRepository,
		requireUserIdFn: requireUserId,
	}),
);

export const createTag = createServerFn({ method: "POST" })
	.validator(validateCreateTagInput)
	.handler(async ({ data }) =>
		handleCreateTag(data, {
			createRepository: createTagsRepository,
			requireUserIdFn: requireUserId,
		}),
	);

export const updateTag = createServerFn({ method: "POST" })
	.validator(validateUpdateTagInput)
	.handler(async ({ data }) =>
		handleUpdateTag(data, {
			createRepository: createTagsRepository,
			requireUserIdFn: requireUserId,
		}),
	);

export const deleteTag = createServerFn({ method: "POST" })
	.validator(validateDeleteTagInput)
	.handler(async ({ data }) =>
		handleDeleteTag(data, {
			createRepository: createTagsRepository,
			requireUserIdFn: requireUserId,
		}),
	);

export const addTagToArticles = createServerFn({ method: "POST" })
	.validator(validateTagMutationInput)
	.handler(async ({ data }) =>
		handleAddTagToArticles(data, {
			createRepository: createTagsRepository,
			requireUserIdFn: requireUserId,
		}),
	);

export const removeTagFromArticles = createServerFn({ method: "POST" })
	.validator((input) => validateTagMutationInput(input, "Invalid tag removal."))
	.handler(async ({ data }) =>
		handleRemoveTagFromArticles(data, {
			createRepository: createTagsRepository,
			requireUserIdFn: requireUserId,
		}),
	);
