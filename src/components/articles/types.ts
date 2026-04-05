import type { Tag } from "#/components/tags/types";

export type ArticleWithTags = {
	id: string;
	url: string;
	title: string | null;
	description: string | null;
	hostname: string | null;
	faviconUrl: string | null;
	isRead: boolean;
	isFavorite: boolean;
	createdAt: Date | null;
	tags: Tag[];
};
