import {
	BookmarkSimple,
	BookOpen,
	Check,
	CheckSquare,
	Trash,
} from "@phosphor-icons/react";
import type { VariantProps } from "class-variance-authority";
import type { ArticleWithTags } from "#/components/articles/types";
import { ActionsMenu } from "#/components/layout/actions-menu";
import type { Tag } from "#/components/tags/types";
import type { buttonVariants } from "#/components/ui/button";
import { DropdownMenuItem } from "#/components/ui/dropdown-menu";
import { cn } from "#/lib/utils";

type ArticleRowMenuProps = {
	article: ArticleWithTags;
	triggerSize?: VariantProps<typeof buttonVariants>["size"];
	triggerClassName?: string;
	/** Adds Select / Deselect, which starts or leaves selection mode. */
	selected?: boolean;
	onSelect?: (id: string, selected: boolean) => void;
	onToggleRead: (id: string, isRead: boolean) => void;
	onToggleFavorite: (id: string, isFavorite: boolean) => void;
	onDelete: (id: string) => void;
	/** With all three tag handlers, the menu offers Tags…. */
	availableTags?: Tag[];
	onAddTag?: (tagId: string, articleIds: string[]) => void | Promise<void>;
	onRemoveTag?: (tagId: string, articleIds: string[]) => void | Promise<void>;
	onCreateTag?: (name: string) => Promise<Tag>;
};

export function ArticleRowMenu({
	article,
	triggerSize,
	triggerClassName,
	selected = false,
	onSelect,
	onToggleRead,
	onToggleFavorite,
	onDelete,
	availableTags,
	onAddTag,
	onRemoveTag,
	onCreateTag,
}: ArticleRowMenuProps) {
	return (
		<ActionsMenu
			label={`More actions for ${article.title ?? article.url}`}
			triggerSize={triggerSize}
			triggerClassName={triggerClassName}
			tagPicker={
				availableTags && onAddTag && onRemoveTag
					? {
							availableTags,
							selectedTagIds: article.tags.map((tag) => tag.id),
							articleIds: [article.id],
							onAddTag,
							onRemoveTag,
							onCreateTag,
						}
					: undefined
			}
			footer={
				<DropdownMenuItem onSelect={() => onDelete(article.id)}>
					<Trash />
					Move to Trash
				</DropdownMenuItem>
			}
		>
			{onSelect && (
				<DropdownMenuItem onSelect={() => onSelect(article.id, !selected)}>
					<CheckSquare />
					{selected ? "Deselect" : "Select"}
				</DropdownMenuItem>
			)}
			<DropdownMenuItem
				onSelect={() => onToggleRead(article.id, !article.isRead)}
			>
				{article.isRead ? <BookOpen /> : <Check />}
				{article.isRead ? "Mark as unread" : "Mark as read"}
			</DropdownMenuItem>
			<DropdownMenuItem
				onSelect={() => onToggleFavorite(article.id, !article.isFavorite)}
			>
				<BookmarkSimple
					weight={article.isFavorite ? "fill" : "regular"}
					className={cn(article.isFavorite && "text-favorite")}
				/>
				{article.isFavorite ? "Remove from favorites" : "Add to favorites"}
			</DropdownMenuItem>
		</ActionsMenu>
	);
}
