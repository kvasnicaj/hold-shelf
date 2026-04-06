import { ArticleList } from "#/components/articles/article-list";
import { ArticlesHeader } from "#/components/articles/articles-header";
import { ArticlesToolbarActions } from "#/components/articles/articles-toolbar-actions";
import { BulkActionsPanel } from "#/components/articles/bulk-actions-panel";
import { useArticlesPage } from "#/components/articles/use-articles-page";
import { AppPagination } from "#/components/pagination/app-pagination";

export function ArticlesPage() {
	const {
		q,
		sort,
		page,
		articles,
		total,
		totalPages,
		tagList,
		selected,
		selectedIds,
		handleSelect,
		handleAdd,
		handleToggleRead,
		handleDelete,
		handleBulkToggleRead,
		handleAddTag,
		handleRemoveTag,
		handleCreateTag,
		updateQuery,
		updateSort,
		goToPage,
		clearSelection,
	} = useArticlesPage();

	return (
		<div className="mx-auto max-w-5xl space-y-4">
			<ArticlesToolbarActions
				onAdd={handleAdd}
				searchValue={q ?? ""}
				onSearch={updateQuery}
			/>

			{selected.size > 0 && (
				<BulkActionsPanel
					count={selected.size}
					onMarkRead={() => handleBulkToggleRead(selectedIds, true)}
					onMarkUnread={() => handleBulkToggleRead(selectedIds, false)}
					onDelete={() => handleDelete(selectedIds)}
					onClear={clearSelection}
				/>
			)}

			<ArticlesHeader
				total={total}
				q={q}
				sort={sort}
				onSortChange={updateSort}
			/>

			{articles.length > 0 && (
				<>
					<ArticleList
						articles={articles}
						selected={selected}
						onSelect={handleSelect}
						onToggleRead={handleToggleRead}
						onDelete={handleDelete}
						availableTags={tagList}
						onAddTag={handleAddTag}
						onRemoveTag={handleRemoveTag}
						onCreateTag={handleCreateTag}
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
