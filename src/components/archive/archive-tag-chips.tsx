import { Link } from "@tanstack/react-router";
import { TagChip } from "#/components/tags/tag-chip";
import type { Tag } from "#/components/tags/types";

type ArchiveTagChipsProps = {
	tags: Tag[];
	selectedTagIds: string[];
	onChange: (tagIds: string[]) => void;
};

export function ArchiveTagChips({
	tags,
	selectedTagIds,
	onChange,
}: ArchiveTagChipsProps) {
	return (
		<nav
			aria-label="Filter by tag"
			className="-mx-3 flex gap-1.5 overflow-x-auto px-3 [scrollbar-width:none] sm:-mx-6 sm:px-6 md:hidden"
		>
			<TagChip
				isActive={selectedTagIds.length === 0}
				onClick={() => onChange([])}
			>
				All tags
			</TagChip>
			{tags.map((tag) => {
				const isActive = selectedTagIds.includes(tag.id);

				return (
					<TagChip
						key={tag.id}
						isActive={isActive}
						count={tag.articleCount}
						onClick={() =>
							onChange(
								isActive
									? selectedTagIds.filter((id) => id !== tag.id)
									: [...selectedTagIds, tag.id],
							)
						}
					>
						{tag.name}
					</TagChip>
				);
			})}
			<Link
				to="/app/tags"
				className="inline-flex h-7 shrink-0 items-center px-1.5 text-xs font-semibold text-primary no-underline"
			>
				Manage
			</Link>
		</nav>
	);
}
