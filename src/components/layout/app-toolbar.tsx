import { User } from "lucide-react";
import { AccountMenuItems } from "#/components/layout/account-menu-items";
import { Button } from "#/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { authClient } from "#/lib/auth-client";

export function AppToolbar() {
	const { data: session } = authClient.useSession();

	return (
		<div className="flex shrink-0 items-center justify-end gap-2">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon-sm"
						className="md:hidden"
						aria-label="Account menu"
					>
						<User className="h-[1.125rem] w-[1.125rem]" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-48">
					{session?.user && (
						<div className="px-2 py-1.5 text-sm text-muted-foreground">
							{session.user.name ?? session.user.email}
						</div>
					)}
					<AccountMenuItems />
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
