import { Tag } from "lucide-react";
import { TagArticlesView } from "#/components/tags/tag-articles-view";
import { TagsListView } from "#/components/tags/tags-list-view";
import { TagsToolbarActions } from "#/components/tags/tags-toolbar-actions";
import { useTagsPage } from "#/components/tags/use-tags-page";
import { useIsMobile } from "#/hooks/use-mobile";

export function TagsPage() {
	const {
		selectedTagId,
		page,
		filter,
		selected,
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
		handleSelect,
		handleDeleteArticles,
		handleAddTag,
		handleRemoveTag,
		handleCreateTagFromPicker,
		navigateToTag,
		goBackToTags,
		goToPage,
	} = useTagsPage();
	const isMobile = useIsMobile();

	return (
		<>
			<TagsToolbarActions
				showSearch={!selectedTagId || !isMobile}
				searchValue={filter}
				onCreate={handleCreateTag}
				onSearch={setFilter}
			/>
			{isMobile ? (
				<div className="mx-auto max-w-5xl space-y-4">
					<h1 className="display-title text-2xl font-bold">Tags</h1>
					{!selectedTagId ? (
						<TagsListView
							filteredTags={filteredTags}
							filter={filter}
							activeTagId={selectedTagId}
							mobile
							onSelectTag={navigateToTag}
							onRename={handleRename}
							onDelete={handleDeleteTag}
						/>
					) : (
						<TagArticlesView
							activeTagName={activeTag?.name}
							articles={articles}
							total={total}
							page={page}
							totalPages={totalPages}
							selected={selected}
							availableTags={tagList}
							onBack={goBackToTags}
							onSelect={handleSelect}
							onToggleRead={handleToggleRead}
							onToggleFavorite={handleToggleFavorite}
							onDeleteArticles={handleDeleteArticles}
							onAddTag={handleAddTag}
							onRemoveTag={handleRemoveTag}
							onCreateTag={handleCreateTagFromPicker}
							onPageChange={goToPage}
						/>
					)}
				</div>
			) : (
				<div
					className="-mx-4 -mb-4 flex lg:-mx-6 lg:-mb-6"
					style={{ minHeight: "calc(100vh - 5rem)" }}
				>
					<div className="w-56 shrink-0 overflow-y-auto border-r px-3 py-4">
						<TagsListView
							filteredTags={filteredTags}
							filter={filter}
							activeTagId={selectedTagId}
							onSelectTag={navigateToTag}
							onRename={handleRename}
							onDelete={handleDeleteTag}
							className="space-y-0.5"
							emptyStateClassName="px-2 py-4 text-center text-sm text-muted-foreground"
						/>
					</div>
					<div className="min-w-0 flex-1 p-4 lg:p-6">
						{selectedTagId ? (
							<TagArticlesView
								activeTagName={activeTag?.name}
								articles={articles}
								total={total}
								page={page}
								totalPages={totalPages}
								selected={selected}
								availableTags={tagList}
								onBack={goBackToTags}
								onSelect={handleSelect}
								onToggleRead={handleToggleRead}
								onToggleFavorite={handleToggleFavorite}
								onDeleteArticles={handleDeleteArticles}
								onAddTag={handleAddTag}
								onRemoveTag={handleRemoveTag}
								onCreateTag={handleCreateTagFromPicker}
								onPageChange={goToPage}
								showBackButton={false}
								variant="desktop"
							/>
						) : (
							<div className="flex flex-col items-center justify-center py-20 text-center">
								<Tag className="mb-3 h-10 w-10 text-muted-foreground/40" />
								<p className="text-lg text-muted-foreground">
									Select a tag to view its articles
								</p>
							</div>
						)}
					</div>
				</div>
			)}
		</>
	);
}
