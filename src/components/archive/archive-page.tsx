import { ArchiveFilters } from "#/components/archive/archive-filters";
import { ArchiveTable } from "#/components/archive/archive-table";
import { useArchivePage } from "#/components/archive/use-archive-page";
import { BulkActionsPanel } from "#/components/articles/bulk-actions-panel";
import { AppPagination } from "#/components/pagination/app-pagination";

export function ArchivePage() {
	const {
		q,
		filter,
		sort,
		selectedTagIds,
		page,
		articles,
		total,
		totalPages,
		tagList,
		rowSelection,
		selectedIds,
		setRowSelection,
		handleOpenArticle,
		handleToggleRead,
		handleToggleFavorite,
		handleDelete,
		handleBulkToggleRead,
		handleAddTag,
		handleRemoveTag,
		handleCreateTag,
		updateQuery,
		updateTags,
		updateFilter,
		updateSort,
		goToPage,
		clearSelection,
	} = useArchivePage();

	return (
		<div className="w-full space-y-4">
			<div className="flex items-baseline gap-3">
				<h1 className="font-serif text-[1.75rem] leading-tight font-semibold">
					Library
				</h1>
				<p className="text-sm tabular-nums text-muted-foreground">
					{total} article{total !== 1 ? "s" : ""}
				</p>
			</div>

			{selectedIds.length > 0 && (
				<BulkActionsPanel
					count={selectedIds.length}
					onMarkRead={() => handleBulkToggleRead(selectedIds, true)}
					onMarkUnread={() => handleBulkToggleRead(selectedIds, false)}
					onDelete={() => handleDelete(selectedIds)}
					onClear={clearSelection}
				/>
			)}

			<ArchiveFilters
				selectedTagIds={selectedTagIds}
				q={q}
				filter={filter}
				sort={sort}
				tagList={tagList}
				onSearch={updateQuery}
				onTagsChange={updateTags}
				onFilterChange={updateFilter}
				onSortChange={updateSort}
			/>

			{articles.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-20 text-center">
					<p className="text-lg text-muted-foreground">
						{q || selectedTagIds.length > 0
							? "No articles match your filters."
							: "No articles yet."}
					</p>
				</div>
			) : (
				<>
					<ArchiveTable
						articles={articles}
						rowSelection={rowSelection}
						onRowSelectionChange={setRowSelection}
						groupedByMonth={sort !== "title"}
						availableTags={tagList}
						onAddTag={handleAddTag}
						onRemoveTag={handleRemoveTag}
						onCreateTag={handleCreateTag}
						onOpenArticle={handleOpenArticle}
						onToggleRead={handleToggleRead}
						onToggleFavorite={handleToggleFavorite}
						onDelete={handleDelete}
					/>

					<AppPagination
						page={page}
						totalPages={totalPages}
						onPageChange={goToPage}
					/>
				</>
			)}
		</div>
	);
}
