import {
	createTagInputSchema,
	deleteTagInputSchema,
	tagMutationInputSchema,
	updateTagInputSchema,
	validateInput,
} from "#/server/input-schemas";
import type { TagsRepository } from "#/server/tags-service";
import {
	addTagToArticlesForUser,
	createTagForUser,
	deleteTagForUser,
	getTagsForUser,
	removeTagFromArticlesForUser,
	updateTagForUser,
} from "#/server/tags-service";

type TagsRuntimeDependencies = {
	createRepository: () => TagsRepository;
	requireUserIdFn: () => Promise<string>;
	getTagsForUserFn?: typeof getTagsForUser;
	createTagForUserFn?: typeof createTagForUser;
	updateTagForUserFn?: typeof updateTagForUser;
	deleteTagForUserFn?: typeof deleteTagForUser;
	addTagToArticlesForUserFn?: typeof addTagToArticlesForUser;
	removeTagFromArticlesForUserFn?: typeof removeTagFromArticlesForUser;
};

export function validateCreateTagInput(input: unknown) {
	return validateInput(createTagInputSchema, input, "Invalid tag data.");
}

export function validateUpdateTagInput(input: unknown) {
	return validateInput(updateTagInputSchema, input, "Invalid tag update.");
}

export function validateDeleteTagInput(input: unknown) {
	return validateInput(deleteTagInputSchema, input, "Invalid tag selection.");
}

export function validateTagMutationInput(
	input: unknown,
	message = "Invalid tag assignment.",
) {
	return validateInput(tagMutationInputSchema, input, message);
}

export async function handleGetTags(deps: TagsRuntimeDependencies) {
	const userId = await deps.requireUserIdFn();
	return (deps.getTagsForUserFn ?? getTagsForUser)({
		repo: deps.createRepository(),
		userId,
	});
}

export async function handleCreateTag(
	data: ReturnType<typeof validateCreateTagInput>,
	deps: TagsRuntimeDependencies,
) {
	const userId = await deps.requireUserIdFn();
	return (deps.createTagForUserFn ?? createTagForUser)({
		repo: deps.createRepository(),
		userId,
		name: data.name,
		color: data.color,
	});
}

export async function handleUpdateTag(
	data: ReturnType<typeof validateUpdateTagInput>,
	deps: TagsRuntimeDependencies,
) {
	const userId = await deps.requireUserIdFn();
	return (deps.updateTagForUserFn ?? updateTagForUser)({
		repo: deps.createRepository(),
		userId,
		id: data.id,
		name: data.name,
	});
}

export async function handleDeleteTag(
	data: ReturnType<typeof validateDeleteTagInput>,
	deps: TagsRuntimeDependencies,
) {
	const userId = await deps.requireUserIdFn();
	return (deps.deleteTagForUserFn ?? deleteTagForUser)({
		repo: deps.createRepository(),
		userId,
		id: data.id,
	});
}

export async function handleAddTagToArticles(
	data: ReturnType<typeof validateTagMutationInput>,
	deps: TagsRuntimeDependencies,
) {
	const userId = await deps.requireUserIdFn();
	return (deps.addTagToArticlesForUserFn ?? addTagToArticlesForUser)({
		repo: deps.createRepository(),
		userId,
		tagId: data.tagId,
		articleIds: data.articleIds,
	});
}

export async function handleRemoveTagFromArticles(
	data: ReturnType<typeof validateTagMutationInput>,
	deps: TagsRuntimeDependencies,
) {
	const userId = await deps.requireUserIdFn();
	return (deps.removeTagFromArticlesForUserFn ?? removeTagFromArticlesForUser)({
		repo: deps.createRepository(),
		userId,
		tagId: data.tagId,
		articleIds: data.articleIds,
	});
}
