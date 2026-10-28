import { Cookie, Gear, SignOut, Trash } from "@phosphor-icons/react";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import ThemeToggle from "#/components/theme-toggle";
import { DropdownMenuItem } from "#/components/ui/dropdown-menu";
import { authClient } from "#/lib/auth-client";
import { showCookiePreferences } from "#/lib/cookie-consent";
export function AccountMenuItems() {
	const router = useRouter();
	return (
		<>
			<ThemeToggle variant="menu-item" />
			<DropdownMenuItem
				onSelect={() => {
					// Let the account menu release its focus trap first.
					setTimeout(() => void showCookiePreferences(), 0);
				}}
			>
				<Cookie className="mr-2 size-4" />
				Cookie preferences
			</DropdownMenuItem>
			<DropdownMenuItem
				onClick={() => {
					void router.navigate({ to: "/app/settings" });
				}}
			>
				<Gear className="mr-2 size-4" />
				Settings
			</DropdownMenuItem>
			<DropdownMenuItem
				onClick={() => {
					void router.navigate({ to: "/app/trash" });
				}}
			>
				<Trash className="mr-2 size-4" />
				Trash
			</DropdownMenuItem>
			<DropdownMenuItem
				onClick={() => {
					void authClient
						.signOut()
						.then((result) => {
							if (result?.error) throw new Error(result.error.message);
							return router.navigate({ to: "/login" });
						})
						.catch(() => toast.error("Could not sign out. Please try again."));
				}}
			>
				<SignOut className="mr-2 size-4" />
				Sign out
			</DropdownMenuItem>
		</>
	);
}
