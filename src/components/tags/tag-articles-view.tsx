import { ArrowLeft } from "lucide-react";
import { ArticleList } from "#/components/articles/article-list";
import type { ArticleWithTags } from "#/components/articles/types";
import type { Tag } from "#/components/tags/types";
import { Button } from "#/components/ui/button";

type TagArticlesViewProps = {
	activeTagName?: string;
	articles: ArticleWithTags[];
	total: number;
	page: number;
	totalPages: number;
	selected: Set<string>;
	availableTags: Tag[];
	onBack: () => void;
	onSelect: (id: string, selected: boolean) => void;
	onToggleRead: (id: string, isRead: boolean) => Promise<void>;
	onDeleteArticles: (ids: string[]) => Promise<void>;
	onAddTag: (tagId: string, articleIds: string[]) => Promise<void>;
	onRemoveTag: (tagId: string, articleIds: string[]) => Promise<void>;
	onCreateTag: (name: string) => Promise<Tag>;
	onPreviousPage: () => void;
	onNextPage: () => void;
	showBackButton?: boolean;
	variant?: "mobile" | "desktop";
};

export function TagArticlesView({
	activeTagName,
	articles,
	total,
	page,
	totalPages,
	selected,
	availableTags,
	onBack,
	onSelect,
	onToggleRead,
	onDeleteArticles,
	onAddTag,
	onRemoveTag,
	onCreateTag,
	onPreviousPage,
	onNextPage,
	showBackButton = true,
	variant = "mobile",
}: TagArticlesViewProps) {
	if (articles.length === 0) {
		return (
			<div
				className={
					variant === "desktop"
						? "flex flex-col items-center justify-center py-20 text-center"
						: "space-y-4 rounded-xl border bg-card p-4 text-center shadow-sm"
				}
			>
				{variant === "desktop" ? (
					<>
						{activeTagName && (
							<h2 className="display-title mb-2 text-xl font-bold">
								{activeTagName}
							</h2>
						)}
						<p className="text-lg text-muted-foreground">
							No articles with this tag.
						</p>
					</>
				) : (
					<>
						<div className="flex items-center justify-between gap-2">
							{showBackButton && (
								<Button
									variant="outline"
									size="icon-sm"
									onClick={onBack}
									aria-label="Back to tags"
									title="Back to tags"
								>
									<ArrowLeft className="h-4 w-4" />
								</Button>
							)}
							<h2 className="display-title truncate text-xl font-bold">
								{activeTagName}
							</h2>
							{showBackButton && <div className="h-9 w-9 shrink-0" />}
						</div>
						<p className="text-lg text-muted-foreground">
							No articles with this tag.
						</p>
					</>
				)}
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2">
				{showBackButton && (
					<Button
						variant="outline"
						size="icon-sm"
						onClick={onBack}
						aria-label="Back to tags"
						title="Back to tags"
					>
						<ArrowLeft className="h-4 w-4" />
					</Button>
				)}
				<h2 className="display-title text-xl font-bold">{activeTagName}</h2>
				<p className="text-sm text-muted-foreground">
					{total} article{total !== 1 ? "s" : ""}
				</p>
			</div>

			<ArticleList
				articles={articles}
				selected={selected}
				onSelect={onSelect}
				onToggleRead={onToggleRead}
				onDelete={onDeleteArticles}
				availableTags={availableTags}
				onAddTag={onAddTag}
				onRemoveTag={onRemoveTag}
				onCreateTag={onCreateTag}
			/>

			{totalPages > 1 && (
				<div className="flex items-center justify-between">
					<p className="text-sm text-muted-foreground">
						Page {page} of {totalPages}
					</p>
					<div className="flex items-center gap-1">
						<Button
							variant="outline"
							size="sm"
							disabled={page <= 1}
							onClick={onPreviousPage}
						>
							Previous
						</Button>
						<Button
							variant="outline"
							size="sm"
							disabled={page >= totalPages}
							onClick={onNextPage}
						>
							Next
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
