import {
	columnVisibilityFeature,
	createColumnHelper,
	type RowSelectionState,
	rowSelectionFeature,
	Subscribe,
	tableFeatures,
} from "@tanstack/react-table";
import { ArchiveActionsCell } from "#/components/archive/archive-actions-cell";
import type { ArchiveActions } from "#/components/archive/types";
import { ArticleExternalLink } from "#/components/articles/article-external-link";
import { ArticleStateMarks } from "#/components/articles/article-state-marks";
import type { ArticleWithTags, MonthGroup } from "#/components/articles/types";
import { TagLabel } from "#/components/tags/tag-label";
import { Checkbox } from "#/components/ui/checkbox";
import { formatDate, formatMonthYear } from "#/lib/formatters";
import { cn } from "#/lib/utils";

export const archiveTableFeatures = tableFeatures({
	columnVisibilityFeature,
	rowSelectionFeature,
});

const columnHelper = createColumnHelper<
	typeof archiveTableFeatures,
	ArticleWithTags
>();

// Checkboxes stay out of the way until the row is hovered or a selection exists.
// Touch screens cannot hover, so they always show them.
const revealCheckboxClassName =
	"opacity-0 transition-opacity focus-visible:opacity-100 data-[state=checked]:opacity-100 group-data-[selecting=true]/table:opacity-100 pointer-coarse:opacity-100";

/**
 * Column widths and visibility follow the Library's own width (the
 * `@container/library` around the table), not the viewport, so the table
 * also fits beside the wide reader. The title takes whatever is left; tags,
 * then the date, step aside as the column narrows.
 */
const ARCHIVE_COLUMN_CLASSES: Record<string, string> = {
	select: "w-8",
	status: "w-7",
	title: "",
	// Collapsed columns keep their cells (zero width, invisible) so month
	// headings that span every column never create a phantom column.
	tags: "invisible w-0 px-0 @2xl/library:visible @2xl/library:w-36 @2xl/library:px-2 @4xl/library:w-48",
	createdAt:
		"invisible w-0 px-0 text-right @md/library:visible @md/library:w-[4.5rem] @md/library:px-2",
	actions: "w-16 pointer-coarse:w-[5.5rem]",
};

export function getArchiveColumnClassName(columnId: string) {
	return ARCHIVE_COLUMN_CLASSES[columnId] ?? "";
}

export function toArchiveRowSelection(
	selection: Record<string, boolean>,
): RowSelectionState {
	const selected: RowSelectionState = {};
	for (const [id, isSelected] of Object.entries(selection)) {
		if (isSelected) selected[id] = true;
	}
	return selected;
}

export function createArchiveColumns({
	onOpenArticle,
}: Pick<ArchiveActions, "onOpenArticle">) {
	return columnHelper.columns([
		columnHelper.display({
			id: "select",
			header: ({ table }) => (
				<Subscribe
					source={table.store}
					selector={() => table.getIsAllRowsSelected()}
				>
					{(allSelected) => (
						<Checkbox
							aria-label="Select all articles on this page"
							checked={allSelected}
							onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
							onClick={(event) => event.stopPropagation()}
							className={cn(
								revealCheckboxClassName,
								"group-hover/table:opacity-100",
							)}
						/>
					)}
				</Subscribe>
			),
			cell: ({ row, table }) => (
				<Subscribe
					source={table.atoms.rowSelection}
					selector={(selection) => !!selection[row.id]}
				>
					{(selected) => (
						<Checkbox
							aria-label={`Select ${row.original.title ?? row.original.url}`}
							checked={selected}
							onCheckedChange={(value) => row.toggleSelected(!!value)}
							onClick={(event) => event.stopPropagation()}
							className={cn(
								revealCheckboxClassName,
								"group-hover/row:opacity-100",
							)}
						/>
					)}
				</Subscribe>
			),
		}),
		columnHelper.display({
			id: "status",
			header: () => <span className="sr-only">Reading state</span>,
			cell: ({ row }) => (
				<ArticleStateMarks
					isRead={row.original.isRead}
					isFavorite={row.original.isFavorite}
				/>
			),
		}),
		columnHelper.accessor("title", {
			header: "Title",
			cell: ({ row }) => {
				const article = row.original;
				return (
					<div className="flex min-w-0 items-center gap-2">
						{article.faviconUrl && (
							<img
								src={article.faviconUrl}
								alt=""
								className="size-4 shrink-0 rounded-[3px]"
								onError={(event) => {
									event.currentTarget.style.display = "none";
								}}
							/>
						)}
						<ArticleExternalLink
							articleId={article.id}
							href={article.url}
							isRead={article.isRead}
							onOpenArticle={onOpenArticle}
							className={cn(
								"min-w-0 truncate text-sm no-underline hover:underline",
								article.isRead
									? "font-normal text-muted-foreground"
									: "font-semibold text-foreground",
							)}
						>
							{article.title ?? article.url}
						</ArticleExternalLink>
						{article.hostname && (
							<span className="min-w-10 shrink-[1000] truncate text-meta text-muted-foreground">
								{article.hostname}
							</span>
						)}
					</div>
				);
			},
		}),
		columnHelper.accessor("tags", {
			header: "Tags",
			cell: ({ row }) => (
				<div className="flex min-w-0 items-center gap-1 overflow-hidden">
					{row.original.tags.map((tag) => (
						<TagLabel
							key={tag.id}
							name={tag.name}
							className="max-w-24 shrink-0 truncate"
						/>
					))}
				</div>
			),
		}),
		columnHelper.accessor("createdAt", {
			header: "Saved",
			cell: (info) => (
				<span className="block whitespace-nowrap text-right text-meta tabular-nums text-muted-foreground">
					{formatDate(info.getValue())}
				</span>
			),
		}),
		columnHelper.display({
			id: "actions",
			header: () => <span className="sr-only">Actions</span>,
			cell: ArchiveActionsCell,
		}),
	]);
}

/** Groups consecutive items by their UTC save month; expects date-sorted input. */
export function groupByMonth<T>(
	items: T[],
	getDate: (item: T) => Date | null,
): MonthGroup<T>[] {
	const groups: MonthGroup<T>[] = [];
	for (const item of items) {
		const date = getDate(item);
		const key = date
			? `${date.getUTCFullYear()}-${date.getUTCMonth()}`
			: "undated";
		let group = groups.at(-1);
		if (group?.key !== key) {
			group = {
				key,
				label: date ? formatMonthYear(date) : "Undated",
				items: [],
			};
			groups.push(group);
		}
		group.items.push(item);
	}
	return groups;
}
