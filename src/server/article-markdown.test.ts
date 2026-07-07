import { describe, expect, it } from "vitest";
import type { ArticleContentBlock } from "#/server/article-content";
import {
	articleBlocksToMarkdown,
	articleBlocksToPlainText,
	extractedArticleToMarkdown,
} from "#/server/article-markdown";

describe("article markdown conversion", () => {
	it("converts structured article blocks to markdown", () => {
		const blocks: ArticleContentBlock[] = [
			{
				type: "heading",
				level: 2,
				children: [{ text: "Useful heading" }],
			},
			{
				type: "paragraph",
				children: [
					{ text: "A paragraph with " },
					{ text: "bold", bold: true },
					{ text: ", " },
					{ text: "italic", italic: true },
					{ text: ", " },
					{ text: "inlineCode()", code: true },
					{ text: ", and " },
					{ text: "a link", href: "https://example.com/path" },
					{ text: "." },
				],
			},
			{
				type: "list",
				items: [[{ text: "First item" }], [{ text: "Second item" }]],
			},
			{
				type: "blockquote",
				children: [{ text: "Quoted idea" }],
			},
			{
				type: "code",
				text: "const answer = 42;",
			},
		];

		expect(articleBlocksToMarkdown(blocks)).toBe(
			[
				"## Useful heading",
				"A paragraph with **bold**, _italic_, `inlineCode()`, and [a link](https://example.com/path)\\.",
				"- First item\n- Second item",
				"> Quoted idea",
				"```\nconst answer = 42;\n```",
			].join("\n\n"),
		);
		expect(articleBlocksToPlainText(blocks)).toContain(
			"A paragraph with bold, italic, inlineCode(), and a link.",
		);
	});

	it("uses paragraph fallback when no structured blocks were extracted", () => {
		const result = extractedArticleToMarkdown({
			status: "ready",
			blocks: [],
			paragraphs: ["First paragraph.", "Second paragraph."],
			wordCount: 4,
		});

		expect(result).toEqual({
			markdown: "First paragraph\\.\n\nSecond paragraph\\.",
			plainText: "First paragraph.\n\nSecond paragraph.",
			wordCount: 4,
		});
	});

	it("does not carry raw html tags into markdown", () => {
		const result = articleBlocksToMarkdown([
			{
				type: "paragraph",
				children: [{ text: "Text from a script tag was removed." }],
			},
		]);

		expect(result).not.toContain("<script");
		expect(result).toBe("Text from a script tag was removed\\.");
	});
});
