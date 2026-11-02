import type { ArchiveActions } from "#/components/archive/types";
import { ArticleExternalLink } from "#/components/articles/article-external-link";
import { ArticleRowMenu } from "#/components/articles/article-row-menu";
import { ArticleStateMarks } from "#/components/articles/article-state-marks";
import type { ArticleWithTags } from "#/components/articles/types";
import { TagLabel } from "#/components/tags/tag-label";
import { Checkbox } from "#/components/ui/checkbox";
import { formatDate } from "#/lib/formatters";
import { cn } from "#/lib/utils";

type ArchiveMobileRowProps = ArchiveActions & {
	article: ArticleWithTags;
	isSelected: boolean;
	/** True while any row is selected: taps toggle selection. */
	selectionMode: boolean;
	onSelectedChange: (isSelected: boolean) => void;
};

export function ArchiveMobileRow({
	article,
	isSelected,
	selectionMode,
	onSelectedChange,
	availableTags,
	onAddTag,
	onRemoveTag,
	onCreateTag,
	onOpenArticle,
	onToggleRead,
	onToggleFavorite,
	onDelete,
}: ArchiveMobileRowProps) {
	function activate() {
		if (selectionMode) {
			onSelectedChange(!isSelected);
			return;
		}
		void onOpenArticle(article.id, article.isRead);
	}

	return (
		<article
			className={cn(
				"grid cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-2.5 border-b py-2.5 pr-1 pl-3",
				isSelected && "bg-select",
			)}
			onClick={activate}
			onKeyDown={(event) => {
				if (event.key === "Enter" && event.target === event.currentTarget) {
					activate();
				}
			}}
			aria-label={article.title ?? article.url}
		>
			<div className="flex items-center gap-3 pt-0.5">
				{selectionMode && (
					<Checkbox
						aria-label={`Select ${article.title ?? article.url}`}
						checked={isSelected}
						onCheckedChange={(value) => onSelectedChange(!!value)}
						className="ml-1"
						onClick={(event) => event.stopPropagation()}
						onKeyDown={(event) => event.stopPropagation()}
					/>
				)}
				<ArticleStateMarks
					isRead={article.isRead}
					isFavorite={article.isFavorite}
				/>
			</div>

			<div className="min-w-0 space-y-1 py-0.5">
				<ArticleExternalLink
					articleId={article.id}
					href={article.url}
					isRead={article.isRead}
					onOpenArticle={onOpenArticle}
					onClick={(event) => {
						if (!selectionMode) return;
						event.preventDefault();
						event.stopPropagation();
						activate();
					}}
					className={cn(
						"block min-w-0 text-[15px] leading-snug no-underline",
						article.isRead
							? "font-normal text-muted-foreground"
							: "font-semibold text-foreground",
					)}
				>
					<span className="line-clamp-2 break-words">
						{article.title ?? article.url}
					</span>
				</ArticleExternalLink>

				<div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-meta text-muted-foreground">
					<span className="max-w-full truncate">
						{article.hostname ?? article.url}
					</span>
					{article.createdAt && (
						<span className="tabular-nums">
							· {formatDate(article.createdAt)}
						</span>
					)}
					{article.tags.map((tag) => (
						<TagLabel key={tag.id} name={tag.name} />
					))}
				</div>
			</div>

			<ArticleRowMenu
				article={article}
				triggerSize="icon-touch"
				triggerClassName="-mt-2 text-muted-foreground"
				selected={isSelected}
				onSelect={(_id, selected) => onSelectedChange(selected)}
				onToggleRead={onToggleRead}
				onToggleFavorite={onToggleFavorite}
				onDelete={(id) => void onDelete([id])}
				availableTags={availableTags}
				onAddTag={onAddTag}
				onRemoveTag={onRemoveTag}
				onCreateTag={onCreateTag}
			/>
		</article>
	);
}
