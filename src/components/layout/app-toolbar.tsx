import {
	Link,
	useNavigate,
	useRouter,
	useRouterState,
} from "@tanstack/react-router";
import { LogOut, Search, Settings, User } from "lucide-react";
import { useState } from "react";
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
	searchPlaceholder?: string;
	onSearch?: (query: string) => void;
};

export function AppToolbar({
	actions,
	searchPlaceholder,
	onSearch,
}: AppToolbarProps) {
	const [search, setSearch] = useState("");
	const navigate = useNavigate();
	const router = useRouter();
	const routerState = useRouterState();
	const currentPath = routerState.location.pathname;
	const { data: session } = authClient.useSession();

	const placeholder = searchPlaceholder ?? "Search articles...";

	function handleSearchChange(value: string) {
		setSearch(value);
		if (onSearch) {
			onSearch(value);
		}
	}

	function handleSearchSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!onSearch && search.trim()) {
			navigate({ to: "/app/archive", search: { q: search.trim() } });
		}
	}

	return (
		<div className="flex items-center gap-2">
			<form onSubmit={handleSearchSubmit} className="relative">
				<ToolBox className="w-44 gap-1.5 px-2 lg:w-56">
					<Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
					<ToolBoxInput
						type="search"
						placeholder={placeholder}
						value={search}
						onChange={(e) => handleSearchChange(e.target.value)}
					/>
				</ToolBox>
			</form>

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
						<Settings className="h-4 w-4" />
					</Link>
				</Button>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon-sm">
							<User className="h-4 w-4" />
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
