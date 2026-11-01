import { useContext } from "react";
import { ArchiveActionsContext } from "#/components/archive/archive-actions-context";
import { ArticleRowMenu } from "#/components/articles/article-row-menu";
import type { ArticleWithTags } from "#/components/articles/types";
import { TagPicker } from "#/components/tags/tag-picker";

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
		<div className="flex items-center justify-end gap-px whitespace-nowrap opacity-0 transition-opacity group-hover/row:opacity-100 group-focus-within/row:opacity-100 has-data-[state=open]:opacity-100 pointer-coarse:opacity-100">
			<TagPicker
				availableTags={availableTags}
				selectedTagIds={article.tags.map((tag) => tag.id)}
				onAddTag={onAddTag}
				onRemoveTag={onRemoveTag}
				onCreateTag={onCreateTag}
				articleIds={[article.id]}
				align="end"
				triggerClassName="pointer-coarse:size-10"
			/>
			<ArticleRowMenu
				article={article}
				triggerClassName="pointer-coarse:size-10"
				onToggleRead={onToggleRead}
				onToggleFavorite={onToggleFavorite}
				onDelete={(id) => void onDelete([id])}
			/>
		</div>
	);
}
