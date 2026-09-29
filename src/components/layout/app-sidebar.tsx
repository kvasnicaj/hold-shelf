import { useQuery } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import {
	desktopLibraryNavItems,
	homeNavItem,
} from "#/components/layout/nav-items";
import { NavLink } from "#/components/layout/nav-link";
import { SidebarTagsSection } from "#/components/layout/sidebar-tags-section";
import { SidebarUserMenu } from "#/components/layout/sidebar-user-menu";
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
		queryFn: () => getArticles({ data: { isRead: false, limit: 1 } }),
	});
	const unreadCount = unreadResult?.total ?? 0;

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
					{desktopLibraryNavItems.map((item) => (
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

				<SidebarTagsSection
					tags={tagList}
					currentPath={currentPath}
					activeTagId={searchParams.tag}
				/>
			</div>

			<SidebarUserMenu />
		</aside>
	);
}
