import { useQuery } from "@tanstack/react-query";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { Bookmark, LogOut, Tag, User } from "lucide-react";
import { homeNavItem, libraryNavItems } from "#/components/layout/nav-items";
import { NavLink } from "#/components/layout/nav-link";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { authClient } from "#/lib/auth-client";
import { getArticles } from "#/server/articles";
import { getTags } from "#/server/tags";

export function AppSidebar() {
	const routerState = useRouterState();
	const currentPath = routerState.location.pathname;
	const searchParams = routerState.location.search as Record<string, string>;

	const { data: tagList = [] } = useQuery({
		queryKey: ["tags"],
		queryFn: () => getTags(),
	});

	const { data: unreadResult } = useQuery({
		queryKey: ["articles", "unread-count"],
		queryFn: () => getArticles({ data: { isRead: false, limit: 0 } }),
	});
	const unreadCount = unreadResult?.total ?? 0;
	const sortedTagList = [...tagList].sort((left, right) => {
		if (right.articleCount !== left.articleCount) {
			return right.articleCount - left.articleCount;
		}

		return left.name.localeCompare(right.name);
	});

	return (
		<aside className="flex w-56 flex-col border-r border-sidebar-border bg-sidebar pb-3 pl-3 pt-4 lg:pt-6">
			<Link
				to="/app/home"
				className="mb-6 flex h-9 shrink-0 items-center gap-2 px-2 no-underline"
			>
				<Bookmark className="h-7 w-7 text-(--lagoon)" />
				<span className="display-title text-xl font-bold text-foreground">
					Hold Shelf
				</span>
			</Link>

			<div className="min-h-0 flex-1 overflow-y-auto pr-3 [scrollbar-gutter:stable]">
				<nav className="space-y-0.5">
					<NavLink
						href={homeNavItem.href}
						icon={homeNavItem.icon}
						label={homeNavItem.label}
						isActive={currentPath === homeNavItem.href}
					/>
				</nav>

				<p className="mb-1 mt-4 px-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
					Library
				</p>
				<nav className="space-y-0.5">
					{libraryNavItems.map((item) => (
						<NavLink
							key={item.href}
							href={item.href}
							icon={item.icon}
							label={item.label}
							isActive={currentPath === item.href}
							badge={
								item.href === "/app/articles" && unreadCount > 0
									? unreadCount
									: undefined
							}
						/>
					))}
				</nav>

				{sortedTagList.length > 0 && (
					<>
						<p className="mb-1 mt-4 px-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
							Tags
						</p>
						<nav className="space-y-0.5">
							{sortedTagList.map((tag) => (
								<NavLink
									key={tag.id}
									href={`/app/archive?tag=${tag.id}`}
									linkProps={{ to: "/app/archive", search: { tag: tag.id } }}
									icon={Tag}
									iconClassName="h-3.5 w-3.5"
									label={tag.name}
									isActive={
										currentPath === "/app/archive" &&
										searchParams.tag === tag.id
									}
									count={tag.articleCount}
								/>
							))}
						</nav>
					</>
				)}
			</div>

			<SidebarUserMenu />
		</aside>
	);
}

function SidebarUserMenu() {
	const router = useRouter();
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
