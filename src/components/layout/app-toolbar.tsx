import { useRouter } from "@tanstack/react-router";
import { LogOut, User } from "lucide-react";
import { Button } from "#/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { authClient } from "#/lib/auth-client";

export function AppToolbar() {
	const router = useRouter();
	const { data: session } = authClient.useSession();

	return (
		<div className="flex shrink-0 items-center justify-end gap-2">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon-sm" className="md:hidden">
						<User className="h-[1.125rem] w-[1.125rem]" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-48">
					{session?.user && (
						<div className="px-2 py-1.5 text-sm text-muted-foreground">
							{session.user.name ?? session.user.email}
						</div>
					)}
					<DropdownMenuItem
						onClick={async () => {
							await authClient.signOut();
							router.navigate({ to: "/login" });
						}}
					>
						<LogOut className="mr-2 h-4 w-4" />
						Sign out
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
