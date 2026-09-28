import type { ApiError } from "@hold-shelf/api-contracts";
import { getUserIdFromBearerToken } from "#/server/api-token-auth";
import type { ApiTokensRepository } from "#/server/api-tokens-service";
import type { checkRateLimit } from "#/server/rate-limit";

const API_AUTH_RATE_LIMIT = {
	name: "api-v1-auth",
	windowMs: 60_000,
	max: 60,
} as const;

const API_USER_RATE_LIMIT = {
	name: "api-v1",
	windowMs: 60_000,
	max: 120,
} as const;

export type ApiV1AuthDependencies = {
	checkRateLimitFn?: typeof checkRateLimit;
	createApiTokensRepositoryFn?: () => ApiTokensRepository;
	getUserIdFromBearerTokenFn?: typeof getUserIdFromBearerToken;
};

type ApiV1AuthenticationResult =
	| { authenticated: true; userId: string }
	| { authenticated: false; response: Response };

type ApiV1JsonResult =
	| { valid: true; data: unknown }
	| { valid: false; response: Response };

export async function authenticateApiV1Request(
	request: Request,
	deps: ApiV1AuthDependencies = {},
): Promise<ApiV1AuthenticationResult> {
	try {
		return await authenticateApiV1RequestUnchecked(request, deps);
	} catch (error) {
		return {
			authenticated: false,
			response: createApiInternalErrorResponse(
				"AUTHENTICATION_UNAVAILABLE",
				"Authentication service is temporarily unavailable.",
				error,
			),
		};
	}
}

async function authenticateApiV1RequestUnchecked(
	request: Request,
	deps: ApiV1AuthDependencies,
): Promise<ApiV1AuthenticationResult> {
	const checkRateLimitFn =
		deps.checkRateLimitFn ??
		(await import("#/server/rate-limit")).checkRateLimit;
	const authLimit = await checkRateLimitFn(
		API_AUTH_RATE_LIMIT,
		getClientRateLimitKey(request),
	);
	if (!authLimit.allowed) {
		return {
			authenticated: false,
			response: createApiRateLimitedResponse(authLimit.retryAfterMs),
		};
	}

	const repo = deps.createApiTokensRepositoryFn
		? deps.createApiTokensRepositoryFn()
		: (
				await import("#/server/api-tokens-repository")
			).createApiTokensRepository();
	const userId = await (
		deps.getUserIdFromBearerTokenFn ?? getUserIdFromBearerToken
	)({
		authorization: request.headers.get("authorization"),
		repo,
	});
	if (!userId) {
		return {
			authenticated: false,
			response: createApiErrorResponse(
				"UNAUTHORIZED",
				"Invalid or missing API token.",
				401,
			),
		};
	}

	const userLimit = await checkRateLimitFn(API_USER_RATE_LIMIT, userId);
	if (!userLimit.allowed) {
		return {
			authenticated: false,
			response: createApiRateLimitedResponse(userLimit.retryAfterMs),
		};
	}

	return { authenticated: true, userId };
}

export async function readApiV1Json(
	request: Request,
): Promise<ApiV1JsonResult> {
	try {
		return { valid: true, data: await request.json() };
	} catch {
		return {
			valid: false,
			response: createApiErrorResponse(
				"INVALID_JSON",
				"Request body must be valid JSON.",
				400,
			),
		};
	}
}

export function createApiErrorResponse(
	code: string,
	message: string,
	status: number,
) {
	const error: ApiError = { code, message };
	return Response.json(error, { status });
}

export function createApiInternalErrorResponse(
	code: string,
	message: string,
	error: unknown,
) {
	console.error("API v1 request failed.", {
		code,
		error: error instanceof Error ? error.message : String(error),
	});
	return createApiErrorResponse(code, message, 500);
}

export function createApiRateLimitedResponse(retryAfterMs: number) {
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
