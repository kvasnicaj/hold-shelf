import { ChevronDown } from "lucide-react";
import type * as React from "react";
import { cn } from "#/lib/utils";

function NativeSelect({
	className,
	children,
	...props
}: React.ComponentProps<"select">) {
	return (
		<div className="relative inline-flex">
			<select
				className={cn(
					"h-9 appearance-none rounded-md border border-input bg-background pl-3 pr-10 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
					className,
				)}
				{...props}
			>
				{children}
			</select>
			<ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
		</div>
	);
}

export { NativeSelect };
