import { Tag } from "@phosphor-icons/react";
import { ArticleCollectionPage } from "#/components/articles/article-collection-page";
import { PageHeading } from "#/components/layout/page-heading";
import { PageSearchField } from "#/components/layout/page-search-field";
import { CreateTagDialog } from "#/components/tags/create-tag-dialog";
import { TagHeadingActions } from "#/components/tags/tag-heading-actions";
import { TagsListView } from "#/components/tags/tags-list-view";
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
		activeShare,
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
			key={`${activeTag.id}:${activeShare?.token ?? "private"}`}
			tagId={activeTag.id}
			tagName={activeTag.name}
			initialShare={activeShare}
			showBack={isMobile}
			onBack={goBackToTags}
			onRename={(name) => handleRename(activeTag.id, name)}
			onDelete={() => handleDeleteTag(activeTag.id)}
		/>
	) : null;
	const selectedTagArticles = selectedTagId ? (
		<ArticleCollectionPage
			articles={articles}
			total={total}
			page={page}
			totalPages={totalPages}
			selected={selected}
			selectedIds={selectedIds}
			tagList={tagList}
			title={selectedTagTitle}
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
	) : null;

	const tagsOverview = (
		<div className="w-full space-y-4">
			<PageHeading
				title="Tags"
				actions={<CreateTagDialog onCreate={handleCreateTag} />}
			/>
			{isMobile ? (
				<>
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
						onSelectTag={navigateToTag}
						onRename={handleRename}
						onDelete={handleDeleteTag}
					/>
				</>
			) : (
				<div className="flex flex-col items-center justify-center py-20 text-center">
					<Tag className="mb-3 size-10 text-faint-foreground" />
					<p className="text-muted-foreground">
						Choose a tag in the sidebar to see its articles.
					</p>
				</div>
			)}
		</div>
	);
	const showsTag = isMobile ? Boolean(selectedTagId) : Boolean(activeTag);

	return showsTag ? selectedTagArticles : tagsOverview;
}
