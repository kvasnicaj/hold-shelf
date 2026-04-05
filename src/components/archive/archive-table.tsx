import {
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import type * as React from "react";
import { ArchiveTableMobile } from "#/components/archive/archive-table-mobile";
import { createArchiveColumns } from "#/components/archive/helpers";
import type { ArticleWithTags } from "#/components/articles/types";
import type { Tag } from "#/components/tags/types";
import { useIsMobile } from "#/hooks/use-mobile";

type ArchiveTableProps = {
	articles: ArticleWithTags[];
	rowSelection: Record<string, boolean>;
	onRowSelectionChange: React.Dispatch<
		React.SetStateAction<Record<string, boolean>>
	>;
	availableTags: Tag[];
	onAddTag: (tagId: string, articleIds: string[]) => Promise<void>;
	onRemoveTag: (tagId: string, articleIds: string[]) => Promise<void>;
	onCreateTag: (name: string) => Promise<Tag>;
	onToggleRead: (id: string, isRead: boolean) => Promise<void>;
	onDelete: (ids: string[]) => Promise<void>;
};

export function ArchiveTable({
	articles,
	rowSelection,
	onRowSelectionChange,
	availableTags,
	onAddTag,
	onRemoveTag,
	onCreateTag,
	onToggleRead,
	onDelete,
}: ArchiveTableProps) {
	const isMobile = useIsMobile();
	const table = useReactTable({
		data: articles,
		columns: createArchiveColumns({
			availableTags,
			onAddTag,
			onRemoveTag,
			onCreateTag,
			onToggleRead,
			onDelete,
		}),
		state: { rowSelection },
		onRowSelectionChange,
		getCoreRowModel: getCoreRowModel(),
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
				onToggleRead={onToggleRead}
				onDelete={onDelete}
			/>
		);
	}

	return (
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
												header.getSize() !== 150 ? header.getSize() : undefined,
										}}
									>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</th>
								) : (
									<th
										key={header.id}
										className="px-3 py-2 text-xs font-medium text-muted-foreground"
										style={{
											width:
												header.getSize() !== 150 ? header.getSize() : undefined,
										}}
									>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
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
							className="group/row border-b transition-colors last:border-b-0 hover:bg-accent/50"
						>
							{row.getVisibleCells().map((cell) =>
								cell.column.id === "createdAt" ? (
									<td
										key={cell.id}
										className="hidden overflow-hidden px-2 py-2 md:table-cell"
									>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</td>
								) : (
									<td key={cell.id} className="overflow-hidden px-3 py-2">
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</td>
								),
							)}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
