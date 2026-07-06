import { BookOpen, Check, Star, Trash2 } from "lucide-react";
import { TagPicker } from "#/components/tags/tag-picker";
import type { Tag } from "#/components/tags/types";
import { Button } from "#/components/ui/button";
import { cn } from "#/lib/utils";

type ArticleCardActionsProps = {
	articleId: string;
	isRead: boolean;
	isFavorite: boolean;
	tagIds: string[];
	availableTags?: Tag[];
	persistent?: boolean;
	iconSize?: "default" | "mobile";
	onToggleRead: (id: string, isRead: boolean) => void;
	onToggleFavorite: (id: string, isFavorite: boolean) => void;
	onDelete: (id: string) => void;
	onAddTag?: (tagId: string, articleIds: string[]) => void;
	onRemoveTag?: (tagId: string, articleIds: string[]) => void;
	onCreateTag?: (name: string) => Promise<Tag>;
};

export function ArticleCardActions({
	articleId,
	isRead,
	isFavorite,
	tagIds,
	availableTags,
	persistent = false,
	iconSize = "default",
	onToggleRead,
	onToggleFavorite,
	onDelete,
	onAddTag,
	onRemoveTag,
	onCreateTag,
}: ArticleCardActionsProps) {
	const iconClassName =
		iconSize === "mobile" ? "h-5 w-5" : "h-[1.125rem] w-[1.125rem]";

	return (
		<div
			className={
				persistent
					? "flex shrink-0 items-center gap-1"
					: "flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100"
			}
		>
			{availableTags && onAddTag && onRemoveTag && onCreateTag && (
				<TagPicker
					availableTags={availableTags}
					selectedTagIds={tagIds}
					onAddTag={onAddTag}
					onRemoveTag={onRemoveTag}
					onCreateTag={onCreateTag}
					articleIds={[articleId]}
				/>
			)}
			<Button
				variant="ghost"
				size="icon-xs"
				onClick={(event) => {
					event.stopPropagation();
					onToggleFavorite(articleId, !isFavorite);
				}}
				title={isFavorite ? "Remove from favorites" : "Add to favorites"}
				className={
					isFavorite ? "text-amber-500 hover:text-amber-600" : undefined
				}
			>
				<Star className={cn(iconClassName, isFavorite && "fill-current")} />
			</Button>
			<Button
				variant="ghost"
				size="icon-xs"
				onClick={(event) => {
					event.stopPropagation();
					onToggleRead(articleId, !isRead);
				}}
				title={isRead ? "Mark as unread" : "Mark as read"}
			>
				{isRead ? (
					<BookOpen className={iconClassName} />
				) : (
					<Check className={iconClassName} />
				)}
			</Button>
			<Button
				variant="ghost"
				size="icon-xs"
				onClick={(event) => {
					event.stopPropagation();
					onDelete(articleId);
				}}
				title="Delete"
			>
				<Trash2 className={iconClassName} />
			</Button>
		</div>
	);
}
