import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ArticleExternalLink } from "#/components/articles/article-external-link";
import { renderWithProviders } from "#/test/render";

describe("ArticleExternalLink", () => {
	it("triggers the shared open handler on a standard click", () => {
		const onOpenArticle = vi.fn();

		renderWithProviders(
			<ArticleExternalLink
				articleId="a1"
				href="https://example.com/article"
				isRead={false}
				onOpenArticle={onOpenArticle}
			>
				Article
			</ArticleExternalLink>,
		);

		fireEvent.click(screen.getByRole("link", { name: "Article" }), {
			button: 0,
		});

		expect(onOpenArticle).toHaveBeenCalledWith("a1", false);
	});

	it("also triggers the handler for modified clicks and middle clicks", () => {
		const onOpenArticle = vi.fn();

		renderWithProviders(
			<ArticleExternalLink
				articleId="a1"
				href="https://example.com/article"
				isRead={false}
				onOpenArticle={onOpenArticle}
			>
				Article
			</ArticleExternalLink>,
		);

		const link = screen.getByRole("link", { name: "Article" });

		fireEvent.click(link, { button: 0, metaKey: true });
		fireEvent(
			link,
			new MouseEvent("auxclick", {
				bubbles: true,
				button: 1,
			}),
		);

		expect(onOpenArticle).toHaveBeenNthCalledWith(1, "a1", false);
		expect(onOpenArticle).toHaveBeenNthCalledWith(2, "a1", false);
	});
});
