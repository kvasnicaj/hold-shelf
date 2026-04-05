import type * as React from "react";
import { cn } from "#/lib/utils";

type StaticSidebarProps = React.ComponentProps<"div">;

export function StaticSidebar({
	className,
	children,
	...props
}: StaticSidebarProps) {
	return (
		<div
			data-slot="sidebar"
			className={cn(
				"flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}
