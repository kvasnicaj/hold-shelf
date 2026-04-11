import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CHROME_EXTENSION_URL } from "#/components/home/helpers";
import { LandingPage } from "#/components/home/landing-page";
import { renderWithProviders } from "#/test/render";

vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);

	return {
		...actual,
		Link: ({
			children,
			to,
			...props
		}: React.ComponentProps<"a"> & { to: string }) => (
			<a href={to} {...props}>
				{children}
			</a>
		),
	};
});

describe("LandingPage", () => {
	it("renders the secondary Chrome extension link under the primary CTA", () => {
		renderWithProviders(<LandingPage />);

		expect(
			screen.queryByText("Chrome extension is live"),
		).not.toBeInTheDocument();
		expect(
			screen.getByText("Also available as a Chrome extension."),
		).toBeInTheDocument();
		expect(
			screen.queryByRole("heading", { name: "Extensions" }),
		).not.toBeInTheDocument();
		expect(screen.getByRole("link", { name: /get started/i })).toHaveAttribute(
			"href",
			"/login",
		);
		expect(
			screen.getByRole("link", { name: /add to chrome/i }),
		).toHaveAttribute("href", CHROME_EXTENSION_URL);
	});
});
