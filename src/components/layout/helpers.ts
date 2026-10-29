import { cn } from "#/lib/utils";

export function getMobileTabClassName(isActive: boolean) {
	return cn(
		"flex h-13 w-full min-w-0 flex-col items-center justify-center gap-0.5 rounded-md text-[11px] font-semibold no-underline transition-colors",
		isActive
			? "text-foreground"
			: "text-muted-foreground hover:text-foreground",
	);
}
