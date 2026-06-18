import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MobileNavigation } from "#/components/layout/mobile-navigation";
import { renderWithProviders } from "#/test/render";

const { routerState } = vi.hoisted(() => ({
	routerState: {
		location: {
			pathname: "/app/favorites",
		},
	},
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
	it("renders all primary navigation shortcuts", () => {
		renderWithProviders(<MobileNavigation />);

		expect(screen.getByRole("navigation", { name: /primary/i })).toBeVisible();
		expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute(
			"href",
			"/app/home",
		);
		const favoritesLink = screen.getByRole("link", { name: /favorites/i });
		expect(favoritesLink).toHaveAttribute("href", "/app/favorites");
		expect(screen.getAllByRole("link")).toHaveLength(5);
	});
});
