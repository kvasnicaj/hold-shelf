import { Link } from "@tanstack/react-router";
import { TagChip } from "#/components/tags/tag-chip";
import type { Tag } from "#/components/tags/types";

type ArchiveTagChipsProps = {
	tags: Tag[];
	selectedTagIds: string[];
	onChange: (tagIds: string[]) => void;
};

/** Phone tag filter: chips scroll sideways; Manage tags stays fixed at the end. */
export function ArchiveTagChips({
	tags,
	selectedTagIds,
	onChange,
}: ArchiveTagChipsProps) {
	return (
		<nav
			aria-label="Filter by tag"
			className="-mx-3 flex items-center sm:-mx-6 md:hidden"
		>
			<div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto py-1 pr-6 pl-3 [mask-image:linear-gradient(to_right,black_calc(100%-1.5rem),transparent)] [scrollbar-width:none] sm:pl-6">
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
			</div>
			<Link
				to="/app/tags"
				className="inline-flex h-10 shrink-0 items-center border-l pr-3 pl-3 text-sm font-semibold text-primary no-underline sm:pr-6"
			>
				Manage tags
			</Link>
		</nav>
	);
}
