import { BookOpen, Check, Star, Trash2 } from "lucide-react";
import { TagPicker } from "#/components/tags/tag-picker";
import type { Tag } from "#/components/tags/types";
import { Button } from "#/components/ui/button";

type ArticleCardActionsProps = {
	articleId: string;
	isRead: boolean;
	isFavorite: boolean;
	tagIds: string[];
	availableTags?: Tag[];
	persistent?: boolean;
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
	onToggleRead,
	onToggleFavorite,
	onDelete,
	onAddTag,
	onRemoveTag,
	onCreateTag,
}: ArticleCardActionsProps) {
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
				onClick={() => onToggleFavorite(articleId, !isFavorite)}
				title={isFavorite ? "Remove from favorites" : "Add to favorites"}
				className={
					isFavorite ? "text-amber-500 hover:text-amber-600" : undefined
				}
			>
				<Star
					className={
						isFavorite
							? "h-[1.125rem] w-[1.125rem] fill-current"
							: "h-[1.125rem] w-[1.125rem]"
					}
				/>
			</Button>
			<Button
				variant="ghost"
				size="icon-xs"
				onClick={() => onToggleRead(articleId, !isRead)}
				title={isRead ? "Mark as unread" : "Mark as read"}
			>
				{isRead ? (
					<BookOpen className="h-[1.125rem] w-[1.125rem]" />
				) : (
					<Check className="h-[1.125rem] w-[1.125rem]" />
				)}
			</Button>
			<Button
				variant="ghost"
				size="icon-xs"
				onClick={() => onDelete(articleId)}
				title="Delete"
			>
				<Trash2 className="h-[1.125rem] w-[1.125rem]" />
			</Button>
		</div>
	);
}
