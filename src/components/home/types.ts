import type { Tag } from "#/components/tags/types";

export type RecentArticle = {
	id: string;
	url: string;
	title: string | null;
	hostname: string | null;
	faviconUrl: string | null;
	isRead: boolean;
	createdAt?: Date | null;
};

export type RecentlySavedArticle = RecentArticle & {
	tags: Tag[];
};
