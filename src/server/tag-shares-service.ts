import { nanoid } from "nanoid";
import { SHARED_TAG_PAGE_SIZE } from "#/lib/shared-tag";

export type TagShareRecord = {
	tagId: string;
	token: string;
	createdAt: Date;
};

export type SharedArticleRecord = {
	url: string;
	title: string | null;
	description: string | null;
	hostname: string | null;
	faviconUrl: string | null;
	createdAt: Date;
};

export type SharedTagRecord = {
	ownerFirstName: string;
	tagName: string;
	articles: {
		items: SharedArticleRecord[];
		total: number;
	};
};

export type TagSharesRepository = {
	getOwnedTagShare: (args: {
		userId: string;
		tagId: string;
	}) => Promise<TagShareRecord | null>;
	hasOwnedTag: (args: { userId: string; tagId: string }) => Promise<boolean>;
	insertTagShare: (args: {
		tagId: string;
		token: string;
	}) => Promise<TagShareRecord | null>;
	deleteTagShare: (tagId: string) => Promise<void>;
	getSharedTag: (args: {
		token: string;
		limit: number;
		offset: number;
	}) => Promise<{
		ownerName: string;
		tagName: string;
		items: SharedArticleRecord[];
		total: number;
	} | null>;
};

export async function getTagShareForUser({
	repo,
	userId,
	tagId,
}: {
	repo: TagSharesRepository;
	userId: string;
	tagId: string;
}) {
	return repo.getOwnedTagShare({ userId, tagId });
}

export async function createTagShareForUser({
	repo,
	userId,
	tagId,
	generateTokenFn = generateTagShareToken,
}: {
	repo: TagSharesRepository;
	userId: string;
	tagId: string;
	generateTokenFn?: () => string;
}) {
	const existing = await repo.getOwnedTagShare({ userId, tagId });
	if (existing) {
		return existing;
	}

	if (!(await repo.hasOwnedTag({ userId, tagId }))) {
		throw new Error("Tag not found.");
	}

	for (let attempt = 0; attempt < 2; attempt += 1) {
		const created = await repo.insertTagShare({
			tagId,
			token: generateTokenFn(),
		});
		if (created) {
			return created;
		}

		const concurrentShare = await repo.getOwnedTagShare({ userId, tagId });
		if (concurrentShare) {
			return concurrentShare;
		}
	}

	throw new Error("Failed to create sharing link.");
}

export async function revokeTagShareForUser({
	repo,
	userId,
	tagId,
}: {
	repo: TagSharesRepository;
	userId: string;
	tagId: string;
}) {
	if (!(await repo.hasOwnedTag({ userId, tagId }))) {
		throw new Error("Tag not found.");
	}

	await repo.deleteTagShare(tagId);
	return { success: true };
}

export async function getSharedTagByToken({
	repo,
	token,
	page = 1,
}: {
	repo: TagSharesRepository;
	token: string;
	page?: number;
}): Promise<SharedTagRecord | null> {
	const shared = await repo.getSharedTag({
		token,
		limit: SHARED_TAG_PAGE_SIZE,
		offset: (page - 1) * SHARED_TAG_PAGE_SIZE,
	});
	if (!shared) {
		return null;
	}

	return {
		ownerFirstName: getFirstName(shared.ownerName),
		tagName: shared.tagName,
		articles: {
			items: shared.items,
			total: shared.total,
		},
	};
}

export function getFirstName(name: string) {
	return name.trim().split(/\s+/)[0] || "Someone";
}

function generateTagShareToken() {
	return `hss_${nanoid(32)}`;
}
