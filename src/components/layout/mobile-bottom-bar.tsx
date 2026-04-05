import { Link, useRouterState } from "@tanstack/react-router";
import { Archive, Bookmark, BookOpen, Home, Tags } from "lucide-react";
import { ToolBox } from "#/components/layout/tool-box";
import { Button } from "#/components/ui/button";

const navItems = [
	{ href: "/app/home", icon: Home, label: "Home" },
	{ href: "/app/articles", icon: BookOpen, label: "Unread" },
	{ href: "/app/archive", icon: Archive, label: "Archive" },
	{ href: "/app/tags", icon: Tags, label: "Tags" },
] as const;

export function MobileBottomBar() {
	const currentPath = useRouterState().location.pathname;

	return (
		<nav className="fixed inset-x-0 bottom-0 z-40 flex justify-center p-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] md:hidden">
			<ToolBox size="default" className="h-11 gap-0 rounded-xl px-1">
				<Link
					to="/app/home"
					className="inline-flex h-10 w-10 items-center justify-center rounded-lg no-underline"
					aria-label="Hold Shelf home"
					title="Hold Shelf"
				>
					<Bookmark className="h-6 w-6 text-(--lagoon)" />
				</Link>
				<div className="mx-1 h-6 w-px bg-border" />
				{navItems.map((item) => {
					const isActive = currentPath === item.href;
					const Icon = item.icon;

					return (
						<Button
							key={item.href}
							variant="ghost"
							size="icon-lg"
							asChild
							className={isActive ? "bg-accent text-foreground" : ""}
							title={item.label}
							aria-label={item.label}
						>
							<Link to={item.href} className="no-underline">
								<Icon className="h-6 w-6" />
							</Link>
						</Button>
					);
				})}
			</ToolBox>
		</nav>
	);
}
