import { Plus } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import { BrandLogo } from "#/components/brand/brand-logo";
import { primaryNavItems, unreadNavHref } from "#/components/layout/nav-items";
import { NavLink } from "#/components/layout/nav-link";
import { SaveLinkAction } from "#/components/layout/save-link-action";
import { SidebarTagsSection } from "#/components/layout/sidebar-tags-section";
import { SidebarUserMenu } from "#/components/layout/sidebar-user-menu";
import { useUnreadCount } from "#/components/layout/use-unread-count";
import { Button } from "#/components/ui/button";
import { getTags } from "#/server/tags";

export function AppSidebar() {
	const routerState = useRouterState();
	const currentPath = routerState.location.pathname;
	const searchParams = routerState.location.search as Record<string, string>;
	const unreadCount = useUnreadCount();

	const { data: tagList = [] } = useQuery({
		queryKey: ["tags"],
		queryFn: () => getTags(),
	});

	return (
		<aside className="flex w-56 flex-col bg-sidebar pb-3 pl-3 pt-4 lg:pt-5">
			<Link
				to="/app/home"
				className="mb-5 flex h-9 shrink-0 items-center gap-2 px-2 no-underline"
			>
				<BrandLogo className="h-7" />
			</Link>

			<div className="mr-3 mb-4">
				<SaveLinkAction>
					<Button className="w-full justify-start" aria-keyshortcuts="S">
						<Plus />
						Save a link
						<kbd className="ml-auto border-primary-foreground/40 bg-transparent text-primary-foreground">
							S
						</kbd>
					</Button>
				</SaveLinkAction>
			</div>

			<div className="min-h-0 flex-1 overflow-y-auto pr-3 [scrollbar-gutter:stable]">
				<nav aria-label="Main" className="space-y-0.5">
					{primaryNavItems.map((item) => (
						<NavLink
							key={item.href}
							href={item.href}
							icon={item.icon}
							label={item.label}
							isActive={currentPath === item.href}
							badge={
								item.href === unreadNavHref && unreadCount > 0
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
