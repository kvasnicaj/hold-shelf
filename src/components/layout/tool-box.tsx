import type * as React from "react";
import { cn } from "#/lib/utils";

type ToolBoxProps = {
	children: React.ReactNode;
	className?: string;
	size?: "sm" | "default";
};

export function ToolBox({ children, className, size = "sm" }: ToolBoxProps) {
	return (
		<div
			className={cn(
				"inline-flex items-center rounded-lg border bg-card shadow-sm focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
				size === "sm" ? "h-8" : "h-9",
				className,
			)}
		>
			{children}
		</div>
	);
}

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
