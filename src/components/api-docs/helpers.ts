import type { ApiDocSection } from "#/components/api-docs/types";

export const API_DOCS_PAGE_TITLE = "API documentation | Hold Shelf";

export const API_DOCS_PAGE_DESCRIPTION =
	"Learn how to use the Hold Shelf API to list and save articles.";

export const API_DOCS_PAGE_CANONICAL_URL = "https://hold-shelf.com/api-docs";

export const API_DOCS_AGENT_EXPORT_PATH = "/api-docs/agents";

export const API_DOCS_AGENT_EXPORT_FILENAME = "hold-shelf-api-docs.md";

export const API_DOCS_SECTIONS: ApiDocSection[] = [
	{
		title: "Personal REST API",
		description:
			"Use these endpoints with a personal API token from Settings -> API access.",
		endpoints: [
			{
				method: "GET",
				path: "/api/v1/articles",
				summary: "List articles in your library.",
				auth: "Authorization: Bearer <personal-token>",
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
						description: "Articles and total count.",
						body: [
							"{",
							'  "items": [',
							"    {",
							'      "id": "article_123",',
							'      "url": "https://example.com/article",',
							'      "title": "Example article",',
							'      "description": "Short summary",',
							'      "hostname": "example.com",',
							'      "faviconUrl": "https://example.com/favicon.ico",',
							'      "isRead": false,',
							'      "isFavorite": false,',
							'      "createdAt": "2026-07-07T10:00:00.000Z",',
							'      "updatedAt": "2026-07-07T10:00:00.000Z",',
							'      "readAt": null,',
							'      "tags": [{ "id": "tag_123", "name": "Research", "color": null }]',
							"    }",
							"  ],",
							'  "total": 1',
							"}",
						].join("\n"),
					},
					{
						status: "400 Bad Request",
						description: "Invalid query parameters.",
						body: '{ "code": "INVALID_QUERY", "message": "Invalid article query." }',
					},
					{
						status: "401 Unauthorized",
						description: "Token is missing or invalid.",
						body: '{ "code": "UNAUTHORIZED", "message": "Invalid or missing API token." }',
					},
					{
						status: "429 Too Many Requests",
						description: "Rate limit exceeded. Includes a Retry-After header.",
						body: '{ "code": "RATE_LIMITED", "message": "Rate limit exceeded. Please try again later." }',
					},
				],
				exampleRequest: [
					"curl 'https://hold-shelf.com/api/v1/articles?limit=10&isRead=false&sort=newest' \\",
					"  -H 'Authorization: Bearer hs_your_token'",
				].join("\n"),
				exampleResponse: ["{", '  "items": [],', '  "total": 0', "}"].join(
					"\n",
				),
				notes: [
					"Only articles owned by the token owner are returned.",
					"Authenticated article API requests are limited to 120 requests per minute per user.",
				],
			},
			{
				method: "POST",
				path: "/api/v1/articles",
				summary: "Save a new article URL.",
				auth: "Authorization: Bearer <personal-token>",
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
						body: [
							"{",
							'  "status": "saved",',
							'  "article": {',
							'    "id": "article_123",',
							'    "url": "https://example.com/article",',
							'    "title": "Example article"',
							"  }",
							"}",
						].join("\n"),
					},
					{
						status: "200 OK",
						description: "URL already exists in your library.",
						body: '{ "status": "exists", "message": "This URL is already in your library." }',
					},
					{
						status: "400 Bad Request",
						description: "Invalid JSON or invalid URL.",
						body: '{ "code": "INVALID_URL", "message": "Invalid article URL." }',
					},
					{
						status: "401 Unauthorized",
						description: "Token is missing or invalid.",
						body: '{ "code": "UNAUTHORIZED", "message": "Invalid or missing API token." }',
					},
					{
						status: "429 Too Many Requests",
						description: "Rate limit exceeded. Includes a Retry-After header.",
						body: '{ "code": "RATE_LIMITED", "message": "Rate limit exceeded. Please try again later." }',
					},
				],
				exampleRequest: [
					"curl 'https://hold-shelf.com/api/v1/articles' \\",
					"  -X POST \\",
					"  -H 'Authorization: Bearer hs_your_token' \\",
					"  -H 'Content-Type: application/json' \\",
					'  --data \'{"url":"https://example.com/article"}\'',
				].join("\n"),
				exampleResponse: [
					"{",
					'  "status": "saved",',
					'  "article": {',
					'    "id": "article_123",',
					'    "url": "https://example.com/article",',
					'    "title": "Example article"',
					"  }",
					"}",
				].join("\n"),
				notes: [
					"Metadata extraction runs during save, so the title can be null when the remote page has no readable title.",
					"Article creation is limited to 30 saves per minute per user.",
				],
			},
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
		"- Token header: `Authorization: Bearer hs_your_token`",
		"- Token management: create, regenerate, or revoke one token in Settings -> API access.",
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
