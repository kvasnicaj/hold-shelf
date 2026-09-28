import type { CreateArticleResponse } from "@hold-shelf/api-contracts";
import {
	type ApiV1AuthDependencies,
	authenticateApiV1Request,
	createApiErrorResponse,
	createApiInternalErrorResponse,
	readApiV1Json,
} from "#/server/api-v1";
import { toApiV1ArticleList } from "#/server/api-v1-articles";
import {
	ArticleAlreadyExistsError,
	type ArticlesRepository,
	createArticleForUser,
	getArticlesForUser,
} from "#/server/articles-service";
import {
	createArticleInputSchema,
	getArticlesInputSchema,
	validateInput,
} from "#/server/input-schemas";
import type { extractMetadata } from "#/server/metadata";

type V1ArticlesDependencies = ApiV1AuthDependencies & {
	createArticlesRepositoryFn?: () => ArticlesRepository;
	createArticleForUserFn?: typeof createArticleForUser;
	extractMetadataFn?: typeof extractMetadata;
	getArticlesForUserFn?: typeof getArticlesForUser;
};

export async function handleV1ArticlesGet(
	{ request }: { request: Request },
	deps: V1ArticlesDependencies = {},
) {
	const auth = await authenticateApiV1Request(request, deps);
	if (!auth.authenticated) {
		return auth.response;
	}

	let data: ReturnType<typeof validateGetArticlesInput>;
	try {
		data = validateGetArticlesInput(getArticlesQuery(request));
	} catch {
		return createApiErrorResponse(
			"INVALID_QUERY",
			"Invalid article query.",
			400,
		);
	}

	try {
		const result = await (deps.getArticlesForUserFn ?? getArticlesForUser)({
			repo: await getArticlesRepository(deps),
			userId: auth.userId,
			data,
		});

		return Response.json(toApiV1ArticleList(result));
	} catch (error) {
		return createApiInternalErrorResponse(
			"LIST_FAILED",
			"Failed to list articles.",
			error,
		);
	}
}

export async function handleV1ArticlesPost(
	{ request }: { request: Request },
	deps: V1ArticlesDependencies = {},
) {
	const auth = await authenticateApiV1Request(request, deps);
	if (!auth.authenticated) {
		return auth.response;
	}

	const payload = await readApiV1Json(request);
	if (!payload.valid) {
		return payload.response;
	}

	let data: ReturnType<typeof validateCreateArticleInput>;
	try {
		data = validateCreateArticleInput(payload.data);
	} catch {
		return createApiErrorResponse("INVALID_URL", "Invalid article URL.", 400);
	}

	try {
		const article = await (deps.createArticleForUserFn ?? createArticleForUser)(
			{
				repo: await getArticlesRepository(deps),
				userId: auth.userId,
				url: data.url,
				checkRateLimitFn:
					deps.checkRateLimitFn ??
					(await import("#/server/rate-limit")).checkRateLimit,
				extractMetadataFn:
					deps.extractMetadataFn ??
					(await import("#/server/metadata")).extractMetadata,
			},
		);

		const response: CreateArticleResponse = {
			status: "saved",
			article: {
				id: article.id,
				url: article.url,
				title: article.title,
			},
		};
		return Response.json(response);
	} catch (error) {
		return createCreateArticleErrorResponse(error);
	}
}

function getArticlesQuery(request: Request) {
	const searchParams = new URL(request.url).searchParams;
	const query: Record<string, string | number | boolean> = {};

	for (const key of ["isRead", "isFavorite"] as const) {
		const value = searchParams.get(key);
		if (value === "true" || value === "false") {
			query[key] = value === "true";
		} else if (value !== null) {
			query[key] = value;
		}
	}

	for (const key of ["limit", "offset"] as const) {
		const value = searchParams.get(key);
		if (value !== null) {
			query[key] = Number(value);
		}
	}

	for (const key of ["tagId", "search", "sort"] as const) {
		const value = searchParams.get(key);
		if (value !== null) {
			query[key] = value;
		}
	}

	return query;
}

function validateGetArticlesInput(input: unknown) {
	return validateInput(
		getArticlesInputSchema,
		input ?? {},
		"Invalid article query.",
	);
}

function validateCreateArticleInput(input: unknown) {
	return validateInput(createArticleInputSchema, input, "Invalid article URL.");
}

async function getArticlesRepository(deps: V1ArticlesDependencies) {
	return deps.createArticlesRepositoryFn
		? deps.createArticlesRepositoryFn()
		: (await import("#/server/articles-repository")).createArticlesRepository();
}

function createCreateArticleErrorResponse(error: unknown) {
	if (error instanceof ArticleAlreadyExistsError) {
		const response: CreateArticleResponse = {
			status: "exists",
			message: error.message,
			article: {
				id: error.articleId,
				url: error.url,
			},
		};
		return Response.json(response);
	}

	if (error instanceof Error) {
		if (error.message === "Rate limit exceeded. Please try again later.") {
			return createApiErrorResponse("RATE_LIMITED", error.message, 429);
		}

		return createApiInternalErrorResponse(
			"SAVE_FAILED",
			"Failed to save article.",
			error,
		);
	}

	return createApiInternalErrorResponse(
		"SAVE_FAILED",
		"Failed to save article.",
		error,
	);
}
