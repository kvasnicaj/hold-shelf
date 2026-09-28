import {
	type ApiV1AuthDependencies,
	authenticateApiV1Request,
	createApiInternalErrorResponse,
} from "#/server/api-v1";
import { toApiV1Tags } from "#/server/api-v1-tags";
import { getTagsForUser, type TagsRepository } from "#/server/tags-service";

type V1TagsDependencies = ApiV1AuthDependencies & {
	createTagsRepositoryFn?: () => TagsRepository;
	getTagsForUserFn?: typeof getTagsForUser;
};

export async function handleV1TagsGet(
	{ request }: { request: Request },
	deps: V1TagsDependencies = {},
) {
	const auth = await authenticateApiV1Request(request, deps);
	if (!auth.authenticated) {
		return auth.response;
	}

	try {
		const tags = await (deps.getTagsForUserFn ?? getTagsForUser)({
			repo: await getTagsRepository(deps),
			userId: auth.userId,
		});
		return Response.json(toApiV1Tags(tags));
	} catch (error) {
		return createApiInternalErrorResponse(
			"LIST_TAGS_FAILED",
			"Failed to list tags.",
			error,
		);
	}
}

async function getTagsRepository(deps: V1TagsDependencies) {
	return deps.createTagsRepositoryFn
		? deps.createTagsRepositoryFn()
		: (await import("#/server/tags-repository")).createTagsRepository();
}
