import { Link } from "@tanstack/react-router";
import { getTagChipClassName } from "#/components/archive/helpers";
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
			<button
				type="button"
				aria-pressed={selectedTagIds.length === 0}
				className={getTagChipClassName(selectedTagIds.length === 0)}
				onClick={() => onChange([])}
			>
				All tags
			</button>
			{tags.map((tag) => {
				const isActive = selectedTagIds.includes(tag.id);

				return (
					<button
						key={tag.id}
						type="button"
						aria-pressed={isActive}
						className={getTagChipClassName(isActive)}
						onClick={() =>
							onChange(
								isActive
									? selectedTagIds.filter((id) => id !== tag.id)
									: [...selectedTagIds, tag.id],
							)
						}
					>
						{tag.name}
						{tag.articleCount !== undefined && (
							<span className="font-medium tabular-nums opacity-70">
								{tag.articleCount}
							</span>
						)}
					</button>
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
