import { and, desc, eq, sql } from "drizzle-orm";
import { getDb } from "#/db/index";
import { articles, articleTags, tagShares, tags, user } from "#/db/schema";
import { activeArticle } from "#/server/db-helpers";
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
			// One statement, so the token check and the article page read the same
			// D1 snapshot: a revoked link can never return articles tagged later.
			const share = db.$with("share").as(
				db
					.select({
						tagId: sql<string>`${tags.id}`.as("share_tag_id"),
						ownerId: sql<string>`${tags.userId}`.as("share_owner_id"),
						tagName: sql<string>`${tags.name}`.as("share_tag_name"),
						ownerName: sql<string>`${user.name}`.as("share_owner_name"),
					})
					.from(tagShares)
					.innerJoin(tags, eq(tags.id, tagShares.tagId))
					.innerJoin(user, eq(user.id, tags.userId))
					.where(eq(tagShares.token, token))
					.limit(1),
			);
			const shared = db.$with("shared").as(
				db
					.select({
						id: articles.id,
						url: articles.url,
						title: articles.title,
						description: articles.description,
						hostname: articles.hostname,
						faviconUrl: articles.faviconUrl,
						createdAt: articles.createdAt,
					})
					.from(share)
					.innerJoin(articleTags, eq(articleTags.tagId, share.tagId))
					.innerJoin(
						articles,
						and(
							eq(articles.id, articleTags.articleId),
							eq(articles.userId, share.ownerId),
						),
					)
					.where(activeArticle()),
			);
			const page = db
				.$with("page")
				.as(
					db
						.select()
						.from(shared)
						.orderBy(desc(shared.createdAt), desc(shared.id))
						.limit(limit)
						.offset(offset),
				);
			const rows = await db
				.with(share, shared, page)
				.select({
					tagName: share.tagName,
					ownerName: share.ownerName,
					total: sql<number>`(SELECT count(*) FROM ${shared})`,
					article: {
						url: page.url,
						title: page.title,
						description: page.description,
						hostname: page.hostname,
						faviconUrl: page.faviconUrl,
						createdAt: page.createdAt,
					},
				})
				.from(share)
				.leftJoin(page, sql`1 = 1`)
				.orderBy(desc(page.createdAt), desc(page.id));

			const [first] = rows;
			if (!first) {
				return null;
			}

			return {
				ownerName: first.ownerName,
				tagName: first.tagName,
				items: rows.flatMap((row) => (row.article ? [row.article] : [])),
				total: Number(first.total),
			};
		},
	};
}
