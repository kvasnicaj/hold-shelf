import { getAuth } from "#/lib/auth";
import { createArticlesRepository } from "#/server/articles-repository";
import { validateCreateArticleInput } from "#/server/articles-runtime";
import { createArticleForUser } from "#/server/articles-service";
import { getSessionFromHeaders } from "#/server/auth-runtime";
import { extractMetadata } from "#/server/metadata";
import { checkRateLimit } from "#/server/rate-limit";

type ExtensionSession = {
	user?: {
		id?: string;
	} | null;
} | null;

type CreateExtensionArticleDependencies = {
	checkRateLimitFn?: typeof checkRateLimit;
	createRepository?: typeof createArticlesRepository;
	createArticleForUserFn?: typeof createArticleForUser;
	extractMetadataFn?: typeof extractMetadata;
	getSessionFn?: (input: { headers: Headers }) => Promise<ExtensionSession>;
};

export async function handleExtensionArticlesOptions({
	request,
}: {
	request: Request;
}) {
	return withExtensionCors(
		new Response(null, {
			status: 204,
			headers: {
				"Access-Control-Allow-Headers": "content-type",
				"Access-Control-Allow-Methods": "OPTIONS, POST",
				"Access-Control-Max-Age": "86400",
			},
		}),
		request,
	);
}

export async function handleExtensionArticlesPost(
	{ request }: { request: Request },
	deps: CreateExtensionArticleDependencies = {},
) {
	let payload: unknown;

	try {
		payload = await request.json();
	} catch {
		return withExtensionCors(
			Response.json(
				{
					code: "INVALID_JSON",
					message: "Request body must be valid JSON.",
				},
				{ status: 400 },
			),
			request,
		);
	}

	let data: ReturnType<typeof validateCreateArticleInput>;
	try {
		data = validateCreateArticleInput(payload);
	} catch (error) {
		return withExtensionCors(
			Response.json(
				{
					code: "INVALID_URL",
					message:
						error instanceof Error ? error.message : "Invalid article URL.",
				},
				{ status: 400 },
			),
			request,
		);
	}

	const session = await (deps.getSessionFn
		? getSessionFromHeaders({
				headers: request.headers,
				getSessionFn: deps.getSessionFn,
			})
		: getAuth().api.getSession({ headers: request.headers }));

	const loginUrl = new URL("/save", request.url);
	loginUrl.searchParams.set("url", data.url);

	if (!session?.user?.id) {
		return withExtensionCors(
			Response.json(
				{
					code: "UNAUTHORIZED",
					message: "Sign in to Hold Shelf to save from Chrome.",
					loginUrl: loginUrl.toString(),
				},
				{ status: 401 },
			),
			request,
		);
	}

	try {
		const article = await (deps.createArticleForUserFn ?? createArticleForUser)(
			{
				repo: (deps.createRepository ?? createArticlesRepository)(),
				userId: session.user.id,
				url: data.url,
				checkRateLimitFn: deps.checkRateLimitFn ?? checkRateLimit,
				extractMetadataFn: deps.extractMetadataFn ?? extractMetadata,
			},
		);

		return withExtensionCors(
			Response.json(
				{
					status: "saved",
					article: {
						id: article.id,
						url: article.url,
						title: article.title,
					},
				},
				{ status: 200 },
			),
			request,
		);
	} catch (error) {
		return withExtensionCors(createCreateArticleErrorResponse(error), request);
	}
}

function createCreateArticleErrorResponse(error: unknown) {
	if (!(error instanceof Error)) {
		return Response.json(
			{
				code: "SAVE_FAILED",
				message: "Failed to save article.",
			},
			{ status: 500 },
		);
	}

	if (error.message === "This URL is already in your library.") {
		return Response.json(
			{
				code: "ARTICLE_EXISTS",
				message: error.message,
			},
			{ status: 409 },
		);
	}

	if (error.message === "Rate limit exceeded. Please try again later.") {
		return Response.json(
			{
				code: "RATE_LIMITED",
				message: error.message,
			},
			{ status: 429 },
		);
	}

	return Response.json(
		{
			code: "SAVE_FAILED",
			message: error.message,
		},
		{ status: 500 },
	);
}

function withExtensionCors(response: Response, request: Request) {
	const origin = request.headers.get("origin");

	if (!origin?.startsWith("chrome-extension://")) {
		return response;
	}

	const headers = new Headers(response.headers);
	headers.set("Access-Control-Allow-Credentials", "true");
	headers.set("Access-Control-Allow-Origin", origin);
	headers.append("Vary", "Origin");

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}
