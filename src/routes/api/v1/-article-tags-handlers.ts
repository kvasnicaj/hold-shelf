import {
	type ApiV1AuthDependencies,
	authenticateApiV1Request,
	createApiErrorResponse,
	createApiInternalErrorResponse,
} from "#/server/api-v1";
import { validateTagMutationInput } from "#/server/tags-runtime";
import {
	addTagToArticlesForUser,
	removeTagFromArticlesForUser,
	type TagsRepository,
} from "#/server/tags-service";

type V1ArticleTagsDependencies = ApiV1AuthDependencies & {
	addTagToArticlesForUserFn?: typeof addTagToArticlesForUser;
	createTagsRepositoryFn?: () => TagsRepository;
	removeTagFromArticlesForUserFn?: typeof removeTagFromArticlesForUser;
};

type V1ArticleTagRequest = {
	request: Request;
	params: { id: string; tagId: string };
};

export async function handleV1ArticleTagPut(
	{ request, params }: V1ArticleTagRequest,
	deps: V1ArticleTagsDependencies = {},
) {
	return handleArticleTagMutation({
		request,
		params,
		deps,
		operation: "add",
	});
}

export async function handleV1ArticleTagDelete(
	{ request, params }: V1ArticleTagRequest,
	deps: V1ArticleTagsDependencies = {},
) {
	return handleArticleTagMutation({
		request,
		params,
		deps,
		operation: "remove",
	});
}

async function handleArticleTagMutation({
	request,
	params,
	deps,
	operation,
}: V1ArticleTagRequest & {
	deps: V1ArticleTagsDependencies;
	operation: "add" | "remove";
}) {
	const auth = await authenticateApiV1Request(request, deps);
	if (!auth.authenticated) {
		return auth.response;
	}

	let data: ReturnType<typeof validateTagMutationInput>;
	try {
		data = validateTagMutationInput({
			tagId: params.tagId,
			articleIds: [params.id],
		});
	} catch {
		return createApiErrorResponse(
			"INVALID_TAG_ASSIGNMENT",
			"Invalid tag assignment.",
			400,
		);
	}

	try {
		const repo = await getTagsRepository(deps);
		const result =
			operation === "add"
				? await (deps.addTagToArticlesForUserFn ?? addTagToArticlesForUser)({
						repo,
						userId: auth.userId,
						tagId: data.tagId,
						articleIds: data.articleIds,
					})
				: await (
						deps.removeTagFromArticlesForUserFn ?? removeTagFromArticlesForUser
					)({
						repo,
						userId: auth.userId,
						tagId: data.tagId,
						articleIds: data.articleIds,
					});

		return Response.json(result);
	} catch (error) {
		return createTagMutationErrorResponse(error, operation);
	}
}

async function getTagsRepository(deps: V1ArticleTagsDependencies) {
	return deps.createTagsRepositoryFn
		? deps.createTagsRepositoryFn()
		: (await import("#/server/tags-repository")).createTagsRepository();
}

function createTagMutationErrorResponse(
	error: unknown,
	operation: "add" | "remove",
) {
	if (error instanceof Error && error.message === "Tag not found.") {
		return createApiErrorResponse("TAG_NOT_FOUND", "Tag not found.", 404);
	}

	if (
		error instanceof Error &&
		error.message === "One or more articles were not found."
	) {
		return createApiErrorResponse(
			"ARTICLE_NOT_FOUND",
			"Article not found.",
			404,
		);
	}

	return createApiInternalErrorResponse(
		operation === "add" ? "TAG_ASSIGNMENT_FAILED" : "TAG_REMOVAL_FAILED",
		"Tag request failed.",
		error,
	);
}
