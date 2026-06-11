import { Link, useRouterState } from "@tanstack/react-router";
import { mobileNavItems } from "#/components/layout/nav-items";
import { cn } from "#/lib/utils";

export function MobileBottomBar() {
	const currentPath = useRouterState().location.pathname;

	return (
		<nav className="fixed inset-x-6 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-40 md:hidden">
			<div className="overflow-hidden rounded-lg border bg-card/60 shadow-sm backdrop-blur-md">
				<ul className="grid grid-cols-5">
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
										"flex h-13 flex-col items-center justify-center gap-0.5 px-1 text-[0.6875rem] font-medium no-underline transition-colors",
										isActive
											? "bg-accent text-accent-foreground"
											: "text-muted-foreground hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
									)}
								>
									<Icon className="h-5 w-5 shrink-0" />
									<span className="truncate">{item.label}</span>
								</Link>
							</li>
						);
					})}
				</ul>
			</div>
		</nav>
	);
}
