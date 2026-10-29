import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { cn } from "#/lib/utils";

type NavLinkProps = {
	href: string;
	icon: PhosphorIcon;
	label: string;
	isActive: boolean;
	badge?: number;
	/** Key pressed after G to reach this page. */
	shortcutKey?: string;
};

export function NavLink({
	href,
	icon: Icon,
	label,
	isActive,
	badge,
	shortcutKey,
}: NavLinkProps) {
	return (
		<Link
			to={href}
			aria-current={isActive ? "page" : undefined}
			aria-keyshortcuts={shortcutKey ? `g ${shortcutKey}` : undefined}
			title={
				shortcutKey
					? `${label} (G then ${shortcutKey.toUpperCase()})`
					: undefined
			}
			className={cn(
				"flex h-8 items-center gap-2.5 rounded-md px-2.5 text-sm no-underline transition-colors",
				isActive
					? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground ring-1 ring-sidebar-border"
					: "font-medium text-muted-foreground hover:bg-accent hover:text-foreground",
			)}
		>
			<Icon
				weight={isActive ? "fill" : "regular"}
				className={cn("size-4 shrink-0", isActive && "text-mark")}
			/>
			<span className="flex-1 truncate">{label}</span>
			{badge !== undefined && (
				<span className="text-xs font-bold tabular-nums text-primary">
					{badge}
				</span>
			)}
		</Link>
	);
}
