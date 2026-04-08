import { X } from "lucide-react";
import type { Tag } from "#/components/tags/types";
import { Badge } from "#/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";

const ALL_TAGS_VALUE = "__all_tags__";

type ArchiveFiltersProps = {
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
		<div className="flex flex-wrap items-center gap-2">
			{activeTag && (
				<Badge variant="secondary" className="gap-1">
					{activeTag.name}
					<button
						type="button"
						className="ml-0.5 inline-flex size-5 cursor-pointer items-center justify-center rounded-full hover:bg-foreground/10"
						onClick={onClearTag}
					>
						<span className="sr-only">Clear tag filter</span>
						<X className="h-3.5 w-3.5" />
					</button>
				</Badge>
			)}
			<div className="flex w-full flex-wrap gap-2 md:ml-auto md:w-auto">
				<Select
					value={tag ?? ALL_TAGS_VALUE}
					onValueChange={(value) =>
						onTagChange(value === ALL_TAGS_VALUE ? undefined : value)
					}
				>
					<SelectTrigger aria-label="Tag filter" className="min-w-36">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value={ALL_TAGS_VALUE}>All tags</SelectItem>
						{tagList.map((currentTag) => (
							<SelectItem key={currentTag.id} value={currentTag.id}>
								{currentTag.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select
					value={filter ?? "all"}
					onValueChange={(value) =>
						onFilterChange(
							value === "all"
								? undefined
								: (value as "all" | "read" | "unread"),
						)
					}
				>
					<SelectTrigger aria-label="Read status filter" className="min-w-32">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All</SelectItem>
						<SelectItem value="unread">Unread</SelectItem>
						<SelectItem value="read">Read</SelectItem>
					</SelectContent>
				</Select>
				<Select
					value={sort ?? "newest"}
					onValueChange={(value) =>
						onSortChange(value as "newest" | "oldest" | "title")
					}
				>
					<SelectTrigger
						aria-label="Sort archive articles"
						className="min-w-40"
					>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="newest">Newest first</SelectItem>
						<SelectItem value="oldest">Oldest first</SelectItem>
						<SelectItem value="title">Title A-Z</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}
