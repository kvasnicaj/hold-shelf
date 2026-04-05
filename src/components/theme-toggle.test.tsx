import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import ThemeToggle from "#/components/theme-toggle";
import { renderWithProviders } from "#/test/render";

describe("ThemeToggle", () => {
	it("cycles auto, light, dark, and back to auto while persisting theme state", async () => {
		const user = userEvent.setup();
		renderWithProviders(<ThemeToggle />);

		let button = await screen.findByRole("button", { name: "Theme: system" });
		expect(document.documentElement).toHaveClass("light");
		expect(document.documentElement).not.toHaveAttribute("data-theme");

		await user.click(button);
		button = screen.getByRole("button", { name: "Theme: light" });
		expect(window.localStorage.getItem("theme")).toBe("light");
		expect(document.documentElement).toHaveClass("light");
		expect(document.documentElement).toHaveAttribute("data-theme", "light");

		await user.click(button);
		button = screen.getByRole("button", { name: "Theme: dark" });
		expect(window.localStorage.getItem("theme")).toBe("dark");
		expect(document.documentElement).toHaveClass("dark");
		expect(document.documentElement).toHaveAttribute("data-theme", "dark");

		await user.click(button);
		await waitFor(() =>
			expect(
				screen.getByRole("button", { name: "Theme: system" }),
			).toBeInTheDocument(),
		);
		expect(window.localStorage.getItem("theme")).toBe("auto");
		expect(document.documentElement).toHaveClass("light");
		expect(document.documentElement).not.toHaveAttribute("data-theme");
	});
});
