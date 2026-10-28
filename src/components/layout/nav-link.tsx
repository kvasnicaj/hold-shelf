import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { cn } from "#/lib/utils";

type NavLinkProps = {
	href: string;
	icon: LucideIcon;
	label: string;
	isActive: boolean;
	badge?: number;
};

export function NavLink({
	href,
	icon: Icon,
	label,
	isActive,
	badge,
}: NavLinkProps) {
	return (
		<Link
			to={href}
			aria-current={isActive ? "page" : undefined}
			className={cn(
				"flex h-8 items-center gap-2.5 rounded-md px-2.5 text-sm no-underline transition-colors",
				isActive
					? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground ring-1 ring-sidebar-border"
					: "font-medium text-muted-foreground hover:bg-accent hover:text-foreground",
			)}
		>
			<Icon className={cn("size-4 shrink-0", isActive && "text-mark")} />
			<span className="flex-1 truncate">{label}</span>
			{badge !== undefined && (
				<span className="text-xs font-bold tabular-nums text-primary">
					{badge}
				</span>
			)}
		</Link>
	);
}
