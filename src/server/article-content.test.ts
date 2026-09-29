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
		expect(result.markdown).toContain("## Useful heading");
		expect(result.markdown).toContain("**bold text**");
		expect(result.markdown).toContain("`inlineCode()`");
		expect(result.markdown).toContain("> A short quoted idea");
		expect(result.markdown).toContain("const answer = 42;");
		expect(result.wordCount).toBeGreaterThan(10);
	});

	it("does not cache X application markup as an article body", async () => {
		vi.mocked(fetchHtmlWithGuards).mockResolvedValue({
			response: {
				ok: true,
				headers: new Headers({ "content-type": "text/html" }),
			} as Response,
			finalUrl: new URL("https://x.com/alvinsng/status/2077114275412512868"),
		});
		vi.mocked(readTextWithinLimit).mockResolvedValue(`
			<script>
				entity={__typename:"ArticleEntity",rest_id:"2077106065959989248",title:"Why we stopped using SDKs",preview_text:"We call REST APIs directly instead of caching the surrounding X application markup.",cover_media_results:null}
			</script>
			<style>:host{display:inline-block}.number{padding:1px}</style>
		`);

		const result = await extractArticleContent(
			"https://x.com/alvinsng/status/2077114275412512868?s=20",
		);

		expect(result).toEqual({
			status: "unavailable",
			reason:
				"X exposes the article preview publicly, but not the complete article body.",
		});
	});
});
