import { BookOpen, Check, EllipsisVertical, Star, Trash2 } from "lucide-react";
import { useContext } from "react";
import { ArchiveActionsContext } from "#/components/archive/archive-actions-context";
import type { ArticleWithTags } from "#/components/articles/types";
import { TagPicker } from "#/components/tags/tag-picker";
import { Button } from "#/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
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
		<div className="flex min-w-[3.75rem] items-center justify-end gap-px whitespace-nowrap opacity-0 group-hover/row:opacity-100 group-focus-within/row:opacity-100">
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
						<EllipsisVertical className="h-3.5 w-3.5" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem
						onClick={(event) => {
							event.stopPropagation();
							void onToggleFavorite(article.id, !article.isFavorite);
						}}
					>
						<Star
							className={
								article.isFavorite
									? "h-4 w-4 fill-current text-amber-500"
									: "h-4 w-4"
							}
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
							<BookOpen className="h-4 w-4" />
						) : (
							<Check className="h-4 w-4" />
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
						<Trash2 className="h-4 w-4" />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
