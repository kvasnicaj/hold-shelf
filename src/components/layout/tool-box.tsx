import { Slot } from "radix-ui";
import * as React from "react";
import { cn } from "#/lib/utils";

type ToolBoxProps = React.ComponentProps<"div"> & {
	size?: "sm" | "default";
	asChild?: boolean;
};

export const ToolBox = React.forwardRef<HTMLDivElement, ToolBoxProps>(
	({ children, className, size = "sm", asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot.Root : "div";

		return (
			<Comp
				ref={ref}
				className={cn(
					"inline-flex items-center rounded-lg border bg-card shadow-sm focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
					size === "sm" ? "h-9" : "h-10",
					className,
				)}
				{...props}
			>
				{children}
			</Comp>
		);
	},
);

ToolBox.displayName = "ToolBox";

export function ToolBoxInput({
	className,
	type = "text",
	...props
}: React.ComponentProps<"input">) {
	return (
		<input
			type={type}
			className={cn(
				"h-full w-full border-0 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground",
				className,
			)}
			{...props}
		/>
	);
}
