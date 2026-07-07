import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ArticleReaderContent } from "#/components/article-reader/article-reader-content";

describe("ArticleReaderContent", () => {
	it("renders cached markdown as semantic reader content", () => {
		render(
			<ArticleReaderContent
				markdown={[
					"## Section heading",
					"A paragraph with **bold text**, `inlineCode()`, and [a link](https://example.com/path).",
					"- First list item",
					"- Second list item",
					"> A quoted line",
					"```",
					"const answer = 42;",
					"```",
				].join("\n\n")}
			/>,
		);

		expect(
			screen.getByRole("heading", { name: "Section heading" }),
		).toBeInTheDocument();
		expect(screen.getByText("bold text").tagName).toBe("STRONG");
		expect(screen.getByText("inlineCode()").tagName).toBe("CODE");
		expect(screen.getByText("First list item")).toBeInTheDocument();
		expect(screen.getByText("A quoted line")).toBeInTheDocument();
		expect(screen.getByText("const answer = 42;")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "a link" })).toHaveAttribute(
			"rel",
			"noopener noreferrer",
		);
	});

	it("sanitizes raw html from cached markdown", () => {
		const { container } = render(
			<ArticleReaderContent
				markdown={"<script>alert('x')</script>\n\nSafe text."}
			/>,
		);

		expect(container.querySelector("script")).toBeNull();
		expect(screen.getByText("Safe text.")).toBeInTheDocument();
	});
});
