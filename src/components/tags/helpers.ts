import { cn } from "#/lib/utils";

export function buildTagShareUrl(token: string, origin?: string) {
	const path = `/share/${encodeURIComponent(token)}`;
	return origin ? new URL(path, origin).toString() : path;
}

export function getTagChipClassName(isActive: boolean) {
	return cn(
		"inline-flex h-7 shrink-0 items-center gap-1.5 rounded-sm px-2.5 text-xs font-semibold transition-colors",
		isActive
			? "bg-select text-foreground ring-1 ring-mark/45 ring-inset"
			: "bg-muted text-muted-foreground",
	);
}
