import type { TagPickerOptions } from "#/components/tags/use-tag-picker";
import { cn } from "#/lib/utils";

export function buildTagShareUrl(token: string, origin?: string) {
	const path = `/share/${encodeURIComponent(token)}`;
	return origin ? new URL(path, origin).toString() : path;
}

export function getTagChipClassName(isActive: boolean) {
	return cn(
		"inline-flex h-8 shrink-0 items-center gap-1.5 rounded-sm px-2.5 text-meta font-semibold transition-colors pointer-coarse:h-9",
		isActive
			? "bg-select text-foreground ring-1 ring-mark/45 ring-inset"
			: "bg-muted text-muted-foreground",
	);
}

/** Inert picker options for menus that offer no tag editing. */
export const NO_TAG_PICKER: TagPickerOptions = {
	availableTags: [],
	selectedTagIds: [],
	articleIds: [],
	onAddTag: () => {},
	onRemoveTag: () => {},
};
