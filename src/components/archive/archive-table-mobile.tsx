import { ArchiveMobileRow } from "#/components/archive/archive-mobile-row";
import { groupByMonth } from "#/components/archive/helpers";
import { MonthGroupLabel } from "#/components/archive/month-group-label";
import type { ArchiveActions } from "#/components/archive/types";
import type { ArticleWithTags } from "#/components/articles/types";

type ArchiveTableMobileProps = ArchiveActions & {
	articles: ArticleWithTags[];
	rowSelection: Record<string, boolean>;
	onRowSelectionChange: React.Dispatch<
		React.SetStateAction<Record<string, boolean>>
	>;
	groupedByMonth?: boolean;
};

export function ArchiveTableMobile({
	articles,
	rowSelection,
	onRowSelectionChange,
	groupedByMonth = false,
	...actions
}: ArchiveTableMobileProps) {
	const hasSelection = Object.values(rowSelection).some(Boolean);
	const groups = groupedByMonth
		? groupByMonth(articles, (article) => article.createdAt)
		: [{ key: "all", label: "", items: articles }];

	function toggleRow(articleId: string, isSelected: boolean) {
		onRowSelectionChange((current) => {
			const next = { ...current };
			if (isSelected) {
				next[articleId] = true;
			} else {
				delete next[articleId];
			}
			return next;
		});
	}

	return (
		<div className="-mx-3 border-t bg-card sm:-mx-6 md:hidden">
			{groups.map((group) => (
				<section key={group.key} aria-label={group.label || undefined}>
					{groupedByMonth && (
						<div className="border-b px-4 pt-4 pb-1.5">
							<MonthGroupLabel label={group.label} count={group.items.length} />
						</div>
					)}
					{group.items.map((article) => {
						const isSelected = Boolean(rowSelection[article.id]);

						return (
							<ArchiveMobileRow
								key={article.id}
								article={article}
								isSelected={isSelected}
								showCheckbox={hasSelection || isSelected}
								onSelectedChange={(value) => toggleRow(article.id, value)}
								{...actions}
							/>
						);
					})}
				</section>
			))}
		</div>
	);
}
