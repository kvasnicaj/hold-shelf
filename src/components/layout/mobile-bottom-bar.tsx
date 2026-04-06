import { Link, useRouterState } from "@tanstack/react-router";
import {
	Archive,
	BookMarked,
	Bookmark,
	BookOpen,
	Home,
	Tags,
} from "lucide-react";
import { ToolBox } from "#/components/layout/tool-box";
import { Button } from "#/components/ui/button";

const navItems = [
	{ href: "/app/home", icon: Home, label: "Home" },
	{ href: "/app/articles", icon: BookOpen, label: "Unread" },
	{ href: "/app/favorites", icon: BookMarked, label: "Favorites" },
	{ href: "/app/archive", icon: Archive, label: "Archive" },
	{ href: "/app/tags", icon: Tags, label: "Tags" },
] as const;

export function MobileBottomBar() {
	const currentPath = useRouterState().location.pathname;

	return (
		<nav className="fixed inset-x-0 bottom-0 z-40 flex justify-center p-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] md:hidden">
			<ToolBox
				size="default"
				className="h-[3.75rem] gap-1 rounded-2xl px-2.5 shadow-md"
			>
				<Link
					to="/app/home"
					className="inline-flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-xl no-underline"
					aria-label="Hold Shelf home"
					title="Hold Shelf"
				>
					<Bookmark className="h-[2.125rem] w-[2.125rem] text-(--lagoon)" />
				</Link>
				<div className="mx-2 h-7 w-px bg-border" />
				{navItems.map((item) => {
					const isActive = currentPath === item.href;
					const Icon = item.icon;

					return (
						<Button
							key={item.href}
							variant="ghost"
							size="icon-lg"
							asChild
							className={
								isActive ? "rounded-xl bg-accent text-foreground" : "rounded-xl"
							}
							title={item.label}
							aria-label={item.label}
						>
							<Link to={item.href} className="no-underline">
								<Icon className="h-8 w-8 opacity-60" />
							</Link>
						</Button>
					);
				})}
			</ToolBox>
		</nav>
	);
}
