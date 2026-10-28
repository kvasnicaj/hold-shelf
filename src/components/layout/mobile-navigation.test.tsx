import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MobileNavigation } from "#/components/layout/mobile-navigation";
import { renderWithProviders } from "#/test/render";

const { getArticlesMock, routerState } = vi.hoisted(() => ({
	getArticlesMock: vi.fn(),
	routerState: {
		location: {
			pathname: "/app/favorites",
		},
	},
}));

vi.mock("#/components/articles/use-save-article", () => ({
	useSaveArticle: () => ({ handleAdd: vi.fn() }),
}));

vi.mock("#/server/articles", () => ({
	getArticles: getArticlesMock,
}));

vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);

	return {
		...actual,
		Link: ({
			children,
			to,
			className,
			...props
		}: React.ComponentProps<"a"> & {
			to: string;
			className?: string;
		}) => (
			<a href={to} className={className} {...props}>
				{children}
			</a>
		),
		useRouterState: () => routerState,
	};
});

describe("MobileNavigation", () => {
	it("renders four destinations around a one-tap save action", async () => {
		const user = userEvent.setup();
		getArticlesMock.mockResolvedValue({ total: 3 });
		renderWithProviders(<MobileNavigation />);

		expect(screen.getByRole("navigation", { name: /primary/i })).toBeVisible();
		expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute(
			"href",
			"/app/home",
		);
		const favoritesLink = screen.getByRole("link", { name: /favorites/i });
		expect(favoritesLink).toHaveAttribute("href", "/app/favorites");
		expect(favoritesLink).toHaveAttribute("aria-current", "page");
		expect(
			await screen.findByRole("link", { name: /unread\s*3/i }),
		).toHaveAttribute("href", "/app/articles");
		expect(screen.getAllByRole("link")).toHaveLength(4);

		await user.click(screen.getByRole("button", { name: "Save a link" }));
		expect(screen.getByRole("heading", { name: "Save article" })).toBeVisible();
	});
});
