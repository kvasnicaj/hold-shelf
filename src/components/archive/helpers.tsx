import {
	columnSizingFeature,
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
import { Badge } from "#/components/ui/badge";
import { Checkbox } from "#/components/ui/checkbox";
import { formatDate, formatMonthYear } from "#/lib/formatters";
import { cn } from "#/lib/utils";

export const archiveTableFeatures = tableFeatures({
	columnSizingFeature,
	columnVisibilityFeature,
	rowSelectionFeature,
});

const columnHelper = createColumnHelper<
	typeof archiveTableFeatures,
	ArticleWithTags
>();

// Checkboxes stay out of the way until the row is hovered or a selection exists.
const revealCheckboxClassName =
	"opacity-0 transition-opacity focus-visible:opacity-100 data-[state=checked]:opacity-100 group-data-[selecting=true]/table:opacity-100";

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
			size: 30,
		}),
		columnHelper.display({
			id: "status",
			header: () => null,
			cell: ({ row }) => (
				<ArticleStateMarks
					isRead={row.original.isRead}
					isFavorite={row.original.isFavorite}
				/>
			),
			size: 28,
		}),
		columnHelper.accessor("title", {
			header: "Title",
			size: 520,
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
									? "text-muted-foreground"
									: "font-medium text-foreground",
							)}
						>
							{article.title ?? article.url}
						</ArticleExternalLink>
						{article.hostname && (
							<span className="min-w-10 shrink-[1000] truncate text-xs text-muted-foreground">
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
						<Badge
							key={tag.id}
							variant="secondary"
							className="max-w-24 shrink-0 truncate px-1.5 py-0 text-[11px] font-semibold"
						>
							{tag.name}
						</Badge>
					))}
				</div>
			),
			size: 200,
		}),
		columnHelper.accessor("createdAt", {
			header: "Saved",
			cell: (info) => (
				<span className="block whitespace-nowrap text-right text-xs tabular-nums text-muted-foreground">
					{formatDate(info.getValue())}
				</span>
			),
			size: 64,
		}),
		columnHelper.display({
			id: "actions",
			header: () => null,
			cell: ArchiveActionsCell,
			size: 72,
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
