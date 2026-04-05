import { getAuth } from "#/lib/auth";
import { getClientRateLimitKey } from "#/server/client-key";
import { checkRateLimit } from "#/server/rate-limit";

export function handleAuthGet({ request }: { request: Request }) {
	return handleAuthRequest(request);
}

export async function handleAuthPost({ request }: { request: Request }) {
	const clientKey = getClientRateLimitKey(request);
	const { allowed, retryAfterMs } = await checkRateLimit(
		{ name: "auth", windowMs: 60_000, max: 10 },
		clientKey,
	);
	if (!allowed) {
		return new Response("Too many requests", {
			status: 429,
			headers: {
				"Retry-After": String(Math.ceil(retryAfterMs / 1000)),
			},
		});
	}

	return handleAuthRequest(request);
}

async function handleAuthRequest(request: Request) {
	try {
		return await getAuth().handler(request);
	} catch (error) {
		return createAuthErrorResponse(error);
	}
}

function createAuthErrorResponse(error: unknown) {
	if (isAuthApiError(error)) {
		return Response.json(
			error.body ?? { message: "Authentication failed", code: "AUTH_ERROR" },
			{
				status: error.statusCode,
				headers: new Headers(error.headers),
			},
		);
	}

	return Response.json(
		{
			message: "Authentication failed",
			code: "AUTH_HANDLER_ERROR",
		},
		{ status: 500 },
	);
}

function isAuthApiError(error: unknown): error is {
	body?: unknown;
	headers?: HeadersInit;
	name: string;
	statusCode: number;
} {
	return (
		typeof error === "object" &&
		error !== null &&
		"name" in error &&
		error.name === "APIError" &&
		"statusCode" in error &&
		typeof error.statusCode === "number"
	);
}
