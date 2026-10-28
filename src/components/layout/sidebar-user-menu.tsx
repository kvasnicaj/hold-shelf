import { AccountMenuItems } from "#/components/layout/account-menu-items";
import { UserAvatar } from "#/components/layout/user-avatar";
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
						className="flex h-9 w-full items-center gap-2.5 rounded-md px-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
					>
						<UserAvatar
							name={session?.user?.name ?? session?.user?.email}
							image={session?.user?.image}
						/>
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
