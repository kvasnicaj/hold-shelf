import { BookmarkSimple, BookOpen, Check, Trash } from "@phosphor-icons/react";
import { useIsMutating } from "@tanstack/react-query";
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
	className?: string;
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
	className,
	onToggleRead,
	onToggleFavorite,
	onDelete,
	onAddTag,
	onRemoveTag,
	onCreateTag,
}: ArticleCardActionsProps) {
	const pending = useIsMutating({ mutationKey: ["library-edit"] }) > 0;
	const iconClassName = "h-[1.125rem] w-[1.125rem]";
	const buttonClassName = "pointer-coarse:size-10";

	return (
		<div
			className={cn(
				"shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 pointer-coarse:opacity-100",
				className,
			)}
		>
			{availableTags && onAddTag && onRemoveTag && onCreateTag && (
				<TagPicker
					availableTags={availableTags}
					selectedTagIds={tagIds}
					onAddTag={onAddTag}
					onRemoveTag={onRemoveTag}
					onCreateTag={onCreateTag}
					articleIds={[articleId]}
					triggerClassName={buttonClassName}
				/>
			)}
			<Button
				disabled={pending}
				variant="ghost"
				size="icon-xs"
				className={cn(
					buttonClassName,
					isFavorite && "text-favorite hover:text-favorite",
				)}
				onClick={(event) => {
					event.stopPropagation();
					onToggleFavorite(articleId, !isFavorite);
				}}
				title={isFavorite ? "Remove from favorites" : "Add to favorites"}
			>
				<BookmarkSimple
					weight={isFavorite ? "fill" : "regular"}
					className={iconClassName}
				/>
			</Button>
			<Button
				disabled={pending}
				variant="ghost"
				size="icon-xs"
				className={buttonClassName}
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
				disabled={pending}
				variant="ghost"
				size="icon-xs"
				className={buttonClassName}
				onClick={(event) => {
					event.stopPropagation();
					onDelete(articleId);
				}}
				title="Move to Trash"
			>
				<Trash className={iconClassName} />
			</Button>
		</div>
	);
}
