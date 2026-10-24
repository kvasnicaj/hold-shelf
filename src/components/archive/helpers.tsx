import {
	columnSizingFeature,
	columnVisibilityFeature,
	createColumnHelper,
	type RowSelectionState,
	rowSelectionFeature,
	Subscribe,
	tableFeatures,
} from "@tanstack/react-table";
import { ExternalLink, Star } from "lucide-react";
import { ArchiveActionsCell } from "#/components/archive/archive-actions-cell";
import type { ArchiveActions } from "#/components/archive/types";
import { ArticleExternalLink } from "#/components/articles/article-external-link";
import type { ArticleWithTags } from "#/components/articles/types";
import { Badge } from "#/components/ui/badge";
import { Checkbox } from "#/components/ui/checkbox";
import { formatDate } from "#/lib/formatters";

export const archiveTableFeatures = tableFeatures({
	columnSizingFeature,
	columnVisibilityFeature,
	rowSelectionFeature,
});

const columnHelper = createColumnHelper<
	typeof archiveTableFeatures,
	ArticleWithTags
>();

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
						/>
					)}
				</Subscribe>
			),
			size: 32,
		}),
		columnHelper.display({
			id: "status",
			header: () => null,
			cell: ({ row }) => (
				<div className="flex items-center justify-center">
					<span
						className={`h-2 w-2 rounded-full ${row.original.isRead ? "bg-muted-foreground/30" : "bg-primary"}`}
						title={row.original.isRead ? "Read" : "Unread"}
					/>
				</div>
			),
			size: 24,
		}),
		columnHelper.accessor("title", {
			header: "Title",
			size: 520,
			cell: ({ row }) => {
				const article = row.original;
				return (
					<div className="min-w-0">
						<div className="flex items-center gap-1.5">
							{article.faviconUrl && (
								<img
									src={article.faviconUrl}
									alt=""
									className="h-4 w-4 shrink-0"
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
								className="truncate text-sm font-medium no-underline hover:underline"
							>
								{article.title ?? article.url}
							</ArticleExternalLink>
							{article.isFavorite && (
								<Star className="h-3.5 w-3.5 shrink-0 fill-current text-amber-500" />
							)}
							<ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 group-hover/row:opacity-100" />
						</div>
						{article.hostname && (
							<p className="mt-0.5 truncate text-xs text-muted-foreground">
								{article.hostname}
							</p>
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
							className="max-w-24 shrink-0 truncate px-1.5 py-0 text-[10px]"
						>
							{tag.name}
						</Badge>
					))}
				</div>
			),
			size: 240,
		}),
		columnHelper.accessor("createdAt", {
			header: "Saved",
			cell: (info) => (
				<span className="whitespace-nowrap text-xs text-muted-foreground">
					{formatDate(info.getValue())}
				</span>
			),
			size: 62,
		}),
		columnHelper.display({
			id: "actions",
			header: () => null,
			cell: ArchiveActionsCell,
			size: 72,
		}),
	]);
}
