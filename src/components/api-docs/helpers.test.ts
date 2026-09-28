import { describe, expect, it } from "vitest";
import {
	API_DOCS_AGENT_MARKDOWN,
	API_DOCS_PAGE_DESCRIPTION,
	API_DOCS_PAGE_TITLE,
	API_DOCS_SECTIONS,
} from "#/components/api-docs/helpers";

describe("API docs helpers", () => {
	it("defines the complete versioned personal API surface once", () => {
		const personalApi = API_DOCS_SECTIONS.find(
			(section) => section.title === "Personal REST API",
		);

		expect(
			personalApi?.endpoints.map(
				(endpoint) => `${endpoint.method} ${endpoint.path}`,
			),
		).toEqual([
			"GET /api/v1/me",
			"GET /api/v1/articles",
			"POST /api/v1/articles",
			"GET /api/v1/articles/:id",
			"PATCH /api/v1/articles/:id",
			"DELETE /api/v1/articles/:id",
			"PUT /api/v1/articles/:id/tags/:tagId",
			"DELETE /api/v1/articles/:id/tags/:tagId",
			"GET /api/v1/tags",
			"GET /api/v1/dashboard",
		]);

		for (const endpoint of personalApi?.endpoints ?? []) {
			expect(endpoint.auth).toBe(
				"Authorization: Bearer <personal-access-token>",
			);
			expect(endpoint.responses.map((response) => response.status)).toEqual(
				expect.arrayContaining(["401 Unauthorized", "429 Too Many Requests"]),
			);
		}
	});

	it("generates agent-friendly Markdown from all endpoint metadata", () => {
		expect(API_DOCS_AGENT_MARKDOWN).toContain("# Hold Shelf API documentation");
		expect(API_DOCS_AGENT_MARKDOWN).toContain("## Personal REST API");

		for (const section of API_DOCS_SECTIONS) {
			for (const endpoint of section.endpoints) {
				expect(API_DOCS_AGENT_MARKDOWN).toContain(
					`### ${endpoint.method} ${endpoint.path}`,
				);
			}
		}

		expect(API_DOCS_AGENT_MARKDOWN).toContain("#### Path parameters");
		expect(API_DOCS_AGENT_MARKDOWN).toContain(
			"| `tagId` | yes | string, 1-128 chars |",
		);
		expect(API_DOCS_AGENT_MARKDOWN).toContain('"articleCount": 3');
		expect(API_DOCS_AGENT_MARKDOWN).not.toContain("/api/auth");
	});

	it("describes the expanded REST API in page metadata", () => {
		expect(API_DOCS_PAGE_TITLE).toBe("REST API documentation | Hold Shelf");
		expect(API_DOCS_PAGE_DESCRIPTION).toContain(
			"browse, search, read, save, and organize articles",
		);
	});
});
