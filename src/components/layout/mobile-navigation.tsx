import { Link, useRouterState } from "@tanstack/react-router";
import { mobileNavItems } from "#/components/layout/nav-items";
import { cn } from "#/lib/utils";

export function MobileNavigation() {
	const currentPath = useRouterState().location.pathname;

	return (
		<nav
			aria-label="Primary"
			className="fixed inset-x-0 bottom-0 z-40 border-t border-sidebar-border bg-sidebar/95 px-3 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] shadow-[0_-1px_8px_rgba(0,0,0,0.06)] backdrop-blur-md supports-[backdrop-filter]:bg-sidebar/85 md:hidden"
		>
			<ul className="grid grid-cols-5 gap-1">
				{mobileNavItems.map((item) => {
					const isActive = currentPath === item.href;
					const Icon = item.icon;

					return (
						<li key={item.href} className="min-w-0">
							<Link
								to={item.href}
								aria-label={item.label}
								aria-current={isActive ? "page" : undefined}
								className={cn(
									"flex h-12 min-w-0 flex-col items-center justify-center gap-0.5 rounded-md px-1 text-[0.6875rem] font-medium no-underline transition-colors",
									isActive
										? "bg-sidebar-accent text-sidebar-accent-foreground shadow-xs"
										: "text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
								)}
							>
								<Icon className="h-5 w-5 shrink-0" />
								<span className="max-w-full truncate">{item.label}</span>
							</Link>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
