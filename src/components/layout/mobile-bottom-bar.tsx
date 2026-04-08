import { Link, useRouterState } from "@tanstack/react-router";
import { mobileNavItems } from "#/components/layout/nav-items";
import { SidebarFooter } from "#/components/ui/sidebar";
import { cn } from "#/lib/utils";

export function MobileBottomBar() {
	const currentPath = useRouterState().location.pathname;

	return (
		<nav className="fixed inset-x-0 bottom-0 z-40 border-t border-sidebar-border bg-sidebar text-sidebar-foreground md:hidden">
			<SidebarFooter className="gap-0 px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
				<ul className="grid grid-cols-5 gap-1">
					{mobileNavItems.map((item) => {
						const isActive = currentPath === item.href;
						const Icon = item.icon;

						return (
							<li key={item.href}>
								<Link
									to={item.href}
									aria-label={item.label}
									aria-current={isActive ? "page" : undefined}
									className={cn(
										"flex h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[0.6875rem] font-medium no-underline transition-colors",
										isActive
											? "bg-sidebar-accent text-sidebar-accent-foreground"
											: "text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
									)}
								>
									<Icon className="h-5 w-5 shrink-0" />
									<span className="truncate">{item.label}</span>
								</Link>
							</li>
						);
					})}
				</ul>
			</SidebarFooter>
		</nav>
	);
}
