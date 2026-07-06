import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ArticleReaderContent } from "#/components/article-reader/article-reader-content";
import type { ArticleContentBlock } from "#/server/article-content";

describe("ArticleReaderContent", () => {
	it("renders structured article formatting", () => {
		const blocks: ArticleContentBlock[] = [
			{
				type: "heading",
				level: 2,
				children: [{ text: "Section heading" }],
			},
			{
				type: "paragraph",
				children: [
					{ text: "A paragraph with " },
					{ text: "bold text", bold: true },
					{ text: " and " },
					{ text: "inlineCode()", code: true },
					{ text: "." },
				],
			},
			{
				type: "list",
				items: [[{ text: "First list item" }], [{ text: "Second list item" }]],
			},
			{
				type: "blockquote",
				children: [{ text: "A quoted line" }],
			},
			{
				type: "code",
				text: "const answer = 42;",
			},
		];

		render(<ArticleReaderContent blocks={blocks} paragraphs={[]} />);

		expect(
			screen.getByRole("heading", { name: "Section heading" }),
		).toBeInTheDocument();
		expect(screen.getByText("bold text").tagName).toBe("STRONG");
		expect(screen.getByText("inlineCode()").tagName).toBe("CODE");
		expect(screen.getByText("First list item")).toBeInTheDocument();
		expect(screen.getByText("A quoted line")).toBeInTheDocument();
		expect(screen.getByText("const answer = 42;")).toBeInTheDocument();
	});
});
