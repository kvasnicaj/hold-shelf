import type { LucideIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { DropdownMenuItem } from "#/components/ui/dropdown-menu";
import { cn } from "#/lib/utils";

type SidebarUserMenuItemProps = {
	icon: LucideIcon;
	children: ReactNode;
	className?: string;
	onSelect?: ComponentProps<typeof DropdownMenuItem>["onSelect"];
	onClick?: ComponentProps<typeof DropdownMenuItem>["onClick"];
};

export function SidebarUserMenuItem({
	icon: Icon,
	children,
	className,
	onSelect,
	onClick,
}: SidebarUserMenuItemProps) {
	return (
		<DropdownMenuItem
			onClick={onClick}
			onSelect={onSelect}
			className={cn("gap-2", className)}
		>
			<Icon className="h-4 w-4" />
			{children}
		</DropdownMenuItem>
	);
}
