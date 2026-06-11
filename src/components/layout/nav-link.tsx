import { Link } from "@tanstack/react-router";

type NavLinkProps = {
	href: string;
	linkProps?: Record<string, unknown>;
	icon: React.ComponentType<{ className?: string }>;
	iconClassName?: string;
	label: string;
	isActive: boolean;
	badge?: number;
	count?: number;
};

export function NavLink({
	href,
	linkProps,
	icon: Icon,
	iconClassName,
	label,
	isActive,
	badge,
	count,
}: NavLinkProps) {
	const props = linkProps ?? { to: href };
	return (
		<Link
			to={props.to as string}
			{...props}
			className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm no-underline transition-colors ${
				isActive
					? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
					: "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
			}`}
		>
			<Icon className={iconClassName ?? "h-4 w-4 shrink-0"} />
			<span className="flex-1 truncate">{label}</span>
			{badge !== undefined && (
				<span className="min-w-5 rounded-full bg-primary px-1.5 py-0.5 text-center text-[10px] font-medium text-primary-foreground">
					{badge}
				</span>
			)}
			{count !== undefined && (
				<span className="text-xs text-sidebar-foreground/60">{count}</span>
			)}
		</Link>
	);
}
