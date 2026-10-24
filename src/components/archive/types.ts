import type { Tag } from "#/components/tags/types";

export type ArchiveActions = {
	availableTags: Tag[];
	onAddTag: (tagId: string, articleIds: string[]) => Promise<void>;
	onRemoveTag: (tagId: string, articleIds: string[]) => Promise<void>;
	onCreateTag: (name: string) => Promise<Tag>;
	onOpenArticle: (id: string, isRead: boolean) => Promise<void>;
	onToggleRead: (id: string, isRead: boolean) => Promise<void>;
	onToggleFavorite: (id: string, isFavorite: boolean) => Promise<void>;
	onDelete: (ids: string[]) => Promise<void>;
};
