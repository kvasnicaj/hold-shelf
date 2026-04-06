import { ArticleList } from "#/components/articles/article-list";
import { ArticlesHeader } from "#/components/articles/articles-header";
import { ArticlesToolbarActions } from "#/components/articles/articles-toolbar-actions";
import { BulkActionsPanel } from "#/components/articles/bulk-actions-panel";
import type { ArticleWithTags } from "#/components/articles/types";
import { AppPagination } from "#/components/pagination/app-pagination";
import type { Tag } from "#/components/tags/types";

type ArticleCollectionPageProps = {
	title: string;
	searchPlaceholder: string;
	emptyStateMessage: string;
	emptyStateHint?: string;
	q?: string;
	sort?: "newest" | "oldest" | "title";
	page: number;
	articles: ArticleWithTags[];
	total: number;
	totalPages: number;
	tagList: Tag[];
	selected: Set<string>;
	selectedIds: string[];
	handleSelect: (id: string, selected: boolean) => void;
	handleAdd: (url: string) => Promise<void>;
	handleToggleRead: (id: string, isRead: boolean) => Promise<void>;
	handleToggleFavorite: (id: string, isFavorite: boolean) => Promise<void>;
	handleDelete: (ids: string[]) => Promise<void>;
	handleBulkToggleRead: (ids: string[], isRead: boolean) => Promise<void>;
	handleAddTag: (tagId: string, articleIds: string[]) => Promise<void>;
	handleRemoveTag: (tagId: string, articleIds: string[]) => Promise<void>;
	handleCreateTag: (name: string) => Promise<Tag>;
	updateQuery: (query: string) => void;
	updateSort: (sort: "newest" | "oldest" | "title") => void;
	goToPage: (page: number) => void;
	clearSelection: () => void;
};

export function ArticleCollectionPage({
	title,
	searchPlaceholder,
	emptyStateMessage,
	emptyStateHint,
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
	handleToggleFavorite,
	handleDelete,
	handleBulkToggleRead,
	handleAddTag,
	handleRemoveTag,
	handleCreateTag,
	updateQuery,
	updateSort,
	goToPage,
	clearSelection,
}: ArticleCollectionPageProps) {
	return (
		<div className="mx-auto max-w-5xl space-y-4">
			<ArticlesToolbarActions
				onAdd={handleAdd}
				searchValue={q ?? ""}
				onSearch={updateQuery}
				searchPlaceholder={searchPlaceholder}
			/>

			{selected.size > 0 && (
				<BulkActionsPanel
					count={selected.size}
					onMarkRead={() => void handleBulkToggleRead(selectedIds, true)}
					onMarkUnread={() => void handleBulkToggleRead(selectedIds, false)}
					onDelete={() => void handleDelete(selectedIds)}
					onClear={clearSelection}
				/>
			)}

			<ArticlesHeader
				title={title}
				total={total}
				sort={sort}
				onSortChange={updateSort}
				emptyStateMessage={emptyStateMessage}
				emptyStateHint={emptyStateHint}
			/>

			{articles.length > 0 && (
				<>
					<ArticleList
						articles={articles}
						selected={selected}
						onSelect={handleSelect}
						onToggleRead={handleToggleRead}
						onToggleFavorite={handleToggleFavorite}
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
