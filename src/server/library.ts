import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "#/db/index";
import {
	articleContentCache,
	articles,
	articleTags,
	articleTrash,
	readingProgress,
	tags,
} from "#/db/schema";
import { extractArticleContent } from "#/server/article-content";
import { createArticlesRepository } from "#/server/articles-repository";
import { getArticleReaderForUser } from "#/server/articles-service";
import { activeArticle, chunks } from "#/server/db-helpers";
import { requireUserId } from "#/server/helpers";
import {
	getArticleReaderInputSchema,
	validateInput,
} from "#/server/input-schemas";
import { importBackupArticles } from "#/server/library-import";
import {
	deleteTrashForUser,
	finishReadingForUser,
} from "#/server/library-repository";
import {
	backupArticleSchema,
	deleteTrashInputSchema,
} from "#/server/library-schemas";
import { checkRateLimit } from "#/server/rate-limit";

export const refreshArticleContent = createServerFn({ method: "POST" })
	.validator((data: unknown) =>
		validateInput(getArticleReaderInputSchema, data),
	)
	.handler(async ({ data }) => {
		const userId = await requireUserId();
		const limit = await checkRateLimit(
			{ name: "refresh-content", max: 10, windowMs: 60000 },
			userId,
		);
		if (!limit.allowed)
			throw new Error("Please wait a minute before refreshing more articles.");
		return getArticleReaderForUser({
			repo: createArticlesRepository(),
			userId,
			id: data.id,
			extractArticleContentFn: extractArticleContent,
			forceRefresh: true,
		});
	});

export const getTrash = createServerFn({ method: "GET" }).handler(async () => {
	const userId = await requireUserId();
	return getDb()
		.select({
			id: articles.id,
			title: articles.title,
			url: articles.url,
			deletedAt: articleTrash.deletedAt,
		})
		.from(articleTrash)
		.innerJoin(articles, eq(articles.id, articleTrash.articleId))
		.where(eq(articles.userId, userId))
		.orderBy(desc(articleTrash.deletedAt));
});
export const restoreArticles = createServerFn({ method: "POST" })
	.validator((data: unknown) =>
		validateInput(
			z.object({ ids: z.array(z.string().min(1).max(128)).min(1).max(100) }),
			data,
		),
	)
	.handler(async ({ data }) => {
		const userId = await requireUserId();
		const db = getDb();
		const statements = chunks(data.ids, 90).map((ids) =>
			db.delete(articleTrash).where(
				inArray(
					articleTrash.articleId,
					db
						.select({ id: articles.id })
						.from(articles)
						.where(and(eq(articles.userId, userId), inArray(articles.id, ids))),
				),
			),
		);
		await db.batch([statements[0], ...statements.slice(1)]);
		return { success: true };
	});
export const getReadingProgress = createServerFn({ method: "GET" })
	.validator((data: unknown) =>
		validateInput(getArticleReaderInputSchema, data),
	)
	.handler(async ({ data }) => {
		const userId = await requireUserId();
		const [row] = await getDb()
			.select({ progress: readingProgress.progress })
			.from(readingProgress)
			.innerJoin(articles, eq(articles.id, readingProgress.articleId))
			.where(
				and(
					eq(articles.userId, userId),
					eq(articles.id, data.id),
					activeArticle(),
				),
			);
		return row?.progress ?? 0;
	});
export const saveReadingProgress = createServerFn({ method: "POST" })
	.validator((data: unknown) =>
		validateInput(
			z.object({
				id: z.string().min(1).max(128),
				progress: z.number().int().min(0).max(10000),
			}),
			data,
		),
	)
	.handler(async ({ data }) => {
		const userId = await requireUserId();
		const db = getDb();
		const owned = await createArticlesRepository().getArticleById({
			userId,
			id: data.id,
		});
		if (!owned) throw new Error("Article not found.");
		await db
			.insert(readingProgress)
			.values({ articleId: data.id, progress: data.progress })
			.onConflictDoUpdate({
				target: readingProgress.articleId,
				set: { progress: data.progress, updatedAt: new Date() },
			});
		return { success: true };
	});
export const getContinueReading = createServerFn({ method: "GET" }).handler(
	async () => {
		const userId = await requireUserId();
		return getDb()
			.select({
				id: articles.id,
				title: articles.title,
				url: articles.url,
				isRead: articles.isRead,
				progress: readingProgress.progress,
			})
			.from(readingProgress)
			.innerJoin(articles, eq(articles.id, readingProgress.articleId))
			.where(
				and(
					eq(articles.userId, userId),
					activeArticle(),
					sql`${readingProgress.progress} > 0 AND ${readingProgress.progress} < 9800`,
				),
			)
			.orderBy(desc(readingProgress.updatedAt))
			.limit(5);
	},
);
export const exportLibraryPage = createServerFn({ method: "GET" })
	.validator((data: unknown) =>
		validateInput(
			z.object({ offset: z.number().int().min(0).max(10000) }),
			data,
		),
	)
	.handler(async ({ data }) => {
		const userId = await requireUserId();
		const db = getDb();
		const rows = await db
			.select({
				article: articles,
				content: articleContentCache,
				progress: readingProgress.progress,
				deletedAt: articleTrash.deletedAt,
			})
			.from(articles)
			.leftJoin(
				articleContentCache,
				eq(articles.id, articleContentCache.articleId),
			)
			.leftJoin(readingProgress, eq(articles.id, readingProgress.articleId))
			.leftJoin(articleTrash, eq(articles.id, articleTrash.articleId))
			.where(eq(articles.userId, userId))
			.orderBy(articles.id)
			.limit(25)
			.offset(data.offset);
		const ids = rows.map((row) => row.article.id);
		const tagRows = ids.length
			? await db
					.select({
						articleId: articleTags.articleId,
						name: tags.name,
						color: tags.color,
					})
					.from(articleTags)
					.innerJoin(tags, eq(tags.id, articleTags.tagId))
					.where(
						and(eq(tags.userId, userId), inArray(articleTags.articleId, ids)),
					)
			: [];
		return rows.map(({ article, content, progress, deletedAt }) => ({
			url: article.url,
			title: article.title,
			description: article.description,
			faviconUrl: article.faviconUrl,
			isRead: article.isRead,
			isFavorite: article.isFavorite,
			createdAt: article.createdAt.toISOString(),
			readAt: article.readAt?.toISOString() ?? null,
			tags: tagRows
				.filter((tag) => tag.articleId === article.id)
				.map(({ name, color }) => ({ name, color })),
			content:
				content?.status === "ready" &&
				content.markdown &&
				content.plainText &&
				content.wordCount
					? {
							markdown: content.markdown,
							plainText: content.plainText,
							wordCount: content.wordCount,
							fetchedAt: content.fetchedAt.toISOString(),
						}
					: null,
			progress: progress ?? 0,
			trashed: Boolean(deletedAt),
		}));
	});
export const importLibraryBatch = createServerFn({ method: "POST" })
	.validator((data: unknown) =>
		validateInput(z.array(backupArticleSchema).min(1).max(10), data),
	)
	.handler(async ({ data }) =>
		importBackupArticles(await requireUserId(), data),
	);

export const permanentlyDeleteTrash = createServerFn({ method: "POST" })
	.validator((data: unknown) => validateInput(deleteTrashInputSchema, data))
	.handler(async ({ data }) => deleteTrashForUser(await requireUserId(), data));
export const finishReading = createServerFn({ method: "POST" })
	.validator((data: unknown) =>
		validateInput(getArticleReaderInputSchema, data),
	)
	.handler(async ({ data }) =>
		finishReadingForUser(await requireUserId(), data.id),
	);
