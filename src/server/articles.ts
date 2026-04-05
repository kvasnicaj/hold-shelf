import { createServerFn } from "@tanstack/react-start";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "#/db/index";
import { articles, articleTags, tags } from "#/db/schema";
import {
	handleCreateArticle,
	handleDeleteArticles,
	handleGetArticles,
	handleUpdateArticle,
	validateCreateArticleInput,
	validateDeleteArticlesInput,
	validateGetArticlesInput,
	validateUpdateArticleInput,
} from "#/server/articles-runtime";
import type { ArticlesRepository } from "#/server/articles-service";
import { requireUserId } from "#/server/helpers";

function createArticlesRepository(): ArticlesRepository {
	const db = getDb();

	return {
		listArticles: async ({
			userId,
			isRead,
			tagId,
			search,
			sort,
			limit,
			offset,
		}) => {
			const conditions = [eq(articles.userId, userId)];

			if (isRead !== undefined) {
				conditions.push(eq(articles.isRead, isRead));
			}

			if (tagId) {
				const articleIdsWithTag = db
					.select({ articleId: articleTags.articleId })
					.from(articleTags)
					.where(eq(articleTags.tagId, tagId));

				conditions.push(inArray(articles.id, articleIdsWithTag));
			}

			if (search?.trim()) {
				const term = `%${search.trim()}%`;
				conditions.push(
					sql`(${articles.title} LIKE ${term} OR ${articles.description} LIKE ${term})`,
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
					.orderBy(orderBy)
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
		findArticleByUrl: async ({ userId, url }) => {
			const [existing] = await db
				.select({ id: articles.id })
				.from(articles)
				.where(and(eq(articles.userId, userId), eq(articles.url, url)))
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
				.returning();

			return article;
		},
		updateArticle: async ({ userId, id, changes }) => {
			await db
				.update(articles)
				.set(changes)
				.where(and(eq(articles.id, id), eq(articles.userId, userId)));
		},
		deleteArticles: async ({ userId, ids }) => {
			await db
				.delete(articles)
				.where(and(inArray(articles.id, ids), eq(articles.userId, userId)));
		},
	};
}

export const getArticles = createServerFn({ method: "GET" })
	.inputValidator(validateGetArticlesInput)
	.handler(async ({ data }) =>
		handleGetArticles(data, {
			createRepository: createArticlesRepository,
			requireUserIdFn: requireUserId,
		}),
	);

export const createArticle = createServerFn({ method: "POST" })
	.inputValidator(validateCreateArticleInput)
	.handler(async ({ data }) =>
		handleCreateArticle(data, {
			createRepository: createArticlesRepository,
			requireUserIdFn: requireUserId,
		}),
	);

export const updateArticle = createServerFn({ method: "POST" })
	.inputValidator(validateUpdateArticleInput)
	.handler(async ({ data }) =>
		handleUpdateArticle(data, {
			createRepository: createArticlesRepository,
			requireUserIdFn: requireUserId,
		}),
	);

export const deleteArticles = createServerFn({ method: "POST" })
	.inputValidator(validateDeleteArticlesInput)
	.handler(async ({ data }) =>
		handleDeleteArticles(data, {
			createRepository: createArticlesRepository,
			requireUserIdFn: requireUserId,
		}),
	);
