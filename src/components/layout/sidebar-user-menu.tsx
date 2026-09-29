import { User } from "lucide-react";
import { AccountMenuItems } from "#/components/layout/account-menu-items";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { authClient } from "#/lib/auth-client";

export function SidebarUserMenu() {
	const { data: session } = authClient.useSession();

	return (
		<div className="mr-3 mt-2 border-t border-sidebar-border pt-2">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button
						type="button"
						className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
					>
						<User className="h-4 w-4 shrink-0" />
						<span className="flex-1 truncate text-left">
							{session?.user?.name ?? session?.user?.email ?? "Account"}
						</span>
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start" side="top" className="w-48">
					{session?.user?.email && (
						<div className="px-2 py-1.5 text-sm text-muted-foreground">
							{session.user.email}
						</div>
					)}
					<AccountMenuItems />
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
