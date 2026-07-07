import { describe, expect, it } from "vitest";
import { API_DOCS_AGENT_MARKDOWN } from "#/components/api-docs/helpers";

describe("API docs helpers", () => {
	it("generates agent-friendly Markdown from the documented endpoints", () => {
		expect(API_DOCS_AGENT_MARKDOWN).toContain("# Hold Shelf API documentation");
		expect(API_DOCS_AGENT_MARKDOWN).toContain("## Personal REST API");
		expect(API_DOCS_AGENT_MARKDOWN).toContain("### GET /api/v1/articles");
		expect(API_DOCS_AGENT_MARKDOWN).toContain("### POST /api/v1/articles");
		expect(API_DOCS_AGENT_MARKDOWN).toContain(
			"### POST /api/extension/articles",
		);
		expect(API_DOCS_AGENT_MARKDOWN).not.toContain("/api/auth");
	});
});
