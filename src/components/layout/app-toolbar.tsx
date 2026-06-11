import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { LogOut, Search, Settings, User } from "lucide-react";
import { useEffect, useState } from "react";
import { ToolBox, ToolBoxInput } from "#/components/layout/tool-box";
import ThemeToggle from "#/components/theme-toggle";
import { Button } from "#/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { authClient } from "#/lib/auth-client";

type AppToolbarProps = {
	actions?: React.ReactNode;
	searchValue?: string;
	searchPlaceholder?: string;
	onSearch?: (query: string) => void;
};

export function AppToolbar({
	actions,
	searchValue,
	searchPlaceholder,
	onSearch,
}: AppToolbarProps) {
	const [search, setSearch] = useState(searchValue ?? "");
	const router = useRouter();
	const routerState = useRouterState();
	const currentPath = routerState.location.pathname;
	const { data: session } = authClient.useSession();
	const showSearch = Boolean(onSearch);

	useEffect(() => {
		setSearch(searchValue ?? "");
	}, [searchValue]);

	function handleSearchChange(value: string) {
		setSearch(value);
		onSearch?.(value);
	}

	function handleSearchSubmit(e: React.FormEvent) {
		e.preventDefault();
	}

	return (
		<div className="flex w-full items-center justify-end gap-2">
			{showSearch ? (
				<form onSubmit={handleSearchSubmit} className="relative">
					<ToolBox className="w-44 shrink-0 gap-1.5 px-2.5 lg:w-56">
						<Search className="h-4 w-4 shrink-0 text-muted-foreground" />
						<ToolBoxInput
							type="search"
							placeholder={searchPlaceholder}
							value={search}
							onChange={(e) => handleSearchChange(e.target.value)}
						/>
					</ToolBox>
				</form>
			) : null}

			{actions}

			<ToolBox>
				<ThemeToggle size="icon-sm" />
				<Button
					variant="ghost"
					size="icon-sm"
					asChild
					className={currentPath === "/app/settings" ? "bg-accent" : ""}
				>
					<Link to="/app/settings" className="no-underline">
						<Settings className="h-[1.125rem] w-[1.125rem]" />
					</Link>
				</Button>
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
			</ToolBox>
		</div>
	);
}
