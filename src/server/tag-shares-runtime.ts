import {
	sharedTagInputSchema,
	tagShareInputSchema,
	validateInput,
} from "#/server/input-schemas";
import type { TagSharesRepository } from "#/server/tag-shares-service";
import {
	createTagShareForUser,
	getSharedTagByToken,
	getTagShareForUser,
	revokeTagShareForUser,
} from "#/server/tag-shares-service";

type TagSharesRuntimeDependencies = {
	createRepository: () => TagSharesRepository;
	requireUserIdFn: () => Promise<string>;
	getTagShareForUserFn?: typeof getTagShareForUser;
	createTagShareForUserFn?: typeof createTagShareForUser;
	revokeTagShareForUserFn?: typeof revokeTagShareForUser;
	getSharedTagByTokenFn?: typeof getSharedTagByToken;
};

export function validateTagShareInput(input: unknown) {
	return validateInput(tagShareInputSchema, input, "Invalid tag selection.");
}

export function validateSharedTagInput(input: unknown) {
	return validateInput(sharedTagInputSchema, input, "Invalid sharing link.");
}

export async function handleGetTagShare(
	data: ReturnType<typeof validateTagShareInput>,
	deps: TagSharesRuntimeDependencies,
) {
	return (deps.getTagShareForUserFn ?? getTagShareForUser)({
		repo: deps.createRepository(),
		userId: await deps.requireUserIdFn(),
		tagId: data.tagId,
	});
}

export async function handleCreateTagShare(
	data: ReturnType<typeof validateTagShareInput>,
	deps: TagSharesRuntimeDependencies,
) {
	return (deps.createTagShareForUserFn ?? createTagShareForUser)({
		repo: deps.createRepository(),
		userId: await deps.requireUserIdFn(),
		tagId: data.tagId,
	});
}

export async function handleRevokeTagShare(
	data: ReturnType<typeof validateTagShareInput>,
	deps: TagSharesRuntimeDependencies,
) {
	return (deps.revokeTagShareForUserFn ?? revokeTagShareForUser)({
		repo: deps.createRepository(),
		userId: await deps.requireUserIdFn(),
		tagId: data.tagId,
	});
}

export async function handleGetSharedTag(
	data: ReturnType<typeof validateSharedTagInput>,
	deps: Pick<
		TagSharesRuntimeDependencies,
		"createRepository" | "getSharedTagByTokenFn"
	>,
) {
	return (deps.getSharedTagByTokenFn ?? getSharedTagByToken)({
		repo: deps.createRepository(),
		token: data.token,
		page: data.page,
	});
}
