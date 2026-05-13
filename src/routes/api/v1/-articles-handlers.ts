import { getUserIdFromBearerToken } from "#/server/api-token-auth";
import type { ApiTokensRepository } from "#/server/api-tokens-service";
import {
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
import type { checkRateLimit } from "#/server/rate-limit";

type V1ArticlesDependencies = {
	checkRateLimitFn?: typeof checkRateLimit;
	createArticlesRepositoryFn?: () => ArticlesRepository;
	createApiTokensRepositoryFn?: () => ApiTokensRepository;
	createArticleForUserFn?: typeof createArticleForUser;
	extractMetadataFn?: typeof extractMetadata;
	getArticlesForUserFn?: typeof getArticlesForUser;
	getUserIdFromBearerTokenFn?: typeof getUserIdFromBearerToken;
};

export async function handleV1ArticlesGet(
	{ request }: { request: Request },
	deps: V1ArticlesDependencies = {},
) {
	const authLimit = await checkApiRateLimit(request, deps, "auth");
	if (!authLimit.allowed) {
		return createRateLimitedResponse(authLimit.retryAfterMs);
	}

	const userId = await getApiUserId(request, deps);
	if (!userId) {
		return createJsonError(
			"UNAUTHORIZED",
			"Invalid or missing API token.",
			401,
		);
	}

	const requestLimit = await checkApiRateLimit(request, deps, "user", userId);
	if (!requestLimit.allowed) {
		return createRateLimitedResponse(requestLimit.retryAfterMs);
	}

	let data: ReturnType<typeof validateGetArticlesInput>;
	try {
		data = validateGetArticlesInput(getArticlesQuery(request));
	} catch {
		return createJsonError("INVALID_QUERY", "Invalid article query.", 400);
	}

	try {
		const result = await (deps.getArticlesForUserFn ?? getArticlesForUser)({
			repo: await getArticlesRepository(deps),
			userId,
			data,
		});

		return Response.json(result);
	} catch (error) {
		return createJsonError(
			"LIST_FAILED",
			error instanceof Error ? error.message : "Failed to list articles.",
			500,
		);
	}
}

export async function handleV1ArticlesPost(
	{ request }: { request: Request },
	deps: V1ArticlesDependencies = {},
) {
	const authLimit = await checkApiRateLimit(request, deps, "auth");
	if (!authLimit.allowed) {
		return createRateLimitedResponse(authLimit.retryAfterMs);
	}

	const userId = await getApiUserId(request, deps);
	if (!userId) {
		return createJsonError(
			"UNAUTHORIZED",
			"Invalid or missing API token.",
			401,
		);
	}

	const requestLimit = await checkApiRateLimit(request, deps, "user", userId);
	if (!requestLimit.allowed) {
		return createRateLimitedResponse(requestLimit.retryAfterMs);
	}

	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return createJsonError(
			"INVALID_JSON",
			"Request body must be valid JSON.",
			400,
		);
	}

	let data: ReturnType<typeof validateCreateArticleInput>;
	try {
		data = validateCreateArticleInput(payload);
	} catch {
		return createJsonError("INVALID_URL", "Invalid article URL.", 400);
	}

	try {
		const article = await (deps.createArticleForUserFn ?? createArticleForUser)(
			{
				repo: await getArticlesRepository(deps),
				userId,
				url: data.url,
				checkRateLimitFn:
					deps.checkRateLimitFn ??
					(await import("#/server/rate-limit")).checkRateLimit,
				extractMetadataFn:
					deps.extractMetadataFn ??
					(await import("#/server/metadata")).extractMetadata,
			},
		);

		return Response.json({
			status: "saved",
			article: {
				id: article.id,
				url: article.url,
				title: article.title,
			},
		});
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

async function getApiUserId(request: Request, deps: V1ArticlesDependencies) {
	return (deps.getUserIdFromBearerTokenFn ?? getUserIdFromBearerToken)({
		authorization: request.headers.get("authorization"),
		repo: await getApiTokensRepository(deps),
	});
}

async function getArticlesRepository(deps: V1ArticlesDependencies) {
	return deps.createArticlesRepositoryFn
		? deps.createArticlesRepositoryFn()
		: (await import("#/server/articles-repository")).createArticlesRepository();
}

async function getApiTokensRepository(deps: V1ArticlesDependencies) {
	return deps.createApiTokensRepositoryFn
		? deps.createApiTokensRepositoryFn()
		: (
				await import("#/server/api-tokens-repository")
			).createApiTokensRepository();
}

async function checkApiRateLimit(
	request: Request,
	deps: V1ArticlesDependencies,
	kind: "auth" | "user",
	userId?: string,
) {
	const checkRateLimitFn =
		deps.checkRateLimitFn ??
		(await import("#/server/rate-limit")).checkRateLimit;

	if (kind === "user") {
		return checkRateLimitFn(
			{ name: "api-v1-articles", windowMs: 60_000, max: 120 },
			userId ?? "anonymous",
		);
	}

	return checkRateLimitFn(
		{ name: "api-v1-auth", windowMs: 60_000, max: 60 },
		getClientRateLimitKey(request),
	);
}

function getClientRateLimitKey(request: Request) {
	const forwardedFor = request.headers.get("x-forwarded-for");
	const forwardedIp = forwardedFor?.split(",")[0]?.trim();
	return (
		request.headers.get("cf-connecting-ip") ??
		forwardedIp ??
		request.headers.get("x-real-ip") ??
		"unknown"
	);
}

function createRateLimitedResponse(retryAfterMs: number) {
	const headers = new Headers();
	headers.set("Retry-After", String(Math.ceil(retryAfterMs / 1000)));

	return Response.json(
		{
			code: "RATE_LIMITED",
			message: "Rate limit exceeded. Please try again later.",
		},
		{ status: 429, headers },
	);
}

function createCreateArticleErrorResponse(error: unknown) {
	if (error instanceof Error) {
		if (error.message === "This URL is already in your library.") {
			return Response.json({
				status: "exists",
				message: error.message,
			});
		}

		if (error.message === "Rate limit exceeded. Please try again later.") {
			return createJsonError("RATE_LIMITED", error.message, 429);
		}

		return createJsonError("SAVE_FAILED", error.message, 500);
	}

	return createJsonError("SAVE_FAILED", "Failed to save article.", 500);
}

function createJsonError(code: string, message: string, status: number) {
	return Response.json({ code, message }, { status });
}
