import { fn, userEvent, within } from "storybook/test";
import type { ArchiveActions } from "#/components/archive/types";
import { sampleTags } from "#/stories/fixtures";

export const articleActions = {
	onSelect: fn(),
	onOpenArticle: fn(async () => {}),
	onToggleRead: fn(async () => {}),
	onToggleFavorite: fn(async () => {}),
	onDelete: fn(async () => {}),
	availableTags: sampleTags,
	onAddTag: fn(async () => {}),
	onRemoveTag: fn(async () => {}),
	onCreateTag: fn(async (name: string) => ({
		id: `demo-${name}`,
		name,
		color: null,
	})),
};
export const archiveActions: ArchiveActions = articleActions;
export const collectionActions = {
	handleSelect: articleActions.onSelect,
	handleOpenArticle: articleActions.onOpenArticle,
	handleToggleRead: articleActions.onToggleRead,
	handleToggleFavorite: articleActions.onToggleFavorite,
	handleDelete: articleActions.onDelete,
	handleBulkToggleRead: fn(async () => {}),
	handleAddTag: articleActions.onAddTag,
	handleRemoveTag: articleActions.onRemoveTag,
	handleCreateTag: articleActions.onCreateTag,
	updateQuery: fn(),
	updateSort: fn(),
	goToPage: fn(),
	clearSelection: fn(),
};

export async function searchForReading({
	canvasElement,
}: {
	canvasElement: HTMLElement;
}) {
	await userEvent.type(
		await within(canvasElement).findByRole("searchbox"),
		"reading",
	);
}
