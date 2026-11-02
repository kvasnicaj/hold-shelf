import { cn } from "#/lib/utils";

export const SEARCH_FIELD_CLASS_NAME =
	"h-9 border-input bg-muted/35 shadow-none dark:bg-input/30";

export function getMobileTabClassName(isActive: boolean) {
	return cn(
		"flex h-13 w-full min-w-0 flex-col items-center justify-center gap-0.5 rounded-md text-xs font-semibold no-underline transition-colors",
		isActive
			? "text-foreground"
			: "text-muted-foreground hover:text-foreground",
	);
}
