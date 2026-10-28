import { BookmarkSimple, BookOpen, Check, Trash } from "@phosphor-icons/react";
import type { ArchiveActions } from "#/components/archive/types";
import type { ArticleWithTags } from "#/components/articles/types";
import { DropdownMenuItem } from "#/components/ui/dropdown-menu";
import { cn } from "#/lib/utils";

type ArticleActionsMenuItemsProps = Pick<
	ArchiveActions,
	"onToggleFavorite" | "onToggleRead" | "onDelete"
> & {
	article: ArticleWithTags;
};

export function ArticleActionsMenuItems({
	article,
	onToggleFavorite,
	onToggleRead,
	onDelete,
}: ArticleActionsMenuItemsProps) {
	return (
		<>
			<DropdownMenuItem
				onClick={(event) => {
					event.stopPropagation();
					void onToggleFavorite(article.id, !article.isFavorite);
				}}
			>
				<BookmarkSimple
					weight={article.isFavorite ? "fill" : "regular"}
					className={cn("size-4", article.isFavorite && "text-favorite")}
				/>
				{article.isFavorite ? "Remove from favorites" : "Add to favorites"}
			</DropdownMenuItem>
			<DropdownMenuItem
				onClick={(event) => {
					event.stopPropagation();
					void onToggleRead(article.id, !article.isRead);
				}}
			>
				{article.isRead ? (
					<BookOpen className="size-4" />
				) : (
					<Check className="size-4" />
				)}
				{article.isRead ? "Mark unread" : "Mark read"}
			</DropdownMenuItem>
			<DropdownMenuItem
				variant="destructive"
				onClick={(event) => {
					event.stopPropagation();
					void onDelete([article.id]);
				}}
			>
				<Trash className="size-4" />
				Delete
			</DropdownMenuItem>
		</>
	);
}
