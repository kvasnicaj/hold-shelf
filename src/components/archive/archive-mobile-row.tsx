import { BookmarkSimple, DotsThreeVertical } from "@phosphor-icons/react";
import { ArticleActionsMenuItems } from "#/components/archive/article-actions-menu-items";
import type { ArchiveActions } from "#/components/archive/types";
import { ArticleExternalLink } from "#/components/articles/article-external-link";
import { ReadStateSpine } from "#/components/articles/read-state-spine";
import type { ArticleWithTags } from "#/components/articles/types";
import { TagPicker } from "#/components/tags/tag-picker";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Checkbox } from "#/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { formatDate } from "#/lib/formatters";
import { cn } from "#/lib/utils";

type ArchiveMobileRowProps = ArchiveActions & {
	article: ArticleWithTags;
	isSelected: boolean;
	showCheckbox: boolean;
	onSelectedChange: (isSelected: boolean) => void;
};

export function ArchiveMobileRow({
	article,
	isSelected,
	showCheckbox,
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
	return (
		// biome-ignore lint/a11y/useSemanticElements: The composite row contains nested controls, so it cannot be a native button.
		<div
			className={cn(
				"grid cursor-pointer grid-cols-[6px_minmax(0,1fr)_auto] gap-x-2.5 border-b py-3 pr-2 pl-3",
				isSelected && "bg-select",
			)}
			onClick={() => void onOpenArticle(article.id, article.isRead)}
			onKeyDown={(event) => {
				if (event.key === "Enter" && event.target === event.currentTarget) {
					void onOpenArticle(article.id, article.isRead);
				}
			}}
			role="button"
			tabIndex={0}
		>
			<ReadStateSpine isRead={article.isRead} className="mt-1" />

			<div className="min-w-0 space-y-1">
				<div className="flex min-w-0 items-start gap-2">
					{showCheckbox && (
						<Checkbox
							aria-label={`Select ${article.title ?? article.url}`}
							checked={isSelected}
							onCheckedChange={(value) => onSelectedChange(!!value)}
							className="mt-0.5"
							onClick={(event) => event.stopPropagation()}
							onKeyDown={(event) => event.stopPropagation()}
						/>
					)}
					<ArticleExternalLink
						articleId={article.id}
						href={article.url}
						isRead={article.isRead}
						onOpenArticle={onOpenArticle}
						className={cn(
							"min-w-0 flex-1 text-[15px] leading-snug no-underline",
							article.isRead
								? "text-muted-foreground"
								: "font-medium text-foreground",
						)}
					>
						<span className="line-clamp-2 break-words">
							{article.title ?? article.url}
						</span>
					</ArticleExternalLink>
				</div>

				<div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
					<span className="max-w-full truncate">
						{article.hostname ?? article.url}
					</span>
					{article.createdAt && (
						<span className="tabular-nums">
							· {formatDate(article.createdAt)}
						</span>
					)}
					{article.isFavorite && (
						<BookmarkSimple
							aria-label="Favorite"
							weight="fill"
							className="size-3 text-favorite"
						/>
					)}
					{article.tags.map((tag) => (
						<Badge
							key={tag.id}
							variant="secondary"
							className="px-1.5 py-0 text-[11px] font-semibold"
						>
							{tag.name}
						</Badge>
					))}
				</div>
			</div>

			<div className="flex items-start justify-end">
				<TagPicker
					availableTags={availableTags}
					selectedTagIds={article.tags.map((tag) => tag.id)}
					articleIds={[article.id]}
					onAddTag={onAddTag}
					onRemoveTag={onRemoveTag}
					onCreateTag={onCreateTag}
				/>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon-xs"
							aria-label={`Article actions for ${article.title ?? article.url}`}
							onClick={(event) => event.stopPropagation()}
							onKeyDown={(event) => event.stopPropagation()}
						>
							<DotsThreeVertical className="size-[1.125rem]" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem
							onClick={(event) => {
								event.stopPropagation();
								onSelectedChange(!isSelected);
							}}
						>
							{isSelected ? "Deselect article" : "Select article"}
						</DropdownMenuItem>
						<ArticleActionsMenuItems
							article={article}
							onToggleFavorite={onToggleFavorite}
							onToggleRead={onToggleRead}
							onDelete={onDelete}
						/>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
