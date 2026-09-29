import { ArchiveTagsCombobox } from "#/components/archive/archive-tags-combobox";
import { ArticleSortSelect } from "#/components/articles/article-sort-select";
import type { ArticleSort } from "#/components/articles/types";
import { PageSearchField } from "#/components/layout/page-search-field";
import type { Tag } from "#/components/tags/types";
import { ToggleGroup, ToggleGroupItem } from "#/components/ui/toggle-group";

type ArchiveFiltersProps = {
	selectedTagIds: string[];
	q?: string;
	filter?: "all" | "read" | "unread";
	sort?: ArticleSort;
	tagList: Tag[];
	onSearch: (query: string) => void;
	onTagsChange: (tagIds: string[]) => void;
	onFilterChange: (filter?: "all" | "read" | "unread") => void;
	onSortChange: (sort: ArticleSort) => void;
};

export function ArchiveFilters({
	selectedTagIds,
	q,
	filter,
	sort,
	tagList,
	onSearch,
	onTagsChange,
	onFilterChange,
	onSortChange,
}: ArchiveFiltersProps) {
	return (
		<div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
			<ToggleGroup
				type="single"
				value={filter ?? "all"}
				className="grid w-full grid-cols-3 lg:inline-flex lg:w-auto"
				onValueChange={(value) => {
					if (!value) return;
					onFilterChange(
						value === "all" ? undefined : (value as "read" | "unread"),
					);
				}}
				aria-label="Read status filter"
			>
				<ToggleGroupItem
					value="all"
					aria-label="Show all articles"
					className="min-w-0"
				>
					All
				</ToggleGroupItem>
				<ToggleGroupItem
					value="unread"
					aria-label="Show unread articles"
					className="min-w-0"
				>
					Unread
				</ToggleGroupItem>
				<ToggleGroupItem
					value="read"
					aria-label="Show read articles"
					className="min-w-0"
				>
					Read
				</ToggleGroupItem>
			</ToggleGroup>

			<div className="flex w-full flex-wrap gap-2 lg:w-auto lg:justify-end">
				<PageSearchField
					value={q ?? ""}
					placeholder="Search library..."
					ariaLabel="Search library"
					onSearch={onSearch}
					className="w-full md:w-64"
				/>
				<ArchiveTagsCombobox
					tags={tagList}
					selectedTagIds={selectedTagIds}
					onChange={onTagsChange}
				/>
				<ArticleSortSelect
					value={sort}
					onChange={onSortChange}
					ariaLabel="Sort library articles"
					className="w-full md:w-40"
				/>
			</div>
		</div>
	);
}
