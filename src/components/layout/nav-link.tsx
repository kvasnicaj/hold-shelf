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
					? "bg-accent font-medium text-foreground"
					: "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
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
				<span className="text-xs text-muted-foreground">{count}</span>
			)}
		</Link>
	);
}
