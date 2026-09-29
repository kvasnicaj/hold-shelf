import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "#/db/index";
import {
	articleContentCache,
	articles,
	articleTags,
	articleTrash,
	tags,
} from "#/db/schema";
import { extractArticleContent } from "#/server/article-content";
import type { ArticlesRepository } from "#/server/articles-service";
import {
	ArticleAlreadyExistsError,
	getCachedArticleContent,
} from "#/server/articles-service";
import { scheduleBackground } from "#/server/background";
import { activeArticle, chunks } from "#/server/db-helpers";

export function createArticlesRepository(): ArticlesRepository {
	const db = getDb();

	return {
		listArticles: async ({
			userId,
			isRead,
			isFavorite,
			tagId,
			tagIds,
			search,
			sort,
			limit,
			offset,
		}) => {
			const conditions = [eq(articles.userId, userId), activeArticle()];

			if (isRead !== undefined) {
				conditions.push(eq(articles.isRead, isRead));
			}

			if (isFavorite !== undefined) {
				conditions.push(eq(articles.isFavorite, isFavorite));
			}

			const selectedTagIds = tagIds?.length ? tagIds : tagId ? [tagId] : [];

			if (selectedTagIds.length > 0) {
				const articleIdsWithTag = db
					.select({ articleId: articleTags.articleId })
					.from(articleTags)
					.where(inArray(articleTags.tagId, selectedTagIds));

				conditions.push(inArray(articles.id, articleIdsWithTag));
			}

			if (search?.trim()) {
				const term = `%${search.trim()}%`;
				conditions.push(
					sql`(${articles.title} LIKE ${term} OR ${articles.description} LIKE ${term} OR ${articles.url} LIKE ${term} OR ${articles.hostname} LIKE ${term} OR EXISTS (SELECT 1 FROM article_content_cache WHERE article_content_cache.article_id = ${articles.id} AND article_content_cache.plain_text LIKE ${term}))`,
				);
			}

			const where = and(...conditions);
			const orderBy =
				sort === "oldest"
					? asc(articles.createdAt)
					: sort === "title"
						? asc(articles.title)
						: desc(articles.createdAt);

			const [rows, countResult] = await Promise.all([
				db
					.select()
					.from(articles)
					.where(where)
					.orderBy(orderBy, asc(articles.id))
					.limit(limit)
					.offset(offset),
				db.select({ count: sql<number>`count(*)` }).from(articles).where(where),
			]);

			return {
				rows,
				total: countResult[0]?.count ?? 0,
			};
		},
		listArticleTags: async (articleIds) => {
			if (articleIds.length === 0) {
				return [];
			}

			return db
				.select({
					articleId: articleTags.articleId,
					id: tags.id,
					name: tags.name,
					color: tags.color,
				})
				.from(articleTags)
				.innerJoin(tags, eq(articleTags.tagId, tags.id))
				.where(inArray(articleTags.articleId, articleIds));
		},
		getArticleById: async ({ userId, id }) => {
			const [article] = await db
				.select()
				.from(articles)
				.where(
					and(
						eq(articles.userId, userId),
						eq(articles.id, id),
						activeArticle(),
					),
				)
				.limit(1);

			return article ?? null;
		},
		findArticleByUrl: async ({ userId, url }) => {
			const [existing] = await db
				.select({ id: articles.id })
				.from(articles)
				.where(
					and(
						eq(articles.userId, userId),
						eq(articles.url, url),
						activeArticle(),
					),
				)
				.limit(1);

			return existing ?? null;
		},
		createArticle: async ({ userId, url, metadata }) => {
			const [article] = await db
				.insert(articles)
				.values({
					userId,
					url,
					title: metadata.title,
					description: metadata.description,
					hostname: metadata.hostname,
					faviconUrl: metadata.faviconUrl,
				})
				.onConflictDoNothing()
				.returning();

			if (!article) {
				const [existing] = await db
					.select()
					.from(articles)
					.where(and(eq(articles.userId, userId), eq(articles.url, url)))
					.limit(1);
				if (existing) {
					const restored = await db
						.delete(articleTrash)
						.where(eq(articleTrash.articleId, existing.id))
						.returning();
					if (restored.length) return existing;
					throw new ArticleAlreadyExistsError({ articleId: existing.id, url });
				}
				throw new Error("Could not save article.");
			}
			scheduleBackground(() =>
				getCachedArticleContent({
					repo: createArticlesRepository(),
					articleId: article.id,
					sourceUrl: article.url,
					extractArticleContentFn: extractArticleContent,
					now: () => new Date(),
				}),
			);
			return article;
		},
		getArticleContentCache: async (articleId) => {
			const [cache] = await db
				.select()
				.from(articleContentCache)
				.where(eq(articleContentCache.articleId, articleId))
				.limit(1);

			return cache ?? null;
		},
		upsertArticleContentCache: async (data) => {
			const [cache] = await db
				.insert(articleContentCache)
				.values(data)
				.onConflictDoUpdate({
					target: articleContentCache.articleId,
					set: {
						status: data.status,
						markdown: data.markdown,
						plainText: data.plainText,
						wordCount: data.wordCount,
						failureReason: data.failureReason,
						sourceUrl: data.sourceUrl,
						extractionVersion: data.extractionVersion,
						fetchedAt: data.fetchedAt,
						updatedAt: data.updatedAt,
					},
				})
				.returning();

			if (!cache) {
				throw new Error("Failed to store article content cache.");
			}

			return cache;
		},
		updateArticle: async ({ userId, id, changes }) => {
			await db
				.update(articles)
				.set(changes)
				.where(and(eq(articles.id, id), eq(articles.userId, userId)));
		},
		deleteArticles: async ({ userId, ids }) => {
			const owned = (
				await Promise.all(
					chunks(ids, 90).map((batch) =>
						db
							.select({ id: articles.id })
							.from(articles)
							.where(
								and(inArray(articles.id, batch), eq(articles.userId, userId)),
							),
					),
				)
			).flat();
			const statements = chunks(owned).map((batch) =>
				db
					.insert(articleTrash)
					.values(batch.map(({ id }) => ({ articleId: id })))
					.onConflictDoNothing(),
			);
			if (statements.length)
				await db.batch([statements[0], ...statements.slice(1)]);
		},
	};
}
