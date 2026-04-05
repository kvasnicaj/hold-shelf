import { BookOpen, Check, Trash2 } from "lucide-react";
import { TagPicker } from "#/components/tags/tag-picker";
import type { Tag } from "#/components/tags/types";
import { Button } from "#/components/ui/button";

type ArticleCardActionsProps = {
	articleId: string;
	isRead: boolean;
	tagIds: string[];
	availableTags?: Tag[];
	onToggleRead: (id: string, isRead: boolean) => void;
	onDelete: (id: string) => void;
	onAddTag?: (tagId: string, articleIds: string[]) => void;
	onRemoveTag?: (tagId: string, articleIds: string[]) => void;
	onCreateTag?: (name: string) => Promise<Tag>;
};

export function ArticleCardActions({
	articleId,
	isRead,
	tagIds,
	availableTags,
	onToggleRead,
	onDelete,
	onAddTag,
	onRemoveTag,
	onCreateTag,
}: ArticleCardActionsProps) {
	return (
		<div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
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
				onClick={() => onToggleRead(articleId, !isRead)}
				title={isRead ? "Mark as unread" : "Mark as read"}
			>
				{isRead ? (
					<BookOpen className="h-4 w-4" />
				) : (
					<Check className="h-4 w-4" />
				)}
			</Button>
			<Button
				variant="ghost"
				size="icon-xs"
				onClick={() => onDelete(articleId)}
				title="Delete"
			>
				<Trash2 className="h-4 w-4" />
			</Button>
		</div>
	);
}
