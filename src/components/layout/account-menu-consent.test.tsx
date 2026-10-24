import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as CookieConsent from "vanilla-cookieconsent";
import { afterEach, expect, it, vi } from "vitest";
import { AccountMenuItems } from "#/components/layout/account-menu-items";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";

vi.mock("@tanstack/react-router", () => ({
	useRouter: () => ({ navigate: vi.fn() }),
}));
vi.mock("#/lib/auth-client", () => ({
	authClient: { signOut: vi.fn() },
}));

afterEach(() => CookieConsent.reset(true));

it("opens consent preferences by keyboard after the shared account dropdown closes", async () => {
	const user = userEvent.setup();
	render(
		<DropdownMenu>
			<DropdownMenuTrigger>Account</DropdownMenuTrigger>
			<DropdownMenuContent>
				<AccountMenuItems />
			</DropdownMenuContent>
		</DropdownMenu>,
	);
	await user.click(screen.getByRole("button", { name: "Account" }));
	screen.getByRole("menuitem", { name: "Cookie preferences" }).focus();
	await user.keyboard("{Enter}");
	await waitFor(() =>
		expect(
			screen.getByRole("dialog", { name: "Cookie preferences" }),
		).toBeInTheDocument(),
	);
	expect(screen.queryByRole("menu")).not.toBeInTheDocument();
});
