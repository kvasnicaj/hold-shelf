import { ArchiveFilters } from "#/components/archive/archive-filters";
import { ArchiveTable } from "#/components/archive/archive-table";
import { ArchiveToolbarActions } from "#/components/archive/archive-toolbar-actions";
import { useArchivePage } from "#/components/archive/use-archive-page";
import { BulkActionsPanel } from "#/components/articles/bulk-actions-panel";
import { AppPagination } from "#/components/pagination/app-pagination";

export function ArchivePage() {
	const {
		q,
		filter,
		sort,
		tag,
		page,
		articles,
		total,
		totalPages,
		tagList,
		activeTag,
		rowSelection,
		selectedIds,
		setRowSelection,
		handleAdd,
		handleOpenArticle,
		handleToggleRead,
		handleToggleFavorite,
		handleDelete,
		handleBulkToggleRead,
		handleAddTag,
		handleRemoveTag,
		handleCreateTag,
		updateQuery,
		clearTag,
		updateTag,
		updateFilter,
		updateSort,
		goToPage,
		clearSelection,
	} = useArchivePage();

	return (
		<div className="mx-auto max-w-5xl space-y-4">
			<ArchiveToolbarActions
				onAdd={handleAdd}
				searchValue={q ?? ""}
				onSearch={updateQuery}
			/>
			<h1 className="display-title text-2xl font-bold">Archive</h1>

			<ArchiveFilters
				activeTag={activeTag ?? null}
				tag={tag}
				filter={filter}
				sort={sort}
				tagList={tagList}
				onClearTag={clearTag}
				onTagChange={updateTag}
				onFilterChange={updateFilter}
				onSortChange={updateSort}
			/>

			<p className="text-sm text-muted-foreground">
				{total} article{total !== 1 ? "s" : ""}
			</p>

			{selectedIds.length > 0 && (
				<BulkActionsPanel
					count={selectedIds.length}
					onMarkRead={() => handleBulkToggleRead(selectedIds, true)}
					onMarkUnread={() => handleBulkToggleRead(selectedIds, false)}
					onDelete={() => handleDelete(selectedIds)}
					onClear={clearSelection}
				/>
			)}

			{articles.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-20 text-center">
					<p className="text-lg text-muted-foreground">
						{q || tag ? "No articles match your filters." : "No articles yet."}
					</p>
				</div>
			) : (
				<>
					<ArchiveTable
						articles={articles}
						rowSelection={rowSelection}
						onRowSelectionChange={setRowSelection}
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
