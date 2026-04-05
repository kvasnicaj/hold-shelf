import type { tags } from "#/db/schema";

type TagRecord = typeof tags.$inferSelect;

export type TagSummaryRecord = {
	id: string;
	name: string;
	color: string | null;
	createdAt: Date;
	articleCount: number;
};

export type TagsRepository = {
	listTags: (args: { userId: string }) => Promise<TagSummaryRecord[]>;
	createTag: (args: {
		userId: string;
		name: string;
		color?: string | null;
	}) => Promise<TagRecord>;
	updateTag: (args: {
		userId: string;
		id: string;
		name: string;
	}) => Promise<TagRecord>;
	deleteTag: (args: { userId: string; id: string }) => Promise<void>;
	hasOwnedTag: (args: { userId: string; tagId: string }) => Promise<boolean>;
	countOwnedArticles: (args: {
		userId: string;
		articleIds: string[];
	}) => Promise<number>;
	addTagToArticles: (args: {
		tagId: string;
		articleIds: string[];
	}) => Promise<void>;
	removeTagFromArticles: (args: {
		tagId: string;
		articleIds: string[];
	}) => Promise<void>;
};

export async function getTagsForUser({
	repo,
	userId,
}: {
	repo: TagsRepository;
	userId: string;
}) {
	return repo.listTags({ userId });
}

export async function createTagForUser({
	repo,
	userId,
	name,
	color,
}: {
	repo: TagsRepository;
	userId: string;
	name: string;
	color?: string | null;
}) {
	return repo.createTag({ userId, name: name.trim(), color: color ?? null });
}

export async function updateTagForUser({
	repo,
	userId,
	id,
	name,
}: {
	repo: TagsRepository;
	userId: string;
	id: string;
	name: string;
}) {
	return repo.updateTag({ userId, id, name: name.trim() });
}

export async function deleteTagForUser({
	repo,
	userId,
	id,
}: {
	repo: TagsRepository;
	userId: string;
	id: string;
}) {
	await repo.deleteTag({ userId, id });
	return { success: true };
}

export async function addTagToArticlesForUser({
	repo,
	userId,
	tagId,
	articleIds,
}: {
	repo: TagsRepository;
	userId: string;
	tagId: string;
	articleIds: string[];
}) {
	const uniqueArticleIds = Array.from(new Set(articleIds));
	const hasTag = await repo.hasOwnedTag({ userId, tagId });
	if (!hasTag) {
		throw new Error("Tag not found.");
	}

	const ownedArticleCount = await repo.countOwnedArticles({
		userId,
		articleIds: uniqueArticleIds,
	});
	if (ownedArticleCount !== uniqueArticleIds.length) {
		throw new Error("One or more articles were not found.");
	}

	await repo.addTagToArticles({ tagId, articleIds: uniqueArticleIds });
	return { success: true };
}

export async function removeTagFromArticlesForUser({
	repo,
	userId,
	tagId,
	articleIds,
}: {
	repo: TagsRepository;
	userId: string;
	tagId: string;
	articleIds: string[];
}) {
	const uniqueArticleIds = Array.from(new Set(articleIds));
	const hasTag = await repo.hasOwnedTag({ userId, tagId });
	if (!hasTag) {
		throw new Error("Tag not found.");
	}

	const ownedArticleCount = await repo.countOwnedArticles({
		userId,
		articleIds: uniqueArticleIds,
	});
	if (ownedArticleCount !== uniqueArticleIds.length) {
		throw new Error("One or more articles were not found.");
	}

	await repo.removeTagFromArticles({ tagId, articleIds: uniqueArticleIds });
	return { success: true };
}
