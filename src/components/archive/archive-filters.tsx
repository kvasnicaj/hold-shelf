import { ArchiveTagChips } from "#/components/archive/archive-tag-chips";
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
		<div className="@container/filters flex flex-col gap-3">
			<div className="flex flex-col gap-2 @2xl/filters:flex-row @2xl/filters:items-center @2xl/filters:justify-between">
				<ToggleGroup
					type="single"
					value={filter ?? "all"}
					className="grid w-full shrink-0 grid-cols-3 @2xl/filters:inline-flex @2xl/filters:w-auto"
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

				<div className="flex w-full min-w-0 gap-2 @2xl/filters:w-auto @2xl/filters:flex-1 @2xl/filters:justify-end">
					<PageSearchField
						debounceMs={250}
						value={q ?? ""}
						placeholder="Search library..."
						ariaLabel="Search library"
						onSearch={onSearch}
						className="min-w-0 flex-1 @2xl/filters:max-w-64"
					/>
					<div className="hidden md:block">
						<ArchiveTagsCombobox
							tags={tagList}
							selectedTagIds={selectedTagIds}
							onChange={onTagsChange}
						/>
					</div>
					<ArticleSortSelect
						value={sort}
						onChange={onSortChange}
						ariaLabel="Sort library articles"
						className="w-36 shrink-0"
					/>
				</div>
			</div>
			<ArchiveTagChips
				tags={tagList}
				selectedTagIds={selectedTagIds}
				onChange={onTagsChange}
			/>
		</div>
	);
}
