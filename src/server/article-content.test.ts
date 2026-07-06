import { beforeEach, describe, expect, it, vi } from "vitest";
import { extractArticleContent } from "#/server/article-content";
import {
	fetchHtmlWithGuards,
	isHtmlContentType,
	readTextWithinLimit,
} from "#/server/external-html";

vi.mock("#/server/config", () => ({
	metadataConfig: {
		maxBytes: 500_000,
		maxRedirects: 3,
		timeoutMs: 5000,
	},
}));

vi.mock("#/server/external-html", () => ({
	fetchHtmlWithGuards: vi.fn(),
	isHtmlContentType: vi.fn(),
	readTextWithinLimit: vi.fn(),
}));

describe("extractArticleContent", () => {
	beforeEach(() => {
		vi.mocked(fetchHtmlWithGuards).mockReset();
		vi.mocked(isHtmlContentType).mockReset().mockReturnValue(true);
		vi.mocked(readTextWithinLimit).mockReset();
	});

	it("preserves basic article formatting in structured content blocks", async () => {
		vi.mocked(fetchHtmlWithGuards).mockResolvedValue({
			response: {
				ok: true,
				headers: new Headers({ "content-type": "text/html" }),
			} as Response,
			finalUrl: new URL("https://example.com/article"),
		});
		vi.mocked(readTextWithinLimit).mockResolvedValue(`
			<article>
				<h2>Useful heading</h2>
				<p>This paragraph keeps <strong>bold text</strong> and <code>inlineCode()</code> from the original source.</p>
				<blockquote>A short quoted idea with enough text to be visible.</blockquote>
				<ul>
					<li>First list item with practical detail</li>
					<li>Second list item with more practical detail</li>
				</ul>
				<pre><code>const answer = 42;</code></pre>
			</article>
		`);

		const result = await extractArticleContent("https://example.com/article");

		expect(result.status).toBe("ready");
		if (result.status !== "ready") return;
		expect(result.blocks).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ type: "heading", level: 2 }),
				expect.objectContaining({ type: "paragraph" }),
				expect.objectContaining({ type: "blockquote" }),
				expect.objectContaining({ type: "list" }),
				expect.objectContaining({ type: "code", text: "const answer = 42;" }),
			]),
		);
		const paragraph = result.blocks.find((block) => block.type === "paragraph");
		expect(paragraph).toEqual(
			expect.objectContaining({
				children: expect.arrayContaining([
					expect.objectContaining({ text: "bold text", bold: true }),
					expect.objectContaining({ text: "inlineCode()", code: true }),
				]),
			}),
		);
		expect(result.wordCount).toBeGreaterThan(10);
	});
});
