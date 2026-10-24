import { useTable } from "@tanstack/react-table";
import { type Dispatch, type SetStateAction, useMemo } from "react";
import { ArchiveActionsContext } from "#/components/archive/archive-actions-context";
import { ArchiveTableMobile } from "#/components/archive/archive-table-mobile";
import {
	archiveTableFeatures,
	createArchiveColumns,
	toArchiveRowSelection,
} from "#/components/archive/helpers";
import type { ArchiveActions } from "#/components/archive/types";
import type { ArticleWithTags } from "#/components/articles/types";
import { useIsMobile } from "#/hooks/use-mobile";

type ArchiveTableProps = ArchiveActions & {
	articles: ArticleWithTags[];
	rowSelection: Record<string, boolean>;
	onRowSelectionChange: Dispatch<SetStateAction<Record<string, boolean>>>;
};

export function ArchiveTable({
	articles,
	rowSelection,
	onRowSelectionChange,
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
			<div className="overflow-hidden rounded-xl border bg-card shadow-sm">
				<table className="w-full table-fixed">
					<thead>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id} className="border-b text-left">
								{headerGroup.headers.map((header) =>
									header.id === "createdAt" ? (
										<th
											key={header.id}
											className="hidden px-2 py-2 text-xs font-medium text-muted-foreground md:table-cell"
											style={{
												width:
													header.getSize() !== 150
														? header.getSize()
														: undefined,
											}}
										>
											{header.isPlaceholder ? null : (
												<table.FlexRender header={header} />
											)}
										</th>
									) : (
										<th
											key={header.id}
											className="px-2 py-2 text-xs font-medium text-muted-foreground"
											style={{
												width:
													header.getSize() !== 150
														? header.getSize()
														: undefined,
											}}
										>
											{header.isPlaceholder ? null : (
												<table.FlexRender header={header} />
											)}
										</th>
									),
								)}
							</tr>
						))}
					</thead>
					<tbody>
						{table.getRowModel().rows.map((row) => (
							<tr
								key={row.id}
								className="group/row cursor-pointer border-b transition-colors last:border-b-0 hover:bg-accent/50"
								onClick={() =>
									void onOpenArticle(row.original.id, row.original.isRead)
								}
							>
								{row.getVisibleCells().map((cell) =>
									cell.column.id === "createdAt" ? (
										<td
											key={cell.id}
											className="hidden overflow-hidden px-2 py-2 md:table-cell"
										>
											<table.FlexRender cell={cell} />
										</td>
									) : (
										<td key={cell.id} className="overflow-hidden px-2 py-2">
											<table.FlexRender cell={cell} />
										</td>
									),
								)}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</ArchiveActionsContext>
	);
}
