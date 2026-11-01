import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { ThemeChoice } from "#/components/theme/theme-choice";
import { ThemeMenuItems } from "#/components/theme/theme-menu-items";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { renderWithProviders } from "#/test/render";

describe("Theme choice", () => {
	afterEach(() => {
		window.localStorage.clear();
		document.documentElement.classList.remove("dark");
		document.documentElement.removeAttribute("data-theme");
	});

	it("shows System as the current choice and applies an explicit pick", async () => {
		const user = userEvent.setup();
		renderWithProviders(<ThemeChoice />);

		expect(screen.getByRole("radio", { name: "System" })).toBeChecked();

		await user.click(screen.getByRole("radio", { name: "Dark" }));
		expect(screen.getByRole("radio", { name: "Dark" })).toBeChecked();
		expect(window.localStorage.getItem("theme")).toBe("dark");
		expect(document.documentElement).toHaveClass("dark");
		expect(document.documentElement).toHaveAttribute("data-theme", "dark");

		await user.click(screen.getByRole("radio", { name: "System" }));
		expect(window.localStorage.getItem("theme")).toBe("auto");
		expect(document.documentElement).toHaveClass("light");
		expect(document.documentElement).not.toHaveAttribute("data-theme");
	});

	it("keeps the account menu and Settings on the same choice", async () => {
		const user = userEvent.setup();
		window.localStorage.setItem("theme", "light");
		renderWithProviders(
			<>
				<ThemeChoice />
				<DropdownMenu>
					<DropdownMenuTrigger>Account</DropdownMenuTrigger>
					<DropdownMenuContent>
						<ThemeMenuItems />
					</DropdownMenuContent>
				</DropdownMenu>
			</>,
		);

		expect(await screen.findByRole("radio", { name: "Light" })).toBeChecked();
		await user.click(screen.getByRole("button", { name: "Account" }));
		expect(
			screen.getByRole("menuitemradio", { name: "Light" }),
		).toHaveAttribute("aria-checked", "true");

		await user.click(screen.getByRole("menuitemradio", { name: "Dark" }));
		expect(screen.getByRole("menuitemradio", { name: "Dark" })).toHaveAttribute(
			"aria-checked",
			"true",
		);
		await user.keyboard("{Escape}");
		expect(screen.getByRole("radio", { name: "Dark" })).toBeChecked();
		expect(window.localStorage.getItem("theme")).toBe("dark");
	});
});
