import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppSidebar } from "#/components/layout/app-sidebar";
import { renderWithProviders } from "#/test/render";

const { routerState, getArticlesMock, getTagsMock } = vi.hoisted(() => ({
	routerState: {
		location: {
			pathname: "/app/favorites",
			search: {},
		},
	},
	getArticlesMock: vi.fn(),
	getTagsMock: vi.fn(),
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

vi.mock("#/server/articles", () => ({
	getArticles: getArticlesMock,
}));

vi.mock("#/server/tags", () => ({
	getTags: getTagsMock,
}));

describe("AppSidebar", () => {
	beforeEach(() => {
		routerState.location.pathname = "/app/favorites";
		routerState.location.search = {};
		getArticlesMock.mockReset().mockResolvedValue({ total: 3 });
		getTagsMock.mockReset().mockResolvedValue([]);
	});

	it("renders the favorites navigation item as active", async () => {
		renderWithProviders(<AppSidebar />);

		const favoritesLink = await screen.findByRole("link", {
			name: /favorites/i,
		});
		expect(favoritesLink).toHaveAttribute("href", "/app/favorites");
		expect(favoritesLink.className).toContain("bg-accent");
	});
});
