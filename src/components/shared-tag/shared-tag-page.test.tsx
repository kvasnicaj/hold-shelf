import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SharedTagPage } from "#/components/shared-tag/shared-tag-page";
import { renderWithProviders } from "#/test/render";

vi.mock("@tanstack/react-router", () => ({
	getRouteApi: () => ({
		useLoaderData: () => ({
			ownerFirstName: "Jaroslav",
			tagName: "Research",
			articles: {
				items: [
					{
						url: "https://example.com/article",
						title: "Public article",
						description: "A useful public description",
						hostname: "example.com",
						faviconUrl: "https://example.com/favicon.ico",
						createdAt: new Date("2026-07-30T00:00:00.000Z"),
					},
				],
				total: 1,
			},
		}),
		useSearch: () => ({}),
	}),
	Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
		<a href={to}>{children}</a>
	),
	useNavigate: () => vi.fn(),
}));

describe("SharedTagPage", () => {
	it("shows the owner's first name and only read-only public article content", () => {
		renderWithProviders(<SharedTagPage />);

		expect(
			screen.getByRole("heading", {
				name: "Jaroslav is sharing articles with you",
			}),
		).toBeInTheDocument();
		expect(screen.getByText("Research")).toBeInTheDocument();
		const articleLink = screen.getByRole("link", { name: /Public article/ });
		expect(articleLink).toHaveAttribute("href", "https://example.com/article");
		expect(articleLink).toHaveAttribute("rel", "noopener noreferrer");
		expect(articleLink).toHaveAttribute("referrerpolicy", "no-referrer");
		expect(screen.queryByText(/favorite/i)).not.toBeInTheDocument();
		expect(screen.queryByText(/mark read/i)).not.toBeInTheDocument();
	});
});
