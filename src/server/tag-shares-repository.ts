import { and, desc, eq, sql } from "drizzle-orm";
import { getDb } from "#/db/index";
import { articles, articleTags, tagShares, tags, user } from "#/db/schema";
import type { TagSharesRepository } from "#/server/tag-shares-service";

export function createTagSharesRepository(): TagSharesRepository {
	const db = getDb();

	return {
		getOwnedTagShare: async ({ userId, tagId }) => {
			const [share] = await db
				.select({
					tagId: tagShares.tagId,
					token: tagShares.token,
					createdAt: tagShares.createdAt,
				})
				.from(tagShares)
				.innerJoin(tags, eq(tags.id, tagShares.tagId))
				.where(and(eq(tagShares.tagId, tagId), eq(tags.userId, userId)))
				.limit(1);

			return share ?? null;
		},
		hasOwnedTag: async ({ userId, tagId }) => {
			const [ownedTag] = await db
				.select({ id: tags.id })
				.from(tags)
				.where(and(eq(tags.id, tagId), eq(tags.userId, userId)))
				.limit(1);

			return !!ownedTag;
		},
		insertTagShare: async ({ tagId, token }) => {
			const [share] = await db
				.insert(tagShares)
				.values({ tagId, token })
				.onConflictDoNothing()
				.returning();

			return share ?? null;
		},
		deleteTagShare: async (tagId) => {
			await db.delete(tagShares).where(eq(tagShares.tagId, tagId));
		},
		getSharedTag: async ({ token, limit, offset }) => {
			const [share] = await db
				.select({
					tagId: tags.id,
					tagName: tags.name,
					ownerId: tags.userId,
					ownerName: user.name,
				})
				.from(tagShares)
				.innerJoin(tags, eq(tags.id, tagShares.tagId))
				.innerJoin(user, eq(user.id, tags.userId))
				.where(eq(tagShares.token, token))
				.limit(1);

			if (!share) {
				return null;
			}

			const conditions = and(
				eq(articleTags.tagId, share.tagId),
				eq(articles.userId, share.ownerId),
			);
			const [items, countRows] = await Promise.all([
				db
					.select({
						url: articles.url,
						title: articles.title,
						description: articles.description,
						hostname: articles.hostname,
						faviconUrl: articles.faviconUrl,
						createdAt: articles.createdAt,
					})
					.from(articleTags)
					.innerJoin(articles, eq(articles.id, articleTags.articleId))
					.where(conditions)
					.orderBy(desc(articles.createdAt))
					.limit(limit)
					.offset(offset),
				db
					.select({ count: sql<number>`count(*)` })
					.from(articleTags)
					.innerJoin(articles, eq(articles.id, articleTags.articleId))
					.where(conditions),
			]);

			return {
				ownerName: share.ownerName,
				tagName: share.tagName,
				items,
				total: countRows[0]?.count ?? 0,
			};
		},
	};
}
