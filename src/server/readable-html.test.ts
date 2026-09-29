import { expect, it } from "vitest";
import { renderMarkdownToHtml } from "#/components/article-reader/markdown-rendering";
import { parseReadableArticle } from "#/server/readable-html";

it("preserves code, inline spaces, relative links, images, tables, numbering and short paragraphs", () => {
	const result = parseReadableArticle(
		`<html><nav>Discard navigation</nav><article><p><strong>Hello</strong> <em>world</em><br>Normal again.</p><p>Yes.</p><pre><code>if ready:\n    run()\n    finish()</code></pre><p>Visit <a href="../guide#part">the guide</a>.</p><img src="./chart.png" alt="A chart"><ol start="3"><li>Third</li><li>Fourth</li></ol><table><tr><th>Feature</th><th>Status</th></tr><tr><td>Code</td><td>Saved</td></tr></table><script>alert(1)</script></article></html>`,
		"https://example.com/posts/article",
	);
	expect(result.markdown).toContain("**Hello** *world*");
	expect(result.markdown).toContain("if ready:\n    run()\n    finish()");
	expect(result.markdown).toContain("https://example.com/guide#part");
	expect(result.markdown).toContain("https://example.com/posts/chart.png");
	expect(result.markdown).toContain("3. Third");
	expect(result.markdown).toContain("Yes.");
	expect(result.markdown).toContain("| Feature");
	expect(result.markdown).not.toContain("alert(1)");
	expect(result.markdown).not.toContain("Discard navigation");
	expect(result.paragraphs.join(" ")).toContain("Hello world");
});
it("keeps the end of long articles and sanitizes heading IDs after slug generation", () => {
	const result = parseReadableArticle(
		`<article>${Array.from({ length: 150 }, (_, i) => `<p>Paragraph ${i} remains in this saved article.</p>`).join("")}</article>`,
		"https://example.com",
	);
	expect(result.markdown).toContain("Paragraph 149");
	const html = renderMarkdownToHtml(
		"## location\n\n[unsafe](javascript:alert)\n\n## name",
	);
	expect(html).toContain('id="user-content-location"');
	expect(html).not.toContain('href="javascript:');
});
