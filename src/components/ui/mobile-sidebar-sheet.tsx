import type * as React from "react";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "#/components/ui/sheet";

type MobileSidebarSheetProps = React.ComponentProps<typeof Sheet> & {
	side: "left" | "right";
	children: React.ReactNode;
};

export function MobileSidebarSheet({
	side,
	children,
	...props
}: MobileSidebarSheetProps) {
	return (
		<Sheet {...props}>
			<SheetContent
				data-sidebar="sidebar"
				data-slot="sidebar"
				data-mobile="true"
				className="w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
				style={
					{
						"--sidebar-width": "18rem",
					} as React.CSSProperties
				}
				side={side}
			>
				<SheetHeader className="sr-only">
					<SheetTitle>Sidebar</SheetTitle>
					<SheetDescription>Displays the mobile sidebar.</SheetDescription>
				</SheetHeader>
				<div className="flex h-full w-full flex-col">{children}</div>
			</SheetContent>
		</Sheet>
	);
}
