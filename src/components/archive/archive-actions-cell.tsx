import { EllipsisVertical } from "lucide-react";
import { useContext } from "react";
import { ArchiveActionsContext } from "#/components/archive/archive-actions-context";
import { ArticleActionsMenuItems } from "#/components/archive/article-actions-menu-items";
import type { ArticleWithTags } from "#/components/articles/types";
import { TagPicker } from "#/components/tags/tag-picker";
import { Button } from "#/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";

type ArchiveActionsCellProps = { row: { original: ArticleWithTags } };

export function ArchiveActionsCell({ row }: ArchiveActionsCellProps) {
	const article = row.original;
	const actions = useContext(ArchiveActionsContext);
	if (!actions) throw new Error("Archive actions require a provider.");
	const {
		availableTags,
		onAddTag,
		onRemoveTag,
		onCreateTag,
		onToggleFavorite,
		onToggleRead,
		onDelete,
	} = actions;
	return (
		<div className="flex min-w-[3.75rem] items-center justify-end gap-px whitespace-nowrap opacity-0 transition-opacity group-hover/row:opacity-100 group-focus-within/row:opacity-100">
			<TagPicker
				availableTags={availableTags}
				selectedTagIds={article.tags.map((tag) => tag.id)}
				onAddTag={onAddTag}
				onRemoveTag={onRemoveTag}
				onCreateTag={onCreateTag}
				articleIds={[article.id]}
			/>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon-xs"
						aria-label={`Article actions for ${article.title ?? article.url}`}
						title="More actions"
						onClick={(event) => event.stopPropagation()}
						onKeyDown={(event) => event.stopPropagation()}
					>
						<EllipsisVertical className="size-3.5" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<ArticleActionsMenuItems
						article={article}
						onToggleFavorite={onToggleFavorite}
						onToggleRead={onToggleRead}
						onDelete={onDelete}
					/>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
