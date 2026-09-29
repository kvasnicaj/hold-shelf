import { useRouter } from "@tanstack/react-router";
import { LogOut, Settings, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ThemeToggle from "#/components/theme-toggle";
import { DropdownMenuItem } from "#/components/ui/dropdown-menu";
import { authClient } from "#/lib/auth-client";
export function AccountMenuItems() {
	const router = useRouter();
	return (
		<>
			<ThemeToggle variant="menu-item" />
			<DropdownMenuItem
				onClick={() => {
					void router.navigate({ to: "/app/settings" });
				}}
			>
				<Settings className="mr-2 size-4" />
				Settings
			</DropdownMenuItem>
			<DropdownMenuItem
				onClick={() => {
					void router.navigate({ to: "/app/trash" });
				}}
			>
				<Trash2 className="mr-2 size-4" />
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
				<LogOut className="mr-2 size-4" />
				Sign out
			</DropdownMenuItem>
		</>
	);
}
