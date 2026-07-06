import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ArticleSortSelect } from "#/components/articles/article-sort-select";
import type { ArticleSort } from "#/components/articles/types";
import { PageSearchField } from "#/components/layout/page-search-field";

type ArticlesHeaderProps = {
	title: string;
	icon?: LucideIcon;
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
	icon: Icon,
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
			<div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
				<h1 className="display-title flex min-w-0 items-center gap-2 text-2xl font-bold">
					{Icon ? (
						<Icon className="h-6 w-6 shrink-0 text-muted-foreground" />
					) : null}
					<span className="truncate">{title}</span>
				</h1>
				{headingActions ? (
					<div className="flex shrink-0 items-center gap-1">
						{headingActions}
					</div>
				) : null}
			</div>

			<div className="@container">
				<div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 @min-[48rem]:grid-cols-[minmax(max-content,1fr)_auto_minmax(max-content,1fr)]">
					<p className="min-w-0 text-sm text-muted-foreground @min-[48rem]:col-start-1 @min-[48rem]:row-start-1">
						{total} article{total !== 1 ? "s" : ""}
					</p>

					{selectionActions && (
						<div className="min-w-0 justify-self-end @min-[48rem]:col-start-2 @min-[48rem]:row-start-1 @min-[48rem]:justify-self-center">
							{selectionActions}
						</div>
					)}

					<div className="col-span-full flex flex-col gap-2 @min-[34rem]:flex-row @min-[34rem]:items-center @min-[48rem]:col-span-1 @min-[48rem]:col-start-3 @min-[48rem]:row-start-1 @min-[48rem]:justify-self-end">
						<PageSearchField
							value={searchValue}
							placeholder={searchPlaceholder}
							ariaLabel={searchPlaceholder}
							onSearch={onSearch}
							className="w-full @min-[34rem]:w-64"
						/>
						<ArticleSortSelect
							value={sort}
							onChange={onSortChange}
							className="w-full @min-[34rem]:w-40"
						/>
					</div>
				</div>
			</div>

			{total === 0 && (
				<div className="flex flex-col items-center justify-center py-20 text-center">
					<p className="text-lg text-muted-foreground">{emptyStateMessage}</p>
					{emptyStateHint && (
						<p className="mt-1 text-sm text-muted-foreground">
							{emptyStateHint}
						</p>
					)}
				</div>
			)}
		</>
	);
}
