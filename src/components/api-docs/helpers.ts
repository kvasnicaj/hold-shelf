import type {
	ApiDocSection,
	ApiEndpoint,
	ApiParameter,
	ApiResponse,
} from "#/components/api-docs/types";

export const API_DOCS_PAGE_TITLE = "REST API documentation | Hold Shelf";

export const API_DOCS_PAGE_DESCRIPTION =
	"Use the Hold Shelf REST API to browse, search, read, save, and organize articles with a personal access token.";

export const API_DOCS_PAGE_CANONICAL_URL = "https://hold-shelf.com/api-docs";

export const API_DOCS_AGENT_EXPORT_PATH = "/api-docs/agents";

export const API_DOCS_AGENT_EXPORT_FILENAME = "hold-shelf-api-docs.md";

const PERSONAL_TOKEN_AUTH = "Authorization: Bearer <personal-access-token>";

const SAMPLE_TAG = {
	id: "tag_123",
	name: "Research",
	color: "#0d9488",
};

const SAMPLE_ARTICLE = {
	id: "article_123",
	url: "https://example.com/article",
	title: "Example article",
	description: "Short summary",
	hostname: "example.com",
	faviconUrl: "https://example.com/favicon.ico",
	isRead: false,
	isFavorite: false,
	createdAt: "2026-07-07T10:00:00.000Z",
	updatedAt: "2026-07-07T10:00:00.000Z",
	readAt: null,
	tags: [SAMPLE_TAG],
};

const SAMPLE_CREATED_ARTICLE = {
	id: SAMPLE_ARTICLE.id,
	url: SAMPLE_ARTICLE.url,
	title: SAMPLE_ARTICLE.title,
};

const SAMPLE_READER_CONTENT = {
	status: "ready",
	markdown: "# Example article\n\nReadable article text.",
	plainText: "Example article\n\nReadable article text.",
	wordCount: 6,
	fetchedAt: "2026-07-07T10:01:00.000Z",
};

const SAMPLE_TAG_SUMMARY = {
	...SAMPLE_TAG,
	createdAt: "2026-07-01T09:00:00.000Z",
	articleCount: 3,
};

const SAMPLE_DASHBOARD = {
	total: 42,
	unread: 17,
	read: 25,
	readThisWeek: 6,
	savedThisWeek: 9,
};

const ARTICLE_PATH_PARAMETERS: ApiParameter[] = [
	{
		name: "id",
		type: "string, 1-128 chars",
		required: true,
		description: "The article ID returned by an article endpoint.",
	},
];

const ARTICLE_TAG_PATH_PARAMETERS: ApiParameter[] = [
	...ARTICLE_PATH_PARAMETERS,
	{
		name: "tagId",
		type: "string, 1-128 chars",
		required: true,
		description: "The tag ID returned by GET /api/v1/tags.",
	},
];

const UNAUTHORIZED_RESPONSE: ApiResponse = {
	status: "401 Unauthorized",
	description: "The personal access token is missing or invalid.",
	body: formatJson({
		code: "UNAUTHORIZED",
		message: "Invalid or missing API token.",
	}),
};

const RATE_LIMITED_RESPONSE: ApiResponse = {
	status: "429 Too Many Requests",
	description: "The request limit was exceeded. Includes Retry-After.",
	body: formatJson({
		code: "RATE_LIMITED",
		message: "Rate limit exceeded. Please try again later.",
	}),
};

export const API_DOCS_SECTIONS: ApiDocSection[] = [
	{
		title: "Personal REST API",
		description:
			"Manage your Hold Shelf library with a personal access token from Settings -> API access. Limits are 60 requests per minute per client IP at the authentication boundary and 120 authenticated requests per minute per user.",
		endpoints: [
			withPersonalAccessToken({
				method: "GET",
				path: "/api/v1/me",
				summary: "Validate a personal access token and service URL.",
				responses: [
					{
						status: "200 OK",
						description: "The token is valid for this Hold Shelf service.",
						body: formatJson({ authenticated: true }),
					},
				],
				exampleRequest: createPersonalApiCurl("/api/v1/me"),
				exampleResponse: formatJson({ authenticated: true }),
				notes: [
					"This deliberately returns no profile data; clients use it as a credential health check.",
				],
			}),
			withPersonalAccessToken({
				method: "GET",
				path: "/api/v1/articles",
				summary: "List articles in your library.",
				parameters: [
					{
						name: "isRead",
						type: "boolean",
						description: "Filter by unread or read state.",
					},
					{
						name: "isFavorite",
						type: "boolean",
						description: "Filter by favorite state.",
					},
					{
						name: "tagId",
						type: "string",
						description: "Filter to articles with one tag.",
					},
					{
						name: "search",
						type: "string, max 200 chars",
						description: "Search article title, URL, description, or hostname.",
					},
					{
						name: "sort",
						type: "newest | oldest | title",
						description: "Sort order. Defaults to newest.",
					},
					{
						name: "limit",
						type: "integer, 1-100",
						description: "Page size. Defaults to 20.",
					},
					{
						name: "offset",
						type: "integer, 0-10000",
						description: "Number of records to skip. Defaults to 0.",
					},
				],
				responses: [
					{
						status: "200 OK",
						description: "A page of articles and the unpaginated total count.",
						body: formatJson({ items: [SAMPLE_ARTICLE], total: 1 }),
					},
					invalidResponse(
						"INVALID_QUERY",
						"Invalid article query.",
						"One or more query parameters are invalid.",
					),
				],
				exampleRequest: createPersonalApiCurl(
					"/api/v1/articles?limit=10&isRead=false&sort=newest",
				),
				exampleResponse: formatJson({ items: [], total: 0 }),
				notes: [
					"Only articles owned by the token owner are returned.",
					"Dates are ISO 8601 strings and total is calculated before limit and offset are applied.",
				],
			}),
			withPersonalAccessToken({
				method: "POST",
				path: "/api/v1/articles",
				summary: "Save a new article URL.",
				contentType: "application/json",
				bodyFields: [
					{
						name: "url",
						type: "http/https URL, max 2048 chars",
						required: true,
						description: "The article URL to save.",
					},
				],
				responses: [
					{
						status: "200 OK",
						description: "Article saved.",
						body: formatJson({
							status: "saved",
							article: SAMPLE_CREATED_ARTICLE,
						}),
					},
					{
						status: "200 OK",
						description: "The URL already exists; its article ID is returned.",
						body: formatJson({
							status: "exists",
							message: "This URL is already in your library.",
							article: {
								id: SAMPLE_ARTICLE.id,
								url: SAMPLE_ARTICLE.url,
							},
						}),
					},
					malformedJsonResponse(),
					invalidResponse(
						"INVALID_URL",
						"Invalid article URL.",
						"The URL is invalid or is not HTTP(S).",
					),
				],
				exampleRequest: createPersonalApiCurl("/api/v1/articles", {
					method: "POST",
					body: { url: SAMPLE_ARTICLE.url },
				}),
				exampleResponse: formatJson({
					status: "saved",
					article: SAMPLE_CREATED_ARTICLE,
				}),
				notes: [
					"Metadata extraction runs during save, so the title can be null when the remote page has no readable title.",
					"A duplicate is a successful, retry-safe result that exposes the existing article ID for later tag assignment.",
					"Article creation is limited to 30 saves per minute per user.",
				],
			}),
			withPersonalAccessToken({
				method: "GET",
				path: "/api/v1/articles/:id",
				summary: "Get one article and its extracted reader content.",
				pathParameters: ARTICLE_PATH_PARAMETERS,
				responses: [
					{
						status: "200 OK",
						description: "Article metadata, tags, and reader content.",
						body: formatJson({
							article: SAMPLE_ARTICLE,
							content: SAMPLE_READER_CONTENT,
						}),
					},
					invalidResponse(
						"INVALID_ARTICLE_ID",
						"Invalid article id.",
						"The article ID is malformed.",
					),
					articleNotFoundResponse(),
				],
				exampleRequest: createPersonalApiCurl(
					`/api/v1/articles/${SAMPLE_ARTICLE.id}`,
				),
				exampleResponse: formatJson({
					article: SAMPLE_ARTICLE,
					content: SAMPLE_READER_CONTENT,
				}),
				notes: [
					"The first request may fetch, extract, and cache the source article.",
					'When readable text cannot be extracted, content is { "status": "unavailable", "reason": "..." } and the request still succeeds.',
				],
			}),
			withPersonalAccessToken({
				method: "PATCH",
				path: "/api/v1/articles/:id",
				summary: "Change an article's read or favorite state.",
				pathParameters: ARTICLE_PATH_PARAMETERS,
				contentType: "application/json",
				bodyFields: [
					{
						name: "isRead",
						type: "boolean",
						description: "Mark the article read or unread.",
					},
					{
						name: "isFavorite",
						type: "boolean",
						description: "Mark the article favorite or not favorite.",
					},
				],
				responses: [
					successResponse("Article state updated."),
					malformedJsonResponse(),
					invalidResponse(
						"INVALID_ARTICLE_UPDATE",
						"Invalid article update.",
						"The parsed body has invalid values or no mutable field.",
					),
					articleNotFoundResponse(),
				],
				exampleRequest: createPersonalApiCurl(
					`/api/v1/articles/${SAMPLE_ARTICLE.id}`,
					{ method: "PATCH", body: { isRead: true } },
				),
				exampleResponse: formatJson({ success: true }),
				notes: ["At least one of isRead or isFavorite must be present."],
			}),
			withPersonalAccessToken({
				method: "DELETE",
				path: "/api/v1/articles/:id",
				summary: "Delete one article from your library.",
				pathParameters: ARTICLE_PATH_PARAMETERS,
				responses: [
					successResponse("Article deleted."),
					invalidResponse(
						"INVALID_ARTICLE_ID",
						"Invalid article id.",
						"The article ID is malformed.",
					),
					articleNotFoundResponse(),
				],
				exampleRequest: createPersonalApiCurl(
					`/api/v1/articles/${SAMPLE_ARTICLE.id}`,
					{ method: "DELETE" },
				),
				exampleResponse: formatJson({ success: true }),
			}),
			withPersonalAccessToken({
				method: "PUT",
				path: "/api/v1/articles/:id/tags/:tagId",
				summary: "Assign an existing tag to an article.",
				pathParameters: ARTICLE_TAG_PATH_PARAMETERS,
				responses: [
					successResponse("Tag assigned, or it was already assigned."),
					invalidResponse(
						"INVALID_TAG_ASSIGNMENT",
						"Invalid tag assignment.",
						"An article or tag ID is malformed.",
					),
					tagNotFoundResponse(),
					articleNotFoundResponse(),
				],
				exampleRequest: createPersonalApiCurl(
					`/api/v1/articles/${SAMPLE_ARTICLE.id}/tags/${SAMPLE_TAG.id}`,
					{ method: "PUT" },
				),
				exampleResponse: formatJson({ success: true }),
				notes: [
					"Assignment is idempotent, so retrying the same request is safe.",
				],
			}),
			withPersonalAccessToken({
				method: "DELETE",
				path: "/api/v1/articles/:id/tags/:tagId",
				summary: "Remove a tag from an article.",
				pathParameters: ARTICLE_TAG_PATH_PARAMETERS,
				responses: [
					successResponse("Tag removed, or it was already absent."),
					invalidResponse(
						"INVALID_TAG_ASSIGNMENT",
						"Invalid tag assignment.",
						"An article or tag ID is malformed.",
					),
					tagNotFoundResponse(),
					articleNotFoundResponse(),
				],
				exampleRequest: createPersonalApiCurl(
					`/api/v1/articles/${SAMPLE_ARTICLE.id}/tags/${SAMPLE_TAG.id}`,
					{ method: "DELETE" },
				),
				exampleResponse: formatJson({ success: true }),
				notes: ["Removal is idempotent, so retrying the same request is safe."],
			}),
			withPersonalAccessToken({
				method: "GET",
				path: "/api/v1/tags",
				summary: "List tags and their article counts.",
				responses: [
					{
						status: "200 OK",
						description: "The current user's tags, ordered by name.",
						body: formatJson([SAMPLE_TAG_SUMMARY]),
					},
				],
				exampleRequest: createPersonalApiCurl("/api/v1/tags"),
				exampleResponse: formatJson([SAMPLE_TAG_SUMMARY]),
				notes: [
					"articleCount includes every article currently assigned to the tag.",
				],
			}),
			withPersonalAccessToken({
				method: "GET",
				path: "/api/v1/dashboard",
				summary: "Get library and recent-reading counts.",
				responses: [
					{
						status: "200 OK",
						description: "Normalized dashboard counters.",
						body: formatJson(SAMPLE_DASHBOARD),
					},
				],
				exampleRequest: createPersonalApiCurl("/api/v1/dashboard"),
				exampleResponse: formatJson(SAMPLE_DASHBOARD),
				notes: [
					"readThisWeek and savedThisWeek cover the rolling previous seven days.",
				],
			}),
		],
	},
	{
		title: "Browser extension API",
		description:
			"These routes support the official Chrome extension and use the signed-in website session cookie.",
		endpoints: [
			{
				method: "POST",
				path: "/api/extension/articles",
				summary: "Save an article from the Chrome extension.",
				auth: "Hold Shelf session cookie",
				contentType: "application/json",
				bodyFields: [
					{
						name: "url",
						type: "http/https URL, max 2048 chars",
						required: true,
						description: "The tab or link URL selected in Chrome.",
					},
				],
				responses: [
					{
						status: "200 OK",
						description: "Article saved.",
						body: '{ "status": "saved", "article": { "id": "article_123", "url": "https://example.com/article", "title": "Example article" } }',
					},
					{
						status: "401 Unauthorized",
						description: "User needs to sign in on the website.",
						body: [
							"{",
							'  "code": "UNAUTHORIZED",',
							'  "message": "Sign in to Hold Shelf to save from Chrome.",',
							'  "loginUrl": "https://hold-shelf.com/extension/save?url=..."',
							"}",
						].join("\n"),
					},
					{
						status: "409 Conflict",
						description: "URL is already saved.",
						body: '{ "code": "ARTICLE_EXISTS", "message": "This URL is already in your library." }',
					},
				],
				exampleRequest: [
					"fetch('https://hold-shelf.com/api/extension/articles', {",
					"  method: 'POST',",
					"  credentials: 'include',",
					"  headers: { 'Content-Type': 'application/json' },",
					"  body: JSON.stringify({ url: 'https://example.com/article' })",
					"})",
				].join("\n"),
				exampleResponse:
					'{ "status": "saved", "article": { "id": "article_123", "url": "https://example.com/article", "title": "Example article" } }',
				notes: [
					"CORS credentials are allowed only for chrome-extension:// origins.",
					"Use the personal REST API for scripts and third-party clients.",
				],
			},
			{
				method: "OPTIONS",
				path: "/api/extension/articles",
				summary: "Chrome extension CORS preflight.",
				auth: "None",
				responses: [
					{
						status: "204 No Content",
						description: "Preflight accepted for Chrome extension origins.",
						body: "",
					},
				],
				exampleRequest: [
					"curl 'https://hold-shelf.com/api/extension/articles' \\",
					"  -X OPTIONS \\",
					"  -H 'Origin: chrome-extension://extension-id' \\",
					"  -H 'Access-Control-Request-Method: POST'",
				].join("\n"),
				exampleResponse: "HTTP/1.1 204 No Content",
			},
		],
	},
];

function withPersonalAccessToken(
	endpoint: Omit<ApiEndpoint, "auth">,
): ApiEndpoint {
	return {
		...endpoint,
		auth: PERSONAL_TOKEN_AUTH,
		responses: [
			...endpoint.responses,
			UNAUTHORIZED_RESPONSE,
			RATE_LIMITED_RESPONSE,
		],
	};
}

function successResponse(description: string): ApiResponse {
	return {
		status: "200 OK",
		description,
		body: formatJson({ success: true }),
	};
}

function invalidResponse(
	code: string,
	message: string,
	description: string,
): ApiResponse {
	return {
		status: "400 Bad Request",
		description,
		body: formatJson({ code, message }),
	};
}

function malformedJsonResponse(): ApiResponse {
	return invalidResponse(
		"INVALID_JSON",
		"Request body must be valid JSON.",
		"The request body is not valid JSON.",
	);
}

function articleNotFoundResponse(): ApiResponse {
	return {
		status: "404 Not Found",
		description: "The article does not exist or belongs to another user.",
		body: formatJson({
			code: "ARTICLE_NOT_FOUND",
			message: "Article not found.",
		}),
	};
}

function tagNotFoundResponse(): ApiResponse {
	return {
		status: "404 Not Found",
		description: "The tag does not exist or belongs to another user.",
		body: formatJson({ code: "TAG_NOT_FOUND", message: "Tag not found." }),
	};
}

function formatJson(value: unknown) {
	return JSON.stringify(value, null, 2);
}

function createPersonalApiCurl(
	path: string,
	options: { method?: string; body?: unknown } = {},
) {
	const flags = [
		...(options.method ? [`-X ${options.method}`] : []),
		"-H 'Authorization: Bearer hs_your_token'",
		...(options.body === undefined
			? []
			: [
					"-H 'Content-Type: application/json'",
					`--data '${JSON.stringify(options.body)}'`,
				]),
	];

	return [
		`curl 'https://hold-shelf.com${path}' \\`,
		...flags.map(
			(flag, index) => `  ${flag}${index < flags.length - 1 ? " \\" : ""}`,
		),
	].join("\n");
}

export const API_DOCS_AGENT_MARKDOWN = createApiDocsAgentMarkdown();

function createApiDocsAgentMarkdown() {
	const lines = [
		"# Hold Shelf API documentation",
		"",
		"Agent-friendly Markdown export generated from the same endpoint metadata as the web API docs.",
		"",
		"## Overview",
		"",
		"- Base URL: `https://hold-shelf.com`",
		"- Authentication: personal access token in `Authorization: Bearer hs_your_token`.",
		"- Token management: create, regenerate, or revoke the account's one active token in Settings -> API access.",
		"- Regenerating the token immediately invalidates the previous token for every client using it.",
		"- Preferred client surface: Personal REST API. The browser extension API is documented only for extension integrations.",
		"",
	];

	for (const section of API_DOCS_SECTIONS) {
		lines.push(`## ${section.title}`, "", section.description, "");

		for (const endpoint of section.endpoints) {
			lines.push(
				`### ${endpoint.method} ${endpoint.path}`,
				"",
				endpoint.summary,
				"",
				`- Authentication: \`${endpoint.auth}\``,
			);

			if (endpoint.contentType) {
				lines.push(`- Content-Type: \`${endpoint.contentType}\``);
			}

			lines.push("");

			if (endpoint.pathParameters) {
				lines.push(
					"#### Path parameters",
					"",
					createMarkdownFieldsTable(endpoint.pathParameters),
					"",
				);
			}

			if (endpoint.parameters) {
				lines.push(
					"#### Query parameters",
					"",
					createMarkdownFieldsTable(endpoint.parameters),
					"",
				);
			}

			if (endpoint.bodyFields) {
				lines.push(
					"#### JSON body",
					"",
					createMarkdownFieldsTable(endpoint.bodyFields),
					"",
				);
			}

			lines.push("#### Responses", "");

			for (const response of endpoint.responses) {
				lines.push(`##### ${response.status}`, "", response.description, "");

				if (response.body) {
					lines.push(createMarkdownCodeBlock(response.body), "");
				}
			}

			lines.push(
				"#### Example request",
				"",
				createMarkdownCodeBlock(endpoint.exampleRequest),
				"",
				"#### Example response",
				"",
				createMarkdownCodeBlock(endpoint.exampleResponse),
				"",
			);

			if (endpoint.notes) {
				lines.push("#### Notes", "");
				lines.push(...endpoint.notes.map((note) => `- ${note}`), "");
			}
		}
	}

	return `${lines
		.join("\n")
		.replace(/\n{3,}/g, "\n\n")
		.trimEnd()}\n`;
}

function createMarkdownFieldsTable(
	fields: NonNullable<ApiDocSection["endpoints"][number]["parameters"]>,
) {
	return [
		"| Name | Required | Type | Description |",
		"| --- | --- | --- | --- |",
		...fields.map(
			(field) =>
				`| \`${escapeMarkdownTableCell(field.name)}\` | ${field.required ? "yes" : "no"} | ${escapeMarkdownTableCell(field.type)} | ${escapeMarkdownTableCell(field.description)} |`,
		),
	].join("\n");
}

function createMarkdownCodeBlock(code: string) {
	const fence = getMarkdownCodeFence(code);
	return `${fence}\n${code}\n${fence}`;
}

function getMarkdownCodeFence(code: string) {
	const fenceRuns = code.match(/`{3,}/g) ?? [];
	const longestFenceRun = Math.max(2, ...fenceRuns.map((run) => run.length));
	return "`".repeat(longestFenceRun + 1);
}

function escapeMarkdownTableCell(value: string) {
	return value.replaceAll("|", "\\|").replace(/\s+/g, " ").trim();
}
