import { TagItem } from "#/components/tags/tag-item";

type TagsListViewProps = {
	filteredTags: Array<{ id: string; name: string; articleCount: number }>;
	filter: string;
	activeTagId?: string;
	onSelectTag: (tagId: string) => void;
	onRename: (id: string, name: string) => Promise<void>;
	onDelete: (id: string) => Promise<void>;
	className?: string;
	emptyStateClassName?: string;
};

export function TagsListView({
	filteredTags,
	filter,
	activeTagId,
	onSelectTag,
	onRename,
	onDelete,
	className = "space-y-2",
	emptyStateClassName = "px-2 py-6 text-center text-sm text-muted-foreground",
}: TagsListViewProps) {
	return (
		<nav className={className}>
			{filteredTags.length === 0 ? (
				<p className={emptyStateClassName}>
					{filter ? "No tags match." : "No tags yet."}
				</p>
			) : (
				filteredTags.map((tag) => (
					<TagItem
						key={tag.id}
						tag={tag}
						isActive={activeTagId === tag.id}
						onSelect={() => onSelectTag(tag.id)}
						onRename={onRename}
						onDelete={onDelete}
					/>
				))
			)}
		</nav>
	);
}
