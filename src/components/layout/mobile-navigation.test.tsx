import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

vi.mock("#/components/articles/use-save-article", () => ({
	useSaveArticle: () => ({ handleAdd: vi.fn() }),
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
	it("renders primary navigation and a one-tap Add article action", async () => {
		const user = userEvent.setup();
		renderWithProviders(<MobileNavigation />);

		expect(screen.getByRole("navigation", { name: /primary/i })).toBeVisible();
		expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute(
			"href",
			"/app/home",
		);
		const favoritesLink = screen.getByRole("link", { name: /favorites/i });
		expect(favoritesLink).toHaveAttribute("href", "/app/favorites");
		const addArticleButton = screen.getByRole("button", {
			name: "Add article",
		});
		expect(addArticleButton).toBeVisible();
		await user.click(addArticleButton);
		expect(screen.getByRole("heading", { name: "Save article" })).toBeVisible();
		await user.keyboard("{Escape}");
		expect(screen.getAllByRole("link")).toHaveLength(5);
	});
});
