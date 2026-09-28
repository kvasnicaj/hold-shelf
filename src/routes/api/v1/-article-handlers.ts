import {
	type ApiV1AuthDependencies,
	authenticateApiV1Request,
	createApiErrorResponse,
	createApiInternalErrorResponse,
	readApiV1Json,
} from "#/server/api-v1";
import { toApiV1ArticleReader } from "#/server/api-v1-articles";
import type { extractArticleContent } from "#/server/article-content";
import {
	validateGetArticleReaderInput,
	validateUpdateArticleInput,
} from "#/server/articles-runtime";
import {
	type ArticlesRepository,
	deleteArticleForUser,
	getArticleReaderForUser,
	updateArticleForUser,
} from "#/server/articles-service";

type V1ArticleDependencies = ApiV1AuthDependencies & {
	createArticlesRepositoryFn?: () => ArticlesRepository;
	deleteArticleForUserFn?: typeof deleteArticleForUser;
	extractArticleContentFn?: typeof extractArticleContent;
	getArticleReaderForUserFn?: typeof getArticleReaderForUser;
	updateArticleForUserFn?: typeof updateArticleForUser;
};

type V1ArticleRequest = {
	request: Request;
	params: { id: string };
};

export async function handleV1ArticleGet(
	{ request, params }: V1ArticleRequest,
	deps: V1ArticleDependencies = {},
) {
	const auth = await authenticateApiV1Request(request, deps);
	if (!auth.authenticated) {
		return auth.response;
	}

	const input = getArticleIdInput(params.id);
	if (!input.valid) {
		return input.response;
	}

	try {
		const reader = await (
			deps.getArticleReaderForUserFn ?? getArticleReaderForUser
		)({
			repo: await getArticlesRepository(deps),
			userId: auth.userId,
			id: input.id,
			extractArticleContentFn:
				deps.extractArticleContentFn ??
				(await import("#/server/article-content")).extractArticleContent,
		});
		return Response.json(toApiV1ArticleReader(reader));
	} catch (error) {
		return createArticleErrorResponse(error, "ARTICLE_READ_FAILED");
	}
}

export async function handleV1ArticlePatch(
	{ request, params }: V1ArticleRequest,
	deps: V1ArticleDependencies = {},
) {
	const auth = await authenticateApiV1Request(request, deps);
	if (!auth.authenticated) {
		return auth.response;
	}

	const articleInput = getArticleIdInput(params.id);
	if (!articleInput.valid) {
		return articleInput.response;
	}

	const payload = await readApiV1Json(request);
	if (!payload.valid) {
		return payload.response;
	}

	let data: ReturnType<typeof validateUpdateArticleInput>;
	try {
		const fields = isRecord(payload.data) ? payload.data : {};
		data = validateUpdateArticleInput({ ...fields, id: articleInput.id });
	} catch {
		return createApiErrorResponse(
			"INVALID_ARTICLE_UPDATE",
			"Invalid article update.",
			400,
		);
	}

	try {
		const result = await (deps.updateArticleForUserFn ?? updateArticleForUser)({
			repo: await getArticlesRepository(deps),
			userId: auth.userId,
			data,
		});
		return Response.json(result);
	} catch (error) {
		return createArticleErrorResponse(error, "UPDATE_FAILED");
	}
}

export async function handleV1ArticleDelete(
	{ request, params }: V1ArticleRequest,
	deps: V1ArticleDependencies = {},
) {
	const auth = await authenticateApiV1Request(request, deps);
	if (!auth.authenticated) {
		return auth.response;
	}

	const input = getArticleIdInput(params.id);
	if (!input.valid) {
		return input.response;
	}

	try {
		const result = await (deps.deleteArticleForUserFn ?? deleteArticleForUser)({
			repo: await getArticlesRepository(deps),
			userId: auth.userId,
			id: input.id,
		});
		return Response.json(result);
	} catch (error) {
		return createArticleErrorResponse(error, "DELETE_FAILED");
	}
}

function getArticleIdInput(id: string) {
	try {
		return {
			valid: true as const,
			id: validateGetArticleReaderInput({ id }).id,
		};
	} catch {
		return {
			valid: false as const,
			response: createApiErrorResponse(
				"INVALID_ARTICLE_ID",
				"Invalid article id.",
				400,
			),
		};
	}
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function getArticlesRepository(deps: V1ArticleDependencies) {
	return deps.createArticlesRepositoryFn
		? deps.createArticlesRepositoryFn()
		: (await import("#/server/articles-repository")).createArticlesRepository();
}

function createArticleErrorResponse(error: unknown, fallbackCode: string) {
	if (error instanceof Error && error.message === "Article not found.") {
		return createApiErrorResponse(
			"ARTICLE_NOT_FOUND",
			"Article not found.",
			404,
		);
	}

	return createApiInternalErrorResponse(
		fallbackCode,
		"Article request failed.",
		error,
	);
}
