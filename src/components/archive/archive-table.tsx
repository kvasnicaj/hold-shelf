import { useTable } from "@tanstack/react-table";
import { type Dispatch, type SetStateAction, useMemo } from "react";
import { ArchiveActionsContext } from "#/components/archive/archive-actions-context";
import { ArchiveTableMobile } from "#/components/archive/archive-table-mobile";
import {
	archiveTableFeatures,
	createArchiveColumns,
	groupByMonth,
	toArchiveRowSelection,
} from "#/components/archive/helpers";
import { MonthGroupLabel } from "#/components/archive/month-group-label";
import type { ArchiveActions } from "#/components/archive/types";
import type { ArticleWithTags } from "#/components/articles/types";
import { useIsMobile } from "#/hooks/use-mobile";
import { cn } from "#/lib/utils";

type ArchiveTableProps = ArchiveActions & {
	articles: ArticleWithTags[];
	rowSelection: Record<string, boolean>;
	onRowSelectionChange: Dispatch<SetStateAction<Record<string, boolean>>>;
	/** Group rows under month headings; only meaningful for date sorts. */
	groupedByMonth?: boolean;
};

export function ArchiveTable({
	articles,
	rowSelection,
	onRowSelectionChange,
	groupedByMonth = false,
	availableTags,
	onAddTag,
	onRemoveTag,
	onCreateTag,
	onOpenArticle,
	onToggleRead,
	onToggleFavorite,
	onDelete,
}: ArchiveTableProps) {
	const isMobile = useIsMobile();
	const columns = useMemo(
		() => createArchiveColumns({ onOpenArticle }),
		[onOpenArticle],
	);
	const selectedRows = useMemo(
		() => toArchiveRowSelection(rowSelection),
		[rowSelection],
	);
	const table = useTable({
		features: archiveTableFeatures,
		data: articles,
		columns,
		state: { rowSelection: selectedRows },
		onRowSelectionChange: (updater) =>
			onRowSelectionChange((previous) =>
				typeof updater === "function"
					? updater(toArchiveRowSelection(previous))
					: updater,
			),
		getRowId: (row) => row.id,
	});

	if (isMobile) {
		return (
			<ArchiveTableMobile
				articles={articles}
				rowSelection={rowSelection}
				onRowSelectionChange={onRowSelectionChange}
				groupedByMonth={groupedByMonth}
				availableTags={availableTags}
				onAddTag={onAddTag}
				onRemoveTag={onRemoveTag}
				onCreateTag={onCreateTag}
				onOpenArticle={onOpenArticle}
				onToggleRead={onToggleRead}
				onToggleFavorite={onToggleFavorite}
				onDelete={onDelete}
			/>
		);
	}

	const rows = table.getRowModel().rows;
	const groups = groupedByMonth
		? groupByMonth(rows, (row) => row.original.createdAt)
		: [{ key: "all", label: "", items: rows }];
	const headers = table.getHeaderGroups()[0]?.headers ?? [];
	const hasSelection = Object.keys(selectedRows).length > 0;

	function columnWidth(size: number) {
		return size !== 150 ? size : undefined;
	}

	return (
		<ArchiveActionsContext
			value={{
				availableTags,
				onAddTag,
				onRemoveTag,
				onCreateTag,
				onOpenArticle,
				onToggleRead,
				onToggleFavorite,
				onDelete,
			}}
		>
			<table
				className="group/table w-full table-fixed border-t"
				data-selecting={hasSelection}
			>
				<thead>
					<tr className="h-8 text-left">
						{headers.map((header) => (
							<th
								key={header.id}
								className={cn(
									"px-2 text-xs font-semibold text-muted-foreground",
									header.id === "createdAt" && "text-right",
								)}
								style={{ width: columnWidth(header.getSize()) }}
							>
								{header.isPlaceholder ? null : (
									<table.FlexRender header={header} />
								)}
							</th>
						))}
					</tr>
				</thead>
				{groups.map((group) => (
					<tbody key={group.key}>
						{groupedByMonth && (
							<tr>
								<th
									colSpan={headers.length}
									scope="colgroup"
									className="border-t px-2 pt-5 pb-1.5 text-left font-normal"
								>
									<MonthGroupLabel
										label={group.label}
										count={group.items.length}
									/>
								</th>
							</tr>
						)}
						{group.items.map((row) => (
							<tr
								key={row.id}
								data-state={selectedRows[row.id] ? "selected" : undefined}
								className="group/row h-11 cursor-pointer border-t transition-colors hover:bg-background data-[state=selected]:bg-select"
								onClick={() =>
									void onOpenArticle(row.original.id, row.original.isRead)
								}
							>
								{row.getVisibleCells().map((cell) => (
									<td key={cell.id} className="overflow-hidden px-2">
										<table.FlexRender cell={cell} />
									</td>
								))}
							</tr>
						))}
					</tbody>
				))}
			</table>
		</ArchiveActionsContext>
	);
}
