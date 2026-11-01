import type { ReactNode } from "react";
import { ArticleSortSelect } from "#/components/articles/article-sort-select";
import type { ArticleSort } from "#/components/articles/types";
import { PageHeading } from "#/components/layout/page-heading";
import { PageSearchField } from "#/components/layout/page-search-field";
import { getArticleCountLabel } from "#/lib/formatters";

type ArticlesHeaderProps = {
	title: string;
	total: number;
	sort?: ArticleSort;
	onSortChange: (sort: ArticleSort) => void;
	searchValue: string;
	searchPlaceholder: string;
	onSearch: (query: string) => void;
	selectionActions?: ReactNode;
	headingActions?: ReactNode;
	emptyStateMessage: string;
	emptyStateHint?: string;
};

export function ArticlesHeader({
	title,
	total,
	sort,
	onSortChange,
	searchValue,
	searchPlaceholder,
	onSearch,
	selectionActions,
	headingActions,
	emptyStateMessage,
	emptyStateHint,
}: ArticlesHeaderProps) {
	return (
		<>
			<PageHeading
				title={title}
				count={getArticleCountLabel(total)}
				actions={headingActions}
			/>

			<div className="flex gap-2 sm:justify-end">
				<PageSearchField
					debounceMs={250}
					value={searchValue}
					placeholder={searchPlaceholder}
					ariaLabel={searchPlaceholder}
					onSearch={onSearch}
					className="min-w-0 flex-1 sm:w-64 sm:flex-none"
				/>
				<ArticleSortSelect
					value={sort}
					onChange={onSortChange}
					className="w-36 shrink-0"
				/>
			</div>

			{selectionActions}

			{total === 0 && (
				<div className="flex flex-col items-center justify-center gap-1.5 py-20 text-center">
					<p className="font-serif text-xl font-semibold">
						{emptyStateMessage}
					</p>
					{emptyStateHint && (
						<p className="text-sm text-muted-foreground">{emptyStateHint}</p>
					)}
				</div>
			)}
		</>
	);
}
