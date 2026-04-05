import { X } from "lucide-react";
import type { Tag } from "#/components/tags/types";
import { Badge } from "#/components/ui/badge";
import { NativeSelect } from "#/components/ui/native-select";

type ArchiveFiltersProps = {
	total: number;
	activeTag: Tag | null;
	tag?: string;
	filter?: "all" | "read" | "unread";
	sort?: "newest" | "oldest" | "title";
	tagList: Tag[];
	onClearTag: () => void;
	onTagChange: (tagId?: string) => void;
	onFilterChange: (filter?: "all" | "read" | "unread") => void;
	onSortChange: (sort: "newest" | "oldest" | "title") => void;
};

export function ArchiveFilters({
	total,
	activeTag,
	tag,
	filter,
	sort,
	tagList,
	onClearTag,
	onTagChange,
	onFilterChange,
	onSortChange,
}: ArchiveFiltersProps) {
	return (
		<div className="flex items-center gap-2">
			<p className="text-sm text-muted-foreground">
				{total} article{total !== 1 ? "s" : ""}
			</p>
			{activeTag && (
				<Badge variant="secondary" className="gap-1">
					{activeTag.name}
					<button
						type="button"
						className="ml-0.5 cursor-pointer rounded-full hover:bg-foreground/10"
						onClick={onClearTag}
					>
						<span className="sr-only">Clear tag filter</span>
						<X className="h-3 w-3" />
					</button>
				</Badge>
			)}
			<div className="ml-auto flex gap-2">
				<NativeSelect
					value={tag ?? ""}
					onChange={(event) => onTagChange(event.target.value || undefined)}
				>
					<option value="">All tags</option>
					{tagList.map((currentTag) => (
						<option key={currentTag.id} value={currentTag.id}>
							{currentTag.name}
						</option>
					))}
				</NativeSelect>
				<NativeSelect
					value={filter ?? "all"}
					onChange={(event) =>
						onFilterChange(
							event.target.value === "all"
								? undefined
								: (event.target.value as "all" | "read" | "unread"),
						)
					}
				>
					<option value="all">All</option>
					<option value="unread">Unread</option>
					<option value="read">Read</option>
				</NativeSelect>
				<NativeSelect
					value={sort ?? "newest"}
					onChange={(event) =>
						onSortChange(event.target.value as "newest" | "oldest" | "title")
					}
				>
					<option value="newest">Newest first</option>
					<option value="oldest">Oldest first</option>
					<option value="title">Title A-Z</option>
				</NativeSelect>
			</div>
		</div>
	);
}
