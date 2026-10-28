import type { ReactNode } from "react";
import { ArticleSortSelect } from "#/components/articles/article-sort-select";
import type { ArticleSort } from "#/components/articles/types";
import { PageSearchField } from "#/components/layout/page-search-field";

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
			<div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-2">
				<div className="flex min-w-0 items-baseline gap-3">
					<h1 className="truncate font-serif text-[1.75rem] leading-tight font-semibold">
						{title}
					</h1>
					<p className="shrink-0 text-sm tabular-nums text-muted-foreground">
						{total} article{total !== 1 ? "s" : ""}
					</p>
				</div>
				{headingActions ? (
					<div className="flex shrink-0 items-center gap-1">
						{headingActions}
					</div>
				) : null}
			</div>

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
