import { describe, expect, it } from "vitest";
import { handleApiDocsAgentGet } from "#/routes/api-docs/-agents-handlers";

describe("api docs agent export handler", () => {
	it("returns the agent-friendly Markdown export", async () => {
		const response = handleApiDocsAgentGet();

		expect(response.status).toBe(200);
		expect(response.headers.get("content-type")).toBe(
			"text/markdown; charset=utf-8",
		);
		expect(response.headers.get("content-disposition")).toBe(
			'attachment; filename="hold-shelf-api-docs.md"',
		);
		await expect(response.text()).resolves.toContain("## Personal REST API");
	});
});
