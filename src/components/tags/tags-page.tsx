import { Tag } from "lucide-react";
import { ArticleCollectionPage } from "#/components/articles/article-collection-page";
import { PageSearchField } from "#/components/layout/page-search-field";
import { TagHeadingActions } from "#/components/tags/tag-heading-actions";
import { TagsListView } from "#/components/tags/tags-list-view";
import { TagsToolbarActions } from "#/components/tags/tags-toolbar-actions";
import { useTagsPage } from "#/components/tags/use-tags-page";
import { useIsMobile } from "#/hooks/use-mobile";

export function TagsPage() {
	const {
		selectedTagId,
		q,
		sort,
		page,
		filter,
		selected,
		selectedIds,
		tagList,
		filteredTags,
		activeTag,
		articles,
		total,
		totalPages,
		setFilter,
		handleCreateTag,
		handleRename,
		handleDeleteTag,
		handleToggleRead,
		handleToggleFavorite,
		handleBulkToggleRead,
		handleAdd,
		handleOpenArticle,
		handleSelect,
		handleDelete,
		handleAddTag,
		handleRemoveTag,
		handleCreateTagFromPicker,
		navigateToTag,
		goBackToTags,
		goToPage,
		clearSelection,
		updateQuery,
		updateSort,
	} = useTagsPage();
	const isMobile = useIsMobile();
	const selectedTagTitle = activeTag?.name ?? "Tag";
	const selectedTagActions = activeTag ? (
		<TagHeadingActions
			tagName={activeTag.name}
			showBack={isMobile}
			onBack={goBackToTags}
			onRename={(name) => handleRename(activeTag.id, name)}
			onDelete={() => handleDeleteTag(activeTag.id)}
		/>
	) : null;

	return (
		<>
			{isMobile ? <TagsToolbarActions onCreate={handleCreateTag} /> : null}
			{isMobile ? (
				<div className="w-full space-y-4">
					{!selectedTagId ? (
						<>
							<h1 className="display-title text-2xl font-bold">Tags</h1>
							<PageSearchField
								value={filter}
								placeholder="Search tags..."
								ariaLabel="Search tags"
								onSearch={setFilter}
							/>
							<TagsListView
								filteredTags={filteredTags}
								filter={filter}
								activeTagId={selectedTagId}
								mobile
								onSelectTag={navigateToTag}
								onRename={handleRename}
								onDelete={handleDeleteTag}
							/>
						</>
					) : (
						<ArticleCollectionPage
							articles={articles}
							total={total}
							page={page}
							totalPages={totalPages}
							selected={selected}
							selectedIds={selectedIds}
							tagList={tagList}
							title={selectedTagTitle}
							icon={Tag}
							headingActions={selectedTagActions}
							searchPlaceholder="Search tagged articles..."
							emptyStateMessage="No articles with this tag."
							emptyStateHint="Add this tag to an article to see it here."
							q={q}
							sort={sort}
							handleSelect={handleSelect}
							handleOpenArticle={handleOpenArticle}
							handleToggleRead={handleToggleRead}
							handleToggleFavorite={handleToggleFavorite}
							handleAdd={handleAdd}
							handleDelete={handleDelete}
							handleBulkToggleRead={handleBulkToggleRead}
							handleAddTag={handleAddTag}
							handleRemoveTag={handleRemoveTag}
							handleCreateTag={handleCreateTagFromPicker}
							updateQuery={updateQuery}
							updateSort={updateSort}
							goToPage={goToPage}
							clearSelection={clearSelection}
						/>
					)}
				</div>
			) : (
				<div className="w-full">
					{selectedTagId && activeTag ? (
						<ArticleCollectionPage
							articles={articles}
							total={total}
							page={page}
							totalPages={totalPages}
							selected={selected}
							selectedIds={selectedIds}
							tagList={tagList}
							title={selectedTagTitle}
							icon={Tag}
							headingActions={selectedTagActions}
							searchPlaceholder="Search tagged articles..."
							emptyStateMessage="No articles with this tag."
							emptyStateHint="Add this tag to an article to see it here."
							q={q}
							sort={sort}
							handleSelect={handleSelect}
							handleOpenArticle={handleOpenArticle}
							handleToggleRead={handleToggleRead}
							handleToggleFavorite={handleToggleFavorite}
							handleAdd={handleAdd}
							handleDelete={handleDelete}
							handleBulkToggleRead={handleBulkToggleRead}
							handleAddTag={handleAddTag}
							handleRemoveTag={handleRemoveTag}
							handleCreateTag={handleCreateTagFromPicker}
							updateQuery={updateQuery}
							updateSort={updateSort}
							goToPage={goToPage}
							clearSelection={clearSelection}
						/>
					) : (
						<div className="flex flex-col items-center justify-center py-20 text-center">
							<Tag className="mb-3 h-10 w-10 text-muted-foreground/40" />
							<p className="text-lg text-muted-foreground">
								Select a tag from the sidebar
							</p>
						</div>
					)}
				</div>
			)}
		</>
	);
}
